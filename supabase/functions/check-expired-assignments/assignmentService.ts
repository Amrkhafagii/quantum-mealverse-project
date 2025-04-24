
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
  // Insert new record with expired status
  const { error: insertError } = await supabase
    .from('restaurant_assignments')
    .insert({
      order_id: assignment.order_id,
      restaurant_id: assignment.restaurant_id, 
      status: 'expired',
      created_at: now,
      notes: `Automatically expired at ${now}`
    });

  if (insertError) throw insertError;
  
  // Also update the original assignment to expired
  const { error: updateError } = await supabase
    .from('restaurant_assignments')
    .update({ status: 'expired' })
    .eq('id', assignment.id);
    
  if (updateError) throw updateError;
}

export async function logAssignmentHistory(supabase: any, assignment: Assignment, now: string) {
  // This function is now redundant since we're using restaurant_assignments directly
  // Kept for API compatibility
  return;
}

export async function checkRemainingAssignments(supabase: any, orderId: string): Promise<{ 
  noPending: boolean; 
  noAccepted: boolean; 
}> {
  const { data: recentAssignments } = await supabase
    .from('restaurant_assignments')
    .select('id, status')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });

  const pendingAssignments = recentAssignments?.filter(a => a.status === 'pending') || [];
  const acceptedAssignments = recentAssignments?.filter(a => a.status === 'accepted') || [];

  return {
    noPending: pendingAssignments.length === 0,
    noAccepted: acceptedAssignments.length === 0
  };
}
