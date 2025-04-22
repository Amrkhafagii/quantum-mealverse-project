
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getExpiredAssignments, markAssignmentExpired, logAssignmentHistory, checkRemainingAssignments } from './assignmentService.ts';
import { logOrderExpiration, updateOrderStatus } from './orderService.ts';

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

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing environment variables for Supabase connection');
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    const now = new Date().toISOString();
    console.log(`Current server time: ${now}`);

    const expiredAssignments = await getExpiredAssignments(supabase);
    console.log(`Found ${expiredAssignments.length} expired assignments`);

    const results = [];
    const affectedOrders = new Set();

    for (const assignment of expiredAssignments) {
      console.log(`Processing expired assignment ${assignment.id} for order ${assignment.order_id}`);
      
      try {
        // Mark the assignment as expired
        await markAssignmentExpired(supabase, assignment, now);
        
        // Log the status change in assignment history
        await logAssignmentHistory(supabase, assignment, now);
        
        // Log the expiration event in order history
        try {
          await logOrderExpiration(supabase, assignment.order_id, assignment.restaurant_id, assignment.id, now);
        } catch (error) {
          console.error(`Error logging order expiration for ${assignment.order_id}:`, error);
          // Continue processing even if this fails
        }
        
        affectedOrders.add(assignment.order_id);
        results.push({ 
          assignment_id: assignment.id, 
          success: true, 
          message: 'Assignment marked as expired' 
        });
      } catch (error) {
        console.error(`Error processing assignment ${assignment.id}:`, error);
        results.push({ 
          assignment_id: assignment.id, 
          success: false, 
          error: error.message 
        });
        // Still add the order to affected orders to check if we need to update status
        affectedOrders.add(assignment.order_id);
      }
    }
    
    // Process affected orders
    const orderResults = [];
    for (const orderId of affectedOrders) {
      try {
        const { noPending, noAccepted } = await checkRemainingAssignments(supabase, orderId);
        
        console.log(`Order ${orderId} check: noPending=${noPending}, noAccepted=${noAccepted}`);
        
        if (noPending && noAccepted) {
          console.log(`All assignments expired for order ${orderId}, updating status`);
          await updateOrderStatus(supabase, orderId);
          orderResults.push({
            order_id: orderId,
            status: 'updated_to_no_restaurant_accepted',
            success: true
          });
        } else {
          orderResults.push({
            order_id: orderId,
            status: 'no_update_needed',
            details: { has_pending: !noPending, has_accepted: !noAccepted }
          });
        }
      } catch (error) {
        console.error(`Error processing order ${orderId}:`, error);
        orderResults.push({
          order_id: orderId,
          success: false,
          error: error.message
        });
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
        affected_orders: Array.from(affectedOrders),
        order_results: orderResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
