
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks and handles expired restaurant assignments
 */
export const checkExpiredAssignments = async (): Promise<void> => {
  try {
    const now = new Date();
    
    // Find all assignments that have expired but still have pending status
    const { data: expiredAssignments, error } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, order_id, created_at')
      .eq('status', 'pending')
      .lt('created_at', new Date(now.getTime() - 5 * 60 * 1000).toISOString()); // 5 minutes expiry
    
    if (error) {
      console.error('Error fetching expired assignments:', error);
      return;
    }
    
    if (!expiredAssignments || expiredAssignments.length === 0) {
      return;
    }
    
    // Process expired assignments
    for (const assignment of expiredAssignments) {
      // Update assignment status
      await supabase
        .from('restaurant_assignments')
        .update({ status: 'expired' })
        .eq('id', assignment.id);
      
      // Check if this order has any remaining pending assignments
      const { data: pendingAssignments } = await supabase
        .from('restaurant_assignments')
        .select('id')
        .eq('order_id', assignment.order_id)
        .eq('status', 'pending');
      
      // Check if any restaurant has accepted it
      const { data: acceptedAssignments } = await supabase
        .from('restaurant_assignments')
        .select('id')
        .eq('order_id', assignment.order_id)
        .eq('status', 'accepted');
      
      // If no more pending assignments and no acceptance, mark the order as no restaurant accepted
      if ((!pendingAssignments || pendingAssignments.length === 0) && 
          (!acceptedAssignments || acceptedAssignments.length === 0)) {
        // Update the order status
        await supabase
          .from('orders')
          .update({ status: 'no_restaurant_accepted' })
          .eq('id', assignment.order_id);
        
        // Record in order history
        await supabase.from('order_history').insert({
          order_id: assignment.order_id,
          status: 'no_restaurant_accepted',
          details: { reason: 'All restaurants rejected or assignments expired' },
          restaurant_id: null,  // Use null for system-generated entries
          restaurant_name: 'System' // Using 'System' as a placeholder
        });
        
        // Update status table
        await supabase.from('status').insert({
          order_id: assignment.order_id,
          status: 'no_restaurant_accepted',
          updated_by: 'system'
        });
      }
    }
  } catch (error) {
    console.error('Error handling expired assignments:', error);
  }
};
