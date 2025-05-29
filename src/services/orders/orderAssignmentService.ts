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
   * Create a direct assignment for pre-assigned restaurants (nutrition-generated orders)
   */
  async createDirectAssignment(
    orderId: string, 
    restaurantId: string, 
    metadata: any = {}
  ): Promise<boolean> {
    try {
      console.log('Creating direct restaurant assignment:', {
        orderId,
        restaurantId,
        metadata
      });

      // Create restaurant assignment record with unified tracking
      const { error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .insert({
          order_id: orderId,
          restaurant_id: restaurantId,
          status: 'pending',
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
          assignment_metadata: metadata,
          assignment_source: 'nutrition_generated' // Track source for unified experience
        });

      if (assignmentError) {
        console.error('Error creating direct assignment:', assignmentError);
        return false;
      }

      // Update order with unified status tracking
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'restaurant_assigned',
          restaurant_id: restaurantId,
          assignment_source: 'nutrition_generated',
          assigned_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order for direct assignment:', orderError);
        return false;
      }

      console.log('Direct assignment created successfully with unified tracking');
      return true;
    } catch (error) {
      console.error('Error in createDirectAssignment:', error);
      return false;
    }
  },

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
   * Handle restaurant response to order assignment with unified tracking
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

      if (action === 'accept') {
        // Cancel other pending assignments
        await supabase
          .from('restaurant_assignments')
          .update({ status: 'cancelled' })
          .eq('order_id', assignment.order_id)
          .eq('status', 'pending')
          .neq('id', assignmentId);

        // Update order with unified tracking - use proper timestamp fields
        await supabase
          .from('orders')
          .update({
            restaurant_id: restaurantId,
            status: 'restaurant_accepted',
            accepted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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
   * Update order status with unified tracking and proper timestamp fields
   */
  async updateOrderStatus(orderId: string, status: string, restaurantId?: string): Promise<boolean> {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      // Add timestamp fields based on status for unified tracking
      switch (status) {
        case 'restaurant_assigned':
          updateData.assigned_at = new Date().toISOString();
          break;
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
        case 'cancelled':
          updateData.cancelled_at = new Date().toISOString();
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
  async getOrderAssignments(orderId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('restaurant_assignments')
      .select(`
        *,
        restaurants!restaurant_assignments_restaurant_id_fkey(name, address)
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get restaurant's pending assignments
   */
  async getRestaurantPendingAssignments(restaurantId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('restaurant_assignments')
      .select(`
        *,
        orders!restaurant_assignments_order_id_fkey(
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
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching pending assignments:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Handle expired assignments (simplified version without RPC call)
   */
  async handleExpiredAssignments(): Promise<number> {
    try {
      const now = new Date().toISOString();
      
      // Find expired assignments
      const { data: expiredAssignments } = await supabase
        .from('restaurant_assignments')
        .select('id, order_id')
        .eq('status', 'pending')
        .lt('expires_at', now);

      if (!expiredAssignments?.length) {
        return 0;
      }

      // Update expired assignments
      const { error } = await supabase
        .from('restaurant_assignments')
        .update({ status: 'expired' })
        .in('id', expiredAssignments.map(a => a.id));

      if (error) {
        console.error('Error updating expired assignments:', error);
        return 0;
      }

      return expiredAssignments.length;
    } catch (error) {
      console.error('Error handling expired assignments:', error);
      return 0;
    }
  }
};
