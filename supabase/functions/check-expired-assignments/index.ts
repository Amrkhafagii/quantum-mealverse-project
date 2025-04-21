
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false }
      }
    );

    // Get the current server timestamp
    const now = new Date().toISOString();
    console.log(`Current server time: ${now}`);

    // Find all pending assignments that have expired
    const { data: expiredAssignments, error: fetchError } = await supabase
      .from('restaurant_assignments')
      .select('id, restaurant_id, order_id, expires_at')
      .eq('status', 'pending')
      .lt('expires_at', now);
    
    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${expiredAssignments?.length || 0} expired assignments`);

    const results = [];
    const affectedOrders = new Set();

    // Process each expired assignment
    for (const assignment of expiredAssignments || []) {
      console.log(`Processing expired assignment ${assignment.id} for order ${assignment.order_id}`);
      
      try {
        // Mark the assignment as expired
        const { error: updateError } = await supabase
          .from('restaurant_assignments')
          .update({ 
            status: 'expired',
            updated_at: now
          })
          .eq('id', assignment.id);
        
        if (updateError) {
          console.error(`Error updating assignment ${assignment.id}:`, updateError);
          results.push({ 
            assignment_id: assignment.id, 
            success: false, 
            error: updateError.message 
          });
          continue;
        }
        
        // Add to restaurant_assignment_history table
        const { error: historyError } = await supabase
          .from('restaurant_assignment_history')
          .insert({
            order_id: assignment.order_id,
            restaurant_id: assignment.restaurant_id,
            status: 'expired',
            notes: `Automatically expired at ${now}`
          });
        
        if (historyError) {
          console.error(`Error adding to history for assignment ${assignment.id}:`, historyError);
        }
        
        // Add to order_history
        const { error: orderHistoryError } = await supabase
          .from('order_history')
          .insert({
            order_id: assignment.order_id,
            status: 'assignment_expired',
            restaurant_id: assignment.restaurant_id,
            details: { assignment_id: assignment.id },
            expired_at: now
          });
        
        if (orderHistoryError) {
          console.error(`Error adding to order history for assignment ${assignment.id}:`, orderHistoryError);
        }
        
        affectedOrders.add(assignment.order_id);
        
        results.push({ 
          assignment_id: assignment.id, 
          success: true, 
          message: 'Assignment marked as expired' 
        });
      } catch (error) {
        console.error(`Exception processing assignment ${assignment.id}:`, error);
        results.push({ 
          assignment_id: assignment.id, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    // Process affected orders to update their status if needed
    for (const orderId of affectedOrders) {
      try {
        // Check if there are any pending assignments left
        const { data: pendingAssignments, error: pendingError } = await supabase
          .from('restaurant_assignments')
          .select('id')
          .eq('order_id', orderId)
          .eq('status', 'pending');
          
        if (pendingError) {
          console.error(`Error checking pending assignments for order ${orderId}:`, pendingError);
          continue;
        }
        
        // Check if there's an accepted assignment
        const { data: acceptedAssignments, error: acceptedError } = await supabase
          .from('restaurant_assignments')
          .select('id')
          .eq('order_id', orderId)
          .eq('status', 'accepted');
          
        if (acceptedError) {
          console.error(`Error checking accepted assignments for order ${orderId}:`, acceptedError);
          continue;
        }
        
        // If no pending or accepted assignments remain, update order status
        if ((!pendingAssignments || pendingAssignments.length === 0) &&
            (!acceptedAssignments || acceptedAssignments.length === 0)) {
          
          console.log(`All assignments expired for order ${orderId}, updating status to no_restaurant_accepted`);
          
          // Update order status
          const { error: orderUpdateError } = await supabase
            .from('orders')
            .update({ status: 'no_restaurant_accepted' })
            .eq('id', orderId);
          
          if (orderUpdateError) {
            console.error(`Error updating order ${orderId} status:`, orderUpdateError);
          }
          
          // Add to order status history
          const { error: statusHistoryError } = await supabase
            .from('order_status_history')
            .insert({
              order_id: orderId,
              previous_status: 'awaiting_restaurant',
              new_status: 'no_restaurant_accepted'
            });
            
          if (statusHistoryError) {
            console.error(`Error adding status history entry for order ${orderId}:`, statusHistoryError);
          }
          
          // Add to order history
          const { error: historyError } = await supabase
            .from('order_history')
            .insert({
              order_id: orderId,
              status: 'no_restaurant_accepted',
              details: { reason: 'All restaurant assignments expired' }
            });
            
          if (historyError) {
            console.error(`Error adding order history entry for order ${orderId}:`, historyError);
          }
        }
      } catch (error) {
        console.error(`Error processing order ${orderId}:`, error);
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
        affected_orders: Array.from(affectedOrders)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing expired assignments:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
