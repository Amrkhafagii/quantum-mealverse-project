
import { supabase } from '@/integrations/supabase/client';
import { DeliveryAssignment } from '@/types/delivery-assignment';

// Get active delivery assignments for a delivery user
export const getActiveDeliveryAssignments = async (
  deliveryUserId: string
): Promise<DeliveryAssignment[]> => {
  try {
    const { data, error } = await supabase
      .from('delivery_assignments')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .in('status', ['assigned', 'picked_up', 'on_the_way'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active assignments:', error);
      throw error;
    }

    // Simulate restaurant and customer data for demonstration
    return (data || []).map(assignment => ({
      ...assignment,
      status: assignment.status as DeliveryAssignment['status'],
      restaurant: {
        name: 'Restaurant Name',
        address: '123 Restaurant St.',
        latitude: 37.7749 + (Math.random() * 0.01),
        longitude: -122.4194 + (Math.random() * 0.01),
      },
      customer: {
        name: 'Customer Name',
        address: '456 Customer Ave.',
        latitude: 37.7749 + (Math.random() * 0.01),
        longitude: -122.4194 + (Math.random() * 0.01),
      },
      distance_km: 2.5 + (Math.random() * 2),
      estimate_minutes: 15 + Math.floor(Math.random() * 10)
    }));
  } catch (error) {
    console.error('Error in getActiveDeliveryAssignments:', error);
    throw error;
  }
};

// Get past delivery assignments for a delivery user
export const getPastDeliveryAssignments = async (
  deliveryUserId: string,
  page: number = 1,
  limit: number = 5
): Promise<{ assignments: DeliveryAssignment[], count: number }> => {
  try {
    // Get the count first
    const { count, error: countError } = await supabase
      .from('delivery_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('delivery_user_id', deliveryUserId)
      .in('status', ['delivered', 'cancelled']);

    if (countError) {
      console.error('Error counting past assignments:', countError);
      throw countError;
    }

    // Then get the paginated data
    const { data, error } = await supabase
      .from('delivery_assignments')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .in('status', ['delivered', 'cancelled'])
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('Error fetching past assignments:', error);
      throw error;
    }

    return { 
      assignments: (data || []).map(a => ({
        ...a,
        status: a.status as DeliveryAssignment['status'] 
      })), 
      count: count || 0 
    };
  } catch (error) {
    console.error('Error in getPastDeliveryAssignments:', error);
    throw error;
  }
};

// Update the status of a delivery assignment
export const updateDeliveryStatus = async (
  assignmentId: string,
  status: DeliveryAssignment['status']
): Promise<DeliveryAssignment> => {
  try {
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // Add specific timestamp based on status
    if (status === 'picked_up') {
      updates.pickup_time = new Date().toISOString();
    } else if (status === 'delivered') {
      updates.delivery_time = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('delivery_assignments')
      .update(updates)
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating assignment status:', error);
      throw error;
    }

    return data as DeliveryAssignment;
  } catch (error) {
    console.error('Error in updateDeliveryStatus:', error);
    throw error;
  }
};
