
import { supabase } from '@/integrations/supabase/client';
import type { RestaurantAssignment } from '@/types/notifications';

export class AssignmentService {
  // Get pending assignments for a restaurant
  async getPendingAssignments(restaurantId: string): Promise<RestaurantAssignment[]> {
    const { data, error } = await supabase
      .from('restaurant_assignments')
      .select(`
        *,
        orders!inner(
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

    if (error) throw error;
    return data || [];
  }

  // Accept an order assignment
  async acceptAssignment(assignmentId: string, notes?: string): Promise<void> {
    const { error } = await supabase
      .from('restaurant_assignments')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString(),
        response_notes: notes
      })
      .eq('id', assignmentId);

    if (error) throw error;

    // Update order status
    const { data: assignment } = await supabase
      .from('restaurant_assignments')
      .select('order_id, restaurant_id')
      .eq('id', assignmentId)
      .single();

    if (assignment) {
      await supabase
        .from('orders')
        .update({
          status: 'restaurant_accepted',
          restaurant_id: assignment.restaurant_id
        })
        .eq('id', assignment.order_id);
    }
  }

  // Reject an order assignment
  async rejectAssignment(assignmentId: string, reason?: string): Promise<void> {
    const { error } = await supabase
      .from('restaurant_assignments')
      .update({
        status: 'rejected',
        responded_at: new Date().toISOString(),
        response_notes: reason
      })
      .eq('id', assignmentId);

    if (error) throw error;
  }

  // Get assignment history
  async getAssignmentHistory(restaurantId: string, limit = 20): Promise<RestaurantAssignment[]> {
    const { data, error } = await supabase
      .from('restaurant_assignments')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .in('status', ['accepted', 'rejected', 'expired'])
      .order('responded_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Subscribe to new assignments
  subscribeToAssignments(
    restaurantId: string,
    callback: (assignment: RestaurantAssignment) => void
  ) {
    return supabase
      .channel(`restaurant-assignments-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'restaurant_assignments',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        (payload) => {
          callback(payload.new as RestaurantAssignment);
        }
      )
      .subscribe();
  }
}

export const assignmentService = new AssignmentService();
