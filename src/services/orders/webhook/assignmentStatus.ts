
import { supabase } from '@/integrations/supabase/client';
import { AssignmentStatus } from '@/types/webhook';

/**
 * Utility function to fetch restaurant name by ID
 */
const fetchRestaurantName = async (restaurantId: string): Promise<string | undefined> => {
  try {
    const { data: restaurantData, error } = await supabase
      .from('restaurants')
      .select('name')
      .eq('id', restaurantId)
      .single();
    
    if (error) {
      console.error(`Failed to fetch restaurant name for ID ${restaurantId}:`, error);
      return undefined;
    }
    
    return restaurantData?.name;
  } catch (error) {
    console.error(`Error in fetchRestaurantName for ID ${restaurantId}:`, error);
    return undefined;
  }
};

/**
 * Gets the current assignment status for an order
 * 
 * @param orderId The ID of the order
 * @returns Assignment status object with restaurant info and expiration
 */
export const getAssignmentStatus = async (orderId: string): Promise<AssignmentStatus> => {
  try {
    // First check if there's a ready_for_pickup assignment
    const { data: readyAssignment, error: readyError } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, expires_at')
      .eq('order_id', orderId)
      .eq('status', 'ready_for_pickup')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (readyError) {
      console.error(`Error fetching ready_for_pickup assignments for order ${orderId}:`, readyError);
    }

    if (readyAssignment) {
      const restaurantName = await fetchRestaurantName(readyAssignment.restaurant_id);
        
      return {
        assigned_restaurant_id: readyAssignment.restaurant_id,
        restaurant_name: restaurantName,
        status: 'ready_for_pickup',
        assignment_id: readyAssignment.id
      };
    }
    
    // Next check for preparing assignments
    const { data: preparingAssignment, error: preparingError } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, expires_at')
      .eq('order_id', orderId)
      .eq('status', 'preparing')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (preparingError) {
      console.error(`Error fetching preparing assignments for order ${orderId}:`, preparingError);
    }

    if (preparingAssignment) {
      const restaurantName = await fetchRestaurantName(preparingAssignment.restaurant_id);
        
      return {
        assigned_restaurant_id: preparingAssignment.restaurant_id,
        restaurant_name: restaurantName,
        status: 'preparing',
        assignment_id: preparingAssignment.id
      };
    }
    
    // Check if there's an accepted restaurant first
    const { data: acceptedAssignment, error: acceptedError } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, expires_at')
      .eq('order_id', orderId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (acceptedError && acceptedError.code !== 'PGRST116') {
      console.error(`Error fetching accepted assignments for order ${orderId}:`, acceptedError);
    }

    if (acceptedAssignment) {
      const restaurantName = await fetchRestaurantName(acceptedAssignment.restaurant_id);
        
      return {
        assigned_restaurant_id: acceptedAssignment.restaurant_id,
        restaurant_name: restaurantName,
        status: 'accepted',
        assignment_id: acceptedAssignment.id
      };
    }

    // Look for pending assignments
    const { data: pendingData, count: pendingCount, error: pendingError } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, expires_at, status', { count: 'exact' })
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);

    if (pendingError) {
      console.error(`Error fetching pending assignments for order ${orderId}:`, pendingError);
    }

    if (pendingData && pendingData.length > 0) {
      const assignment = pendingData[0];
      const restaurantName = await fetchRestaurantName(assignment.restaurant_id);
        
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
    const { data: rejectedAssignment, error: rejectedError } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, expires_at')
      .eq('order_id', orderId)
      .eq('status', 'rejected')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (rejectedError && rejectedError.code !== 'PGRST116') {
      console.error(`Error fetching rejected assignments for order ${orderId}:`, rejectedError);
    }

    if (rejectedAssignment) {
      const restaurantName = await fetchRestaurantName(rejectedAssignment.restaurant_id);
        
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
    console.error(`Critical error getting assignment status for order ${orderId}:`, error);
    return {
      status: 'error',
    };
  }
};
