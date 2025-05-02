
import { supabase } from '@/integrations/supabase/client';
import { DeliveryAssignment } from '@/types/delivery';

// Get active delivery assignments for a delivery user
export const getActiveDeliveryAssignments = async (deliveryUserId: string): Promise<DeliveryAssignment[]> => {
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

    return data as DeliveryAssignment[];
  } catch (error) {
    console.error('Error in getActiveDeliveryAssignments:', error);
    throw error;
  }
};

// Get past delivery assignments for a delivery user with pagination
export const getPastDeliveryAssignments = async (
  deliveryUserId: string, 
  page: number = 1, 
  limit: number = 10
): Promise<{ assignments: DeliveryAssignment[], count: number }> => {
  try {
    // Calculate offset
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get count
    const { count, error: countError } = await supabase
      .from('delivery_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('delivery_user_id', deliveryUserId)
      .in('status', ['delivered', 'cancelled']);

    if (countError) {
      console.error('Error counting past assignments:', countError);
      throw countError;
    }

    // Get data with pagination
    const { data, error } = await supabase
      .from('delivery_assignments')
      .select('*')
      .eq('delivery_user_id', deliveryUserId)
      .in('status', ['delivered', 'cancelled'])
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching past assignments:', error);
      throw error;
    }

    return { 
      assignments: data as DeliveryAssignment[],
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
    const updates: Partial<DeliveryAssignment> = { status };
    
    // Add timestamps based on status
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
      console.error('Error updating delivery status:', error);
      throw error;
    }

    return data as DeliveryAssignment;
  } catch (error) {
    console.error('Error in updateDeliveryStatus:', error);
    throw error;
  }
};
