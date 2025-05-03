
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
    const { data: acceptedAssignment } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, expires_at')
      .eq('order_id', orderId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (acceptedAssignment) {
      // If we found an accepted assignment, get the restaurant name
      const { data: restaurantData } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', acceptedAssignment.restaurant_id)
        .single();
      
      const restaurantName = restaurantData?.name;
        
      return {
        assigned_restaurant_id: acceptedAssignment.restaurant_id,
        restaurant_name: restaurantName,
        status: 'accepted',
        assignment_id: acceptedAssignment.id
      };
    }

    // Look for pending assignments
    const { data: pendingData, count: pendingCount } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, expires_at, status', { count: 'exact' })
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);

    if (pendingData && pendingData.length > 0) {
      const assignment = pendingData[0];
      
      // Get restaurant name in a separate query
      const { data: restaurantData } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', assignment.restaurant_id)
        .single();
      
      const restaurantName = restaurantData?.name;
        
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
    const { data: rejectedAssignment } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, expires_at')
      .eq('order_id', orderId)
      .eq('status', 'rejected')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (rejectedAssignment) {
      // Get restaurant name in a separate query
      const { data: restaurantData } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', rejectedAssignment.restaurant_id)
        .single();
      
      const restaurantName = restaurantData?.name;
        
      return {
        assigned_restaurant_id: rejectedAssignment.restaurant_id,
        restaurant_name: restaurantName,
        status: 'rejected',
        assignment_id: rejectedAssignment.id
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
