
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
    console.log('Received webhook request:', requestData);

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
      
      const { data: assignment, error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .select('*')
        .eq('id', assignment_id)
        .eq('order_id', order_id)
        .eq('restaurant_id', restaurant_id)
        .eq('status', 'pending')
        .single();
      
      if (assignmentError || !assignment) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid or expired assignment' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      if (new Date(assignment.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Assignment has expired' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const { error: updateError } = await supabase
        .from('restaurant_assignments')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', assignment_id);
      
      if (updateError) {
        console.error('Error updating assignment:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update assignment' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      await logAssignmentAttempt(supabase, order_id, restaurant_id, action);

      if (action === 'accept') {
        const { error: orderUpdateError } = await supabase
          .from('orders')
          .update({ 
            status: 'processing', 
            restaurant_id: restaurant_id 
          })
          .eq('id', order_id);
        
        if (orderUpdateError) {
          console.error('Error updating order after acceptance:', orderUpdateError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to update order' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Order accepted successfully',
            order_id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.log('Restaurant rejected order, attempting next restaurant in sequence');
        const result = await handleAssignment(supabase, order_id, latitude, longitude);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Order rejected, trying next restaurant',
            result
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'assign') {
      console.log(`Processing assignment request for order ${order_id}`);
      const result = await handleAssignment(supabase, order_id, latitude, longitude);
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
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
