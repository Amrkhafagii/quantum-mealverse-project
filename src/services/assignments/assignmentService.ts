
import { supabase } from '@/integrations/supabase/client';
import type { RestaurantAssignment } from '@/types/notifications';
import { PreparationStageService } from '@/services/preparation/preparationStageService';

export class AssignmentService {
  // Get pending assignments for a restaurant
  async getPendingAssignments(restaurantId: string): Promise<RestaurantAssignment[]> {
    console.log('Getting pending assignments for restaurant:', restaurantId);
    
    const { data, error } = await supabase
      .from('restaurant_assignments')
      .select(`
        *,
        orders:orders!restaurant_assignments_order_id_fkey(
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
      throw error;
    }
    
    console.log('Raw pending assignments data:', data);
    
    return (data || []).map(assignment => ({
      ...assignment,
      status: assignment.status as RestaurantAssignment['status'],
      assigned_at: assignment.created_at,
      details: {}
    }));
  }

  // Accept an order assignment
  async acceptAssignment(assignmentId: string, notes?: string): Promise<void> {
    console.log('Accepting assignment:', assignmentId, 'with notes:', notes);
    
    // Get assignment details first
    const { data: assignment, error: fetchError } = await supabase
      .from('restaurant_assignments')
      .select('order_id, restaurant_id')
      .eq('id', assignmentId)
      .single();

    if (fetchError || !assignment) {
      console.error('Error fetching assignment details:', fetchError);
      throw new Error('Failed to fetch assignment details');
    }

    // Update the assignment status
    const { error } = await supabase
      .from('restaurant_assignments')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString(),
        response_notes: notes
      })
      .eq('id', assignmentId);

    if (error) {
      console.error('Error accepting assignment:', error);
      throw error;
    }

    // Update order status
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        status: 'restaurant_accepted',
        restaurant_id: assignment.restaurant_id
      })
      .eq('id', assignment.order_id);

    if (orderUpdateError) {
      console.error('Error updating order status:', orderUpdateError);
      throw orderUpdateError;
    }

    // Initialize preparation stages for the accepted order
    try {
      console.log('Initializing preparation stages for order:', assignment.order_id);
      const stagesCreated = await PreparationStageService.initializeOrderStages(
        assignment.order_id,
        assignment.restaurant_id
      );
      
      if (stagesCreated) {
        console.log('Preparation stages created successfully');
        
        // Start the first stage (received) automatically
        const firstStageStarted = await PreparationStageService.startStage(
          assignment.order_id,
          'received'
        );
        
        if (firstStageStarted) {
          console.log('First preparation stage (received) started successfully');
        } else {
          console.warn('Failed to start first preparation stage');
        }
      } else {
        console.error('Failed to create preparation stages');
        // Don't throw error here to avoid breaking the assignment acceptance
        // The order is still accepted, just without preparation tracking
      }
    } catch (stageError) {
      console.error('Error initializing preparation stages:', stageError);
      // Log the error but don't fail the assignment acceptance
      // The restaurant can manually create stages if needed
    }
  }

  // Reject an order assignment
  async rejectAssignment(assignmentId: string, reason?: string): Promise<void> {
    console.log('Rejecting assignment:', assignmentId, 'with reason:', reason);
    
    const { error } = await supabase
      .from('restaurant_assignments')
      .update({
        status: 'rejected',
        responded_at: new Date().toISOString(),
        response_notes: reason
      })
      .eq('id', assignmentId);

    if (error) {
      console.error('Error rejecting assignment:', error);
      throw error;
    }
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

    if (error) {
      console.error('Error fetching assignment history:', error);
      throw error;
    }
    
    return (data || []).map(assignment => ({
      ...assignment,
      status: assignment.status as RestaurantAssignment['status'],
      assigned_at: assignment.created_at,
      details: {}
    }));
  }

  // Subscribe to new assignments
  subscribeToAssignments(
    restaurantId: string,
    callback: (assignment: RestaurantAssignment) => void
  ) {
    console.log('Setting up real-time subscription for restaurant:', restaurantId);
    
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
          console.log('Received new assignment via realtime:', payload.new);
          const assignment = payload.new as any;
          callback({
            ...assignment,
            status: assignment.status as RestaurantAssignment['status'],
            assigned_at: assignment.created_at || assignment.assigned_at,
            details: {}
          });
        }
      )
      .subscribe();
  }
}

export const assignmentService = new AssignmentService();
