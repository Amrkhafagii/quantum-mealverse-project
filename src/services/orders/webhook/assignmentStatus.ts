
import { supabase } from '@/integrations/supabase/client';
import { AssignmentStatus, WebhookResponse } from '@/types/webhook';
import { checkExpiredAssignments } from './expirationCheck';

/**
 * Checks the current status of an order's restaurant assignments
 * and automatically handles expired assignments
 */
export const checkAssignmentStatus = async (orderId: string): Promise<AssignmentStatus | null> => {
  try {
    // First check and handle any expired assignments
    await checkExpiredAssignments();
    
    // Then fetch the current assignments
    const { data: assignments, error } = await supabase
      .from('restaurant_assignments')
      .select(`
        id, 
        status, 
        restaurant_id, 
        expires_at, 
        restaurants!restaurant_assignments_restaurant_id_restaurants_fkey(id, name)
      `)
      .eq('order_id', orderId);
    
    if (error || !assignments) {
      console.error('Error fetching assignments:', error);
      return null;
    }
    
    const pendingCount = assignments.filter(a => a.status === 'pending').length;
    const acceptedCount = assignments.filter(a => a.status === 'accepted').length;
    const rejectedCount = assignments.filter(a => a.status === 'rejected').length;
    const expiredCount = assignments.filter(a => a.status === 'expired').length;
    
    const acceptedAssignment = assignments.find(a => a.status === 'accepted');
    
    const restaurantName = acceptedAssignment && 
                         acceptedAssignment.restaurants && 
                         typeof acceptedAssignment.restaurants === 'object' ? 
                         (acceptedAssignment.restaurants as any).name : undefined;
    
    const pendingAssignments = assignments.filter(a => a.status === 'pending');
    const mostRecentAssignment = pendingAssignments.length > 0 
      ? pendingAssignments.sort((a, b) => 
          new Date(b.expires_at).getTime() - new Date(a.expires_at).getTime()
        )[0]
      : null;
    
    return {
      status: acceptedAssignment ? 'accepted' : 
              pendingCount > 0 ? 'awaiting_response' : 
              'no_response',
      assigned_restaurant_id: acceptedAssignment?.restaurant_id,
      restaurant_name: restaurantName,
      assignment_id: acceptedAssignment?.id,
      expires_at: mostRecentAssignment?.expires_at,
      attempt_count: assignments.length,
      pending_count: pendingCount,
      accepted_count: acceptedCount,
      rejected_count: rejectedCount,
      expired_count: expiredCount
    };
  } catch (error) {
    console.error('Error checking assignment status:', error);
    return null;
  }
};
