
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
   * Assign an order to specific restaurants (post-trigger creation)
   */
  async assignOrderToRestaurants(
    orderId: string, 
    restaurantIds: string[]
  ): Promise<boolean> {
    try {
      console.log(`Assigning order ${orderId} to specific restaurants:`, restaurantIds);

      // Update existing pending assignment or create new ones for specific restaurants
      const assignments = restaurantIds.map(restaurantId => ({
        order_id: orderId,
        restaurant_id: restaurantId,
        status: 'pending',
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      }));

      // First, update or replace the auto-created assignment
      const { error: updateError } = await supabase
        .from('restaurant_assignments')
        .update({
          restaurant_id: restaurantIds[0], // Assign first restaurant
          status: 'pending'
        })
        .eq('order_id', orderId)
        .eq('status', 'pending')
        .is('restaurant_id', null);

      if (updateError) {
        console.error('Error updating initial assignment:', updateError);
      }

      // Create additional assignments for other restaurants if multiple
      if (restaurantIds.length > 1) {
        const additionalAssignments = assignments.slice(1);
        const { error: assignmentError } = await supabase
          .from('restaurant_assignments')
          .insert(additionalAssignments);

        if (assignmentError) {
          console.error('Error creating additional assignments:', assignmentError);
          return false;
        }
      }

      // Update order status to indicate assignment
      await this.updateOrderStatus(orderId, 'awaiting_restaurant');

      console.log(`Successfully assigned order to ${restaurantIds.length} restaurants`);
      return true;
    } catch (error) {
      console.error('Error in assignOrderToRestaurants:', error);
      return false;
    }
  },

  /**
   * Handle restaurant response to order assignment (leverages triggers)
   */
  async handleRestaurantResponse(
    assignmentId: string,
    restaurantId: string,
    action: 'accept' | 'reject',
    notes?: string
  ): Promise<boolean> {
    try {
      console.log(`Restaurant ${restaurantId} ${action}ing assignment ${assignmentId}`);

      // Update the assignment - this will trigger the order update automatically
      const { data: assignment, error: updateError } = await supabase
        .from('restaurant_assignments')
        .update({
          status: action === 'accept' ? 'accepted' : 'rejected',
          responded_at: new Date().toISOString(),
          response_notes: notes,
          restaurant_id: restaurantId // Ensure restaurant_id is set
        })
        .eq('id', assignmentId)
        .eq('status', 'pending')
        .select()
        .single();

      if (updateError || !assignment) {
        console.error('Error updating assignment:', updateError);
        return false;
      }

      console.log(`Assignment ${action}ed successfully, triggers will handle order update`);

      if (action === 'reject') {
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
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string, restaurantId?: string): Promise<boolean> {
    try {
      const updateData: any = { status };
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
   * Get restaurant's pending assignments (improved query)
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
          status,
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
   * Handle expired assignments
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

      // Check orders with no pending assignments
      const orderIds = [...new Set(expiredAssignments.map(a => a.order_id))];
      
      for (const orderId of orderIds) {
        const { data: pendingAssignments } = await supabase
          .from('restaurant_assignments')
          .select('id')
          .eq('order_id', orderId)
          .eq('status', 'pending');

        if (!pendingAssignments?.length) {
          await this.updateOrderStatus(orderId, 'no_restaurant_accepted');
        }
      }

      return expiredAssignments.length;
    } catch (error) {
      console.error('Error handling expired assignments:', error);
      return 0;
    }
  }
};

