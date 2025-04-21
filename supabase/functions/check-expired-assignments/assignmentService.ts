
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface Assignment {
  id: string;
  restaurant_id: string;
  order_id: string;
  expires_at: string;
}

export async function getExpiredAssignments(supabase: any): Promise<Assignment[]> {
  const now = new Date().toISOString();
  const { data: expiredAssignments, error } = await supabase
    .from('restaurant_assignments')
    .select('id, restaurant_id, order_id, expires_at')
    .eq('status', 'pending')
    .lt('expires_at', now);

  if (error) throw error;
  return expiredAssignments || [];
}

export async function markAssignmentExpired(supabase: any, assignment: Assignment, now: string) {
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
  const { error: historyError } = await supabase
    .from('restaurant_assignment_history')
    .insert({
      order_id: assignment.order_id,
      restaurant_id: assignment.restaurant_id,
      status: 'expired',
      notes: `Automatically expired at ${now}`
    });

  if (historyError) throw historyError;
}

export async function checkRemainingAssignments(supabase: any, orderId: string): Promise<{ 
  noPending: boolean; 
  noAccepted: boolean; 
}> {
  const { data: pendingAssignments } = await supabase
    .from('restaurant_assignments')
    .select('id')
    .eq('order_id', orderId)
    .eq('status', 'pending');

  const { data: acceptedAssignments } = await supabase
    .from('restaurant_assignments')
    .select('id')
    .eq('order_id', orderId)
    .eq('status', 'accepted');

  return {
    noPending: !pendingAssignments || pendingAssignments.length === 0,
    noAccepted: !acceptedAssignments || acceptedAssignments.length === 0
  };
}
