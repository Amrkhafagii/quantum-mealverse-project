
import { supabase } from '@/integrations/supabase/client';
import type { DeliveryAssignment } from '@/types/delivery-assignment';

class AutomaticAssignmentService {
  // Subscribe to delivery assignment notifications for a specific delivery user
  subscribeToAssignments(
    deliveryUserId: string,
    onNewAssignment: (assignment: any) => void
  ) {
    const channel = supabase
      .channel(`delivery_assignment_${deliveryUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_assignments',
          filter: `delivery_user_id=eq.${deliveryUserId}`
        },
        (payload) => {
          console.log('New delivery assignment received:', payload.new);
          onNewAssignment(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Accept a delivery assignment
  async acceptAssignment(assignmentId: string): Promise<DeliveryAssignment> {
    const { data, error } = await supabase
      .from('delivery_assignments')
      .update({ 
        status: 'picked_up',
        pickup_time: new Date().toISOString()
      })
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) {
      console.error('Error accepting assignment:', error);
      throw error;
    }

    return data as DeliveryAssignment;
  }

  // Reject a delivery assignment (reassign to another delivery user)
  async rejectAssignment(assignmentId: string, reason?: string): Promise<void> {
    // First get the assignment to retrieve the order_id
    const { data: assignment, error: fetchError } = await supabase
      .from('delivery_assignments')
      .select('order_id')
      .eq('id', assignmentId)
      .single();

    if (fetchError) {
      console.error('Error fetching assignment for rejection:', fetchError);
      throw fetchError;
    }

    const { error } = await supabase
      .from('delivery_assignments')
      .update({ 
        status: 'pending',
        delivery_user_id: null
      })
      .eq('id', assignmentId);

    if (error) {
      console.error('Error rejecting assignment:', error);
      throw error;
    }

    // Log the rejection for analytics with the required order_id
    await supabase
      .from('delivery_assignment_rejections')
      .insert({
        assignment_id: assignmentId,
        order_id: assignment.order_id,
        reason: reason || 'No reason provided'
      });
  }

  // Get pending assignments for a delivery user
  async getPendingAssignments(deliveryUserId: string): Promise<DeliveryAssignment[]> {
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
      .in('status', ['assigned', 'pending'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending assignments:', error);
      throw error;
    }

    return (data || []).map(assignment => {
      const order = assignment.orders as any;
      const restaurant = order?.restaurant as any;
      
      return {
        ...assignment,
        status: assignment.status as DeliveryAssignment['status'],
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
        }
      };
    });
  }

  // Update assignment location (for tracking)
  async updateAssignmentLocation(
    assignmentId: string,
    latitude: number,
    longitude: number
  ): Promise<void> {
    const { error } = await supabase
      .from('delivery_locations')
      .insert({
        assignment_id: assignmentId,
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating assignment location:', error);
      throw error;
    }
  }
}

export const automaticAssignmentService = new AutomaticAssignmentService();
