
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { updateOrderStatus } from './orderService.ts';
import { findNearestRestaurants, logAssignmentAttempt } from './restaurantService.ts';
import { handleAssignment } from './orderService.ts';

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

    // Log this webhook call with timestamp
    await supabase.from('webhook_logs').insert({
      payload: {
        action,
        order_id,
        timestamp: new Date().toISOString(),
        request_data: requestData,
        is_expiration: isExpiredReassignment
      }
    });

    if (action === 'accept' || action === 'reject') {
      if (!requestData.restaurant_id || !requestData.assignment_id) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Missing restaurant_id or assignment_id for accept/reject action' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const { restaurant_id, assignment_id } = requestData;
      
      console.log(`[WEBHOOK] Processing ${action} action for order ${order_id} from restaurant ${restaurant_id}`);
      
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

      // Get the current attempt number based on assignment history
      const { count } = await supabase
        .from('restaurant_assignment_history')
        .select('*', { count: 'exact', head: true })
        .eq('order_id', order_id);
      
      const currentAttemptNumber = count || 1;
      console.log(`[WEBHOOK] Processing ${action} for order ${order_id} on attempt #${currentAttemptNumber}`);

      const { error: updateError } = await supabase
        .from('restaurant_assignments')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', assignment_id);
      
      if (updateError) {
        console.error('[WEBHOOK] Error updating assignment:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update assignment' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      await logAssignmentAttempt(supabase, order_id, restaurant_id, action);
      
      // Log the outcome to webhook_logs
      await supabase.from('webhook_logs').insert({
        payload: {
          order_id,
          restaurant_id,
          action,
          status: action,
          attempt_number: currentAttemptNumber,
          timestamp: new Date().toISOString()
        },
        restaurant_assigned: restaurant_id
      });

      if (action === 'accept') {
        console.log(`[WEBHOOK] Restaurant ${restaurant_id} accepted order ${order_id} on attempt #${currentAttemptNumber}`);
        
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

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Order accepted successfully',
            order_id,
            attempt_number: currentAttemptNumber,
            restaurant_id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.log(`[WEBHOOK] Restaurant ${restaurant_id} rejected order ${order_id}, attempting reassignment...`);
        
        // Restaurant rejected the order, try to reassign
        const result = await handleAssignment(supabase, order_id, latitude, longitude);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Order rejected, reassignment processed',
            result
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'assign') {
      console.log(`[WEBHOOK] Processing ${isExpiredReassignment ? 'reassignment due to expiration' : 'new assignment'} for order ${order_id}`);
      
      // If this is a reassignment due to expiration, first update any expired assignments
      if (isExpiredReassignment) {
        const { data: expiredAssignments } = await supabase
          .from('restaurant_assignments')
          .select('id, restaurant_id')
          .eq('order_id', order_id)
          .eq('status', 'pending')
          .lt('expires_at', new Date().toISOString());
          
        if (expiredAssignments && expiredAssignments.length > 0) {
          console.log(`[WEBHOOK] Found ${expiredAssignments.length} expired assignments to update`);
          
          for (const assignment of expiredAssignments) {
            await supabase
              .from('restaurant_assignments')
              .update({ status: 'expired' })
              .eq('id', assignment.id);
              
            await logAssignmentAttempt(
              supabase, 
              order_id, 
              assignment.restaurant_id, 
              'expired',
              'Restaurant did not respond within the time limit'
            );
          }
        }
      }
      
      const result = await handleAssignment(supabase, order_id, latitude, longitude);
      if (!result.success) {
        // If assignment failed, make sure error and status messages reflect this
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
