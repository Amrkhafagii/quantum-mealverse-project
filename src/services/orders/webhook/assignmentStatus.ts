
import { supabase } from '@/integrations/supabase/client';
import { AssignmentStatus } from '@/types/webhook';

/**
 * Gets the current assignment status for an order
 * 
 * @param orderId The ID of the order
 * @returns Assignment status object with restaurant info and expiration
 */
export const getAssignmentStatus = async (orderId: string): Promise<AssignmentStatus> => {
  try {
    // Check if there's an accepted restaurant first
    const { data: acceptedData } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, restaurants:restaurant_id(name), expires_at')
      .eq('order_id', orderId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (acceptedData) {
      return {
        assigned_restaurant_id: acceptedData.restaurant_id,
        restaurant_name: acceptedData.restaurants?.name,
        status: 'accepted',
        assignment_id: acceptedData.id
      };
    }

    // Look for pending assignments
    const { data: pendingData, count: pendingCount } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, restaurants:restaurant_id(name), expires_at, status', { count: 'exact' })
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);

    if (pendingData && pendingData.length > 0) {
      const assignment = pendingData[0];
      return {
        assigned_restaurant_id: assignment.restaurant_id,
        restaurant_name: assignment.restaurants?.name,
        status: 'awaiting_response',
        expires_at: assignment.expires_at,
        assignment_id: assignment.id,
        pending_count: pendingCount || 0
      };
    }

    // Look for the most recent rejected assignment
    const { data: rejectedData } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, restaurants:restaurant_id(name), expires_at')
      .eq('order_id', orderId)
      .eq('status', 'rejected')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (rejectedData) {
      return {
        assigned_restaurant_id: rejectedData.restaurant_id,
        restaurant_name: rejectedData.restaurants?.name,
        status: 'rejected',
        assignment_id: rejectedData.id
      };
    }

    // No assignments found
    return {
      status: 'not_assigned'
    };
  } catch (error) {
    console.error('Error getting assignment status:', error);
    return {
      status: 'error',
    };
  }
};
