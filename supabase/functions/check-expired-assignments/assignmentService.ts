
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface Assignment {
  id: string;
  restaurant_id: string;
  order_id: string;
  created_at: string;
}

export async function getExpiredAssignments(supabase: any): Promise<Assignment[]> {
  const timeoutMinutes = 5; // Assignments expire after 5 minutes
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() - timeoutMinutes);
  
  const { data: expiredAssignments, error } = await supabase
    .from('restaurant_assignments')
    .select('id, restaurant_id, order_id, created_at')
    .eq('status', 'pending')
    .lt('created_at', expiryTime.toISOString());

  if (error) throw error;
  return expiredAssignments || [];
}

export async function markAssignmentExpired(supabase: any, assignment: Assignment, now: string) {
  // Update the assignment status to expired
  const { error: updateError } = await supabase
    .from('restaurant_assignments')
    .update({ 
      status: 'expired',
      updated_at: now
    })
    .eq('id', assignment.id);
    
  if (updateError) throw updateError;
}

export async function logAssignmentHistory(supabase: any, assignment: Assignment, now: string) {
  // Get restaurant name for logging
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name')
    .eq('id', assignment.restaurant_id)
    .single();

  // Log in order_history
  const { error: historyError } = await supabase
    .from('order_history')
    .insert({
      order_id: assignment.order_id,
      status: 'expired_assignment',
      restaurant_id: assignment.restaurant_id,
      restaurant_name: restaurant?.name || null,
      details: {
        assignment_id: assignment.id,
        expired_at: now,
        auto_expired: true
      }
    });

  if (historyError) {
    console.error('Error logging assignment history:', historyError);
    throw historyError;
  }
}

export async function checkRemainingAssignments(supabase: any, orderId: string): Promise<{ 
  noPending: boolean; 
  noAccepted: boolean; 
}> {
  // Use aliases to avoid ambiguous column references
  const { data: pendingAssignments } = await supabase
    .from('restaurant_assignments')
    .select('ra.id')
    .eq('order_id', orderId)
    .eq('status', 'pending');

  const { data: acceptedAssignments } = await supabase
    .from('restaurant_assignments')
    .select('ra.id')
    .eq('order_id', orderId)
    .eq('status', 'accepted');

  return {
    noPending: !pendingAssignments || pendingAssignments.length === 0,
    noAccepted: !acceptedAssignments || acceptedAssignments.length === 0
  };
}
