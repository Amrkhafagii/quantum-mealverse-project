
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
      .select('id, restaurant_id, restaurants(name), expires_at')
      .eq('order_id', orderId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (acceptedData) {
      const restaurantName = acceptedData.restaurants ? 
        acceptedData.restaurants.name as string : 
        undefined;
        
      return {
        assigned_restaurant_id: acceptedData.restaurant_id,
        restaurant_name: restaurantName,
        status: 'accepted',
        assignment_id: acceptedData.id
      };
    }

    // Look for pending assignments
    const { data: pendingData, count: pendingCount } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, restaurants(name), expires_at, status', { count: 'exact' })
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);

    if (pendingData && pendingData.length > 0) {
      const assignment = pendingData[0];
      const restaurantName = assignment.restaurants ? 
        assignment.restaurants.name as string : 
        undefined;
        
      return {
        assigned_restaurant_id: assignment.restaurant_id,
        restaurant_name: restaurantName,
        status: 'awaiting_response',
        expires_at: assignment.expires_at,
        assignment_id: assignment.id,
        pending_count: pendingCount || 0
      };
    }

    // Look for the most recent rejected assignment
    const { data: rejectedData } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, restaurants(name), expires_at')
      .eq('order_id', orderId)
      .eq('status', 'rejected')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (rejectedData) {
      const restaurantName = rejectedData.restaurants ? 
        rejectedData.restaurants.name as string : 
        undefined;
        
      return {
        assigned_restaurant_id: rejectedData.restaurant_id,
        restaurant_name: restaurantName,
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
