
import { supabase } from '@/integrations/supabase/client';

export interface OrderAssignment {
  id: string;
  order_id: string;
  restaurant_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  assigned_at: string;
  expires_at: string;
  responded_at?: string;
  response_notes?: string;
}

export interface OrderNotification {
  id: string;
  order_id: string;
  restaurant_id?: string;
  user_id?: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const orderAssignmentService = {
  /**
   * Assign an order to restaurants based on location
   */
  async assignOrderToRestaurants(orderId: string, latitude: number, longitude: number): Promise<boolean> {
    try {
      // Find nearest restaurants
      const { data: nearbyRestaurants, error } = await supabase.rpc('find_nearest_restaurant', {
        order_lat: latitude,
        order_lng: longitude,
        max_distance_km: 50
      });

      if (error || !nearbyRestaurants?.length) {
        console.error('No restaurants found nearby:', error);
        await this.updateOrderStatus(orderId, 'no_restaurant_available');
        return false;
      }

      // Create assignments for all nearby restaurants
      const assignments = nearbyRestaurants.map(restaurant => ({
        order_id: orderId,
        restaurant_id: restaurant.restaurant_id,
        status: 'pending',
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      }));

      const { error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .insert(assignments);

      if (assignmentError) {
        console.error('Error creating assignments:', assignmentError);
        return false;
      }

      // Update order status
      await this.updateOrderStatus(orderId, 'awaiting_restaurant');

      return true;
    } catch (error) {
      console.error('Error in assignOrderToRestaurants:', error);
      return false;
    }
  },

  /**
   * Handle restaurant response to order assignment
   */
  async handleRestaurantResponse(
    assignmentId: string,
    restaurantId: string,
    action: 'accept' | 'reject',
    notes?: string
  ): Promise<boolean> {
    try {
      // Update the assignment
      const { data: assignment, error: updateError } = await supabase
        .from('restaurant_assignments')
        .update({
          status: action === 'accept' ? 'accepted' : 'rejected',
          responded_at: new Date().toISOString(),
          response_notes: notes
        })
        .eq('id', assignmentId)
        .eq('restaurant_id', restaurantId)
        .eq('status', 'pending')
        .select()
        .single();

      if (updateError || !assignment) {
        console.error('Error updating assignment:', updateError);
        return false;
      }

      // Record in history
      await supabase.from('restaurant_assignment_history').insert({
        order_id: assignment.order_id,
        restaurant_id: restaurantId,
        status: action === 'accept' ? 'accepted' : 'rejected',
        notes
      });

      if (action === 'accept') {
        // Cancel other pending assignments
        await supabase
          .from('restaurant_assignments')
          .update({ status: 'cancelled' })
          .eq('order_id', assignment.order_id)
          .eq('status', 'pending')
          .neq('id', assignmentId);

        // Update order
        await supabase
          .from('orders')
          .update({
            restaurant_id: restaurantId,
            status: 'restaurant_accepted',
            accepted_at: new Date().toISOString()
          })
          .eq('id', assignment.order_id);
      } else {
        // Check if any assignments are still pending
        const { data: pendingAssignments } = await supabase
          .from('restaurant_assignments')
          .select('id')
          .eq('order_id', assignment.order_id)
          .eq('status', 'pending');

        if (!pendingAssignments?.length) {
          await this.updateOrderStatus(assignment.order_id, 'no_restaurant_accepted');
        }
      }

      return true;
    } catch (error) {
      console.error('Error in handleRestaurantResponse:', error);
      return false;
    }
  },

  /**
   * Update order status with proper tracking
   */
  async updateOrderStatus(orderId: string, status: string, restaurantId?: string): Promise<boolean> {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      // Add timestamp fields based on status
      switch (status) {
        case 'restaurant_accepted':
          updateData.accepted_at = new Date().toISOString();
          break;
        case 'preparing':
          updateData.preparation_started_at = new Date().toISOString();
          break;
        case 'ready_for_pickup':
          updateData.ready_at = new Date().toISOString();
          break;
        case 'on_the_way':
          updateData.picked_up_at = new Date().toISOString();
          break;
        case 'delivered':
          updateData.delivered_at = new Date().toISOString();
          break;
      }

      if (restaurantId) {
        updateData.restaurant_id = restaurantId;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      return !error;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  },

  /**
   * Get restaurant assignments for an order
   */
  async getOrderAssignments(orderId: string): Promise<OrderAssignment[]> {
    const { data, error } = await supabase
      .from('restaurant_assignments')
      .select(`
        *,
        restaurants(name, address)
      `)
      .eq('order_id', orderId)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get restaurant's pending assignments
   */
  async getRestaurantPendingAssignments(restaurantId: string): Promise<OrderAssignment[]> {
    const { data, error } = await supabase
      .from('restaurant_assignments')
      .select(`
        *,
        orders(
          id,
          customer_name,
          customer_phone,
          delivery_address,
          total,
          created_at,
          order_items(*)
        )
      `)
      .eq('restaurant_id', restaurantId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('assigned_at', { ascending: true });

    if (error) {
      console.error('Error fetching pending assignments:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Handle expired assignments
   */
  async handleExpiredAssignments(): Promise<number> {
    try {
      const { data } = await supabase.rpc('handle_expired_assignments');
      return data || 0;
    } catch (error) {
      console.error('Error handling expired assignments:', error);
      return 0;
    }
  }
};
