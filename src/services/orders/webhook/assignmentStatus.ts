
import { supabase } from '@/integrations/supabase/client';
import { AssignmentStatus } from '@/types/webhook';
import { checkExpiredAssignments } from './expiredAssignments';

/**
 * Checks the current status of an order's restaurant assignments 
 */
export const checkAssignmentStatus = async (orderId: string): Promise<AssignmentStatus | null> => {
  try {
    // Check for any expired assignments that need to be handled
    await checkExpiredAssignments();
    
    // Get all assignments for this order
    const { data: assignments, error } = await supabase
      .from('restaurant_assignments')
      .select(`
        id, 
        status,
        restaurant_id,
        created_at,
        restaurants!restaurant_assignments_restaurant_id_restaurants_fkey(id, name)
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
    
    if (error || !assignments) {
      return null;
    }
    
    // Count the different assignment statuses
    const pendingCount = assignments.filter(a => a.status === 'pending').length;
    const acceptedCount = assignments.filter(a => a.status === 'accepted').length;
    const rejectedCount = assignments.filter(a => a.status === 'rejected').length;
    const expiredCount = assignments.filter(a => a.status === 'expired').length;
    
    // Get the most recent accepted assignment if any
    const acceptedAssignment = assignments.find(a => a.status === 'accepted');
    
    // Get restaurant name from the joined data
    const restaurantName = acceptedAssignment?.restaurants?.name;
    
    // Get the most recent pending assignment for expiry time
    const mostRecentPendingAssignment = assignments.find(a => a.status === 'pending');
    
    // Determine the current status
    const currentStatus = acceptedAssignment ? 'accepted' : 
                           pendingCount > 0 ? 'awaiting_response' : 
                           'no_response';
    
    // Update status table with latest assignment status
    if (assignments.length > 0) {
      await supabase.from('status').insert({
        order_id: orderId,
        status: currentStatus,
        updated_by: 'system'
      });
    }
    
    return {
      status: currentStatus,
      assigned_restaurant_id: acceptedAssignment?.restaurant_id,
      restaurant_name: restaurantName,
      assignment_id: acceptedAssignment?.id,
      expires_at: mostRecentPendingAssignment?.created_at,
      attempt_count: assignments.length,
      pending_count: pendingCount,
      accepted_count: acceptedCount,
      rejected_count: rejectedCount,
      expired_count: expiredCount
    };
  } catch (error) {
    return null;
  }
};
