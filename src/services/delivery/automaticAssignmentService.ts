
import { supabase } from '@/integrations/supabase/client';
import { DeliveryAssignment } from '@/types/delivery-assignment';
import { restaurantDeliveryHandoffService } from './restaurantDeliveryHandoffService';

export class AutomaticAssignmentService {
  // Get pending assignments for a delivery user
  async getPendingAssignments(deliveryUserId: string): Promise<DeliveryAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('delivery_assignments')
        .select(`
          *,
          orders:order_id (
            id,
            customer_name,
            delivery_address,
            latitude,
            longitude,
            total,
            status,
            created_at,
            restaurant:restaurants!orders_restaurant_id_fkey (
              id,
              name,
              address,
              latitude,
              longitude
            )
          )
        `)
        .eq('delivery_user_id', deliveryUserId)
        .eq('status', 'assigned')
        .gt('expires_at', new Date().toISOString())
        .order('priority_score', { ascending: false });

      if (error) throw error;

      // Transform the data to match the DeliveryAssignment type
      const assignments = (data || []).map(assignment => {
        const order = assignment.orders as any;
        const restaurant = order?.restaurant as any || {};
        
        return {
          ...assignment,
          restaurant: restaurant ? {
            name: restaurant.name || 'Unknown Restaurant',
            address: restaurant.address || '',
            latitude: restaurant.latitude || 0,
            longitude: restaurant.longitude || 0,
          } : undefined,
          customer: {
            name: order?.customer_name || 'Customer',
            address: order?.delivery_address || '',
            latitude: order?.latitude || 0,
            longitude: order?.longitude || 0,
          },
          status: assignment.status as DeliveryAssignment['status'],
        };
      }).filter(Boolean) as DeliveryAssignment[];

      return assignments;
    } catch (error) {
      console.error('Error fetching pending assignments:', error);
      throw error;
    }
  }

  // Accept assignment
  async acceptAssignment(assignmentId: string): Promise<void> {
    try {
      // Get assignment details
      const { data: assignment, error: getError } = await supabase
        .from('delivery_assignments')
        .select('delivery_user_id')
        .eq('id', assignmentId)
        .single();

      if (getError || !assignment) throw getError || new Error('Assignment not found');

      // Use the handoff service to handle the acceptance
      const success = await restaurantDeliveryHandoffService.handleAssignmentResponse(
        assignmentId,
        assignment.delivery_user_id,
        'accept'
      );

      if (!success) {
        throw new Error('Failed to accept assignment');
      }
    } catch (error) {
      console.error('Error accepting assignment:', error);
      throw error;
    }
  }

  // Reject assignment
  async rejectAssignment(assignmentId: string, reason?: string): Promise<void> {
    try {
      // Get assignment details
      const { data: assignment, error: getError } = await supabase
        .from('delivery_assignments')
        .select('delivery_user_id')
        .eq('id', assignmentId)
        .single();

      if (getError || !assignment) throw getError || new Error('Assignment not found');

      // Use the handoff service to handle the rejection
      const success = await restaurantDeliveryHandoffService.handleAssignmentResponse(
        assignmentId,
        assignment.delivery_user_id,
        'reject',
        reason
      );

      if (!success) {
        throw new Error('Failed to reject assignment');
      }
    } catch (error) {
      console.error('Error rejecting assignment:', error);
      throw error;
    }
  }

  // Subscribe to new assignments for a delivery user
  subscribeToAssignments(
    deliveryUserId: string,
    onNewAssignment: (assignment: any) => void
  ) {
    return restaurantDeliveryHandoffService.subscribeToDriverAssignments(
      deliveryUserId,
      onNewAssignment,
      (assignment) => {
        // Handle assignment updates
        console.log('Assignment updated:', assignment);
      }
    );
  }
}

export const automaticAssignmentService = new AutomaticAssignmentService();
