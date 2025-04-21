
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { updateOrderStatus } from './orderService.ts';
import { findNearestRestaurants, logAssignmentAttempt } from './restaurantService.ts';
import { handleAssignment, duplicateOrderWithNewRestaurant, assignOrderToAllNearbyRestaurants, checkAndHandleExpiredAssignments } from './orderService.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://hozgutjvbrljeijybnyg.supabase.co';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvemd1dGp2YnJsamVpanlibnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5ODc0MjksImV4cCI6MjA2MDU2MzQyOX0.Wy8X0JuOVDQZTVZWtwF42fdcsuPjsGVJJ4slPqMCWT4';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
        auth: { persistSession: false }
      }
    );

    const requestData = await req.json();
    console.log('[WEBHOOK] Received webhook request:', requestData);

    // Check for explicit action to handle expired assignments
    if (requestData.action === 'check_expired') {
      console.log('[WEBHOOK] Checking for expired assignments');
      const result = await checkAndHandleExpiredAssignments(supabase);
      return new Response(
        JSON.stringify({ success: true, result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!requestData.order_id || !requestData.latitude || !requestData.longitude) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: order_id, latitude, longitude' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { order_id, latitude, longitude } = requestData;
    const action = requestData.action || 'assign';
    const isExpiredReassignment = requestData.expired_reassignment === true;

    if (action === 'assign') {
      // Always assign to all nearby at once on any assign call
      console.log(`[WEBHOOK] Assigning order to all nearby restaurants`);
      const result = await assignOrderToAllNearbyRestaurants(supabase, order_id, latitude, longitude);
      if (!result.success) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: result.error,
            status: result.status || 'failed'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ success: true, result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'accept' || action === 'reject') {
      // Stricter validation for restaurant_id and assignment_id
      if (!requestData.assignment_id) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Missing assignment_id for accept/reject action' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      if (!requestData.restaurant_id) {
        console.error(`[WEBHOOK] Invalid ${action} request: Missing restaurant_id`, requestData);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Missing restaurant_id for ${action} action` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const { restaurant_id, assignment_id } = requestData;
      
      console.log(`[WEBHOOK] Processing ${action} action for order ${order_id} from restaurant ${restaurant_id}`);
      
      // Verify the assignment exists and is still pending
      const { data: assignment, error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .select('*')
        .eq('id', assignment_id)
        .eq('order_id', order_id)
        .eq('restaurant_id', restaurant_id)
        .eq('status', 'pending')
        .single();
      
      if (assignmentError || !assignment) {
        console.log('[WEBHOOK] Invalid or expired assignment');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid or expired assignment' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      if (new Date(assignment.expires_at) < new Date()) {
        console.log('[WEBHOOK] Assignment has expired');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Assignment has expired' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const { count } = await supabase
        .from('restaurant_assignment_history')
        .select('*', { count: 'exact', head: true })
        .eq('order_id', order_id);
      
      const currentAttemptNumber = count || 1;
      console.log(`[WEBHOOK] Processing ${action} for order ${order_id} on attempt #${currentAttemptNumber}`);

      // [on accept]
      if (action === 'accept') {
        // Mark this assignment as accepted
        const { error: updateError } = await supabase
          .from('restaurant_assignments')
          .update({ status: 'accepted' })
          .eq('id', assignment_id);
        if (updateError) {
          console.error('[WEBHOOK] Error updating assignment:', updateError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to update assignment' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        // Mark all other pending assignments as cancelled
        const { error: cancelError } = await supabase
          .from('restaurant_assignments')
          .update({ status: 'cancelled' })
          .eq('order_id', order_id)
          .eq('status', 'pending')
          .neq('id', assignment_id);
        if (cancelError) {
          console.error('[WEBHOOK] Error cancelling other assignments:', cancelError);
        }
        await logAssignmentAttempt(supabase, order_id, restaurant_id, action);
        await supabase.from('webhook_logs').insert({
          payload: {
            order_id,
            restaurant_id,
            action,
            status: action,
            timestamp: new Date().toISOString()
          },
          restaurant_assigned: restaurant_id
        });
        const { error: orderUpdateError } = await supabase
          .from('orders')
          .update({ 
            status: 'processing', 
            restaurant_id: restaurant_id 
          })
          .eq('id', order_id);
        if (orderUpdateError) {
          console.error('[WEBHOOK] Error updating order after acceptance:', orderUpdateError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to update order' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
        // Add order history record
        await supabase.from('order_history').insert({
          order_id: order_id,
          status: 'restaurant_accepted',
          restaurant_id: restaurant_id,
          details: { assignment_id: assignment_id }
        });
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Order accepted successfully',
            order_id,
            restaurant_id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else { // action === 'reject'
        // Mark this assignment as rejected
        const { error: updateError } = await supabase
          .from('restaurant_assignments')
          .update({ status: 'rejected' })
          .eq('id', assignment_id);
        if (updateError) {
          console.error('[WEBHOOK] Error updating assignment:', updateError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to update assignment' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        await logAssignmentAttempt(supabase, order_id, restaurant_id, action);
        
        // Add order history record for the rejection
        await supabase.from('order_history').insert({
          order_id: order_id,
          status: 'restaurant_rejected',
          restaurant_id: restaurant_id,
          details: { assignment_id: assignment_id }
        });
        
        // If no pending assignments remain, update to no_restaurant_accepted
        const { data: pendingAssignments } = await supabase
          .from('restaurant_assignments')
          .select('id')
          .eq('order_id', order_id)
          .eq('status', 'pending');
        if (!pendingAssignments || pendingAssignments.length === 0) {
          await updateOrderStatus(supabase, order_id, 'no_restaurant_accepted');
          
          // Add order history record for no restaurants accepting
          await supabase.from('order_history').insert({
            order_id: order_id,
            status: 'no_restaurant_accepted',
            details: { reason: 'All restaurants have rejected the order' }
          });
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Order rejected by restaurant, no more pending assignments',
              result: {
                status: 'no_restaurant_accepted',
                message: 'All restaurants have rejected the order'
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        // There are still pending assignments, do nothing
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Order rejected by restaurant, but still awaiting responses from other restaurants',
            pending_assignments: pendingAssignments.length
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Unrecognized action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error) {
    console.error('[WEBHOOK] Error processing webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
