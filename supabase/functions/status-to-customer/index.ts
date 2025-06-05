
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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://hozgutjvbrljeijybnyg.supabase.co';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false }
      }
    );

    const { orderId, status, restaurantId, changedBy, changedByType } = await req.json();

    if (!orderId || !status) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing orderId or status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Updating order ${orderId} status to ${status} by ${changedByType || 'system'}`);

    // Validate status transition
    const allowedStatuses = ['accepted', 'preparing', 'ready_for_pickup', 'on_the_way', 'delivered'];
    if (!allowedStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid status. Allowed statuses: ' + allowedStatuses.join(', ') }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get the current order status before updating
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    const oldStatus = currentOrder?.status || null;

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status, restaurant_id: restaurantId || null })
      .eq('id', orderId);

    if (updateError) {
      throw updateError;
    }

    // Add status change to history
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        new_status: status,
        previous_status: oldStatus // Now tracking the old status
      });

    if (historyError) {
      console.error('Error recording status history:', historyError);
      // Don't throw here - the main update succeeded
    }

    // Get restaurant name if restaurantId is provided
    let restaurantName;
    if (restaurantId) {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', restaurantId)
        .single();
      
      restaurantName = restaurant?.name;
    }

    // Validate and set changedByType properly
    let finalChangedByType = changedByType || 'system';
    
    // Ensure changedByType is valid
    const validTypes = ['system', 'customer', 'restaurant', 'delivery'];
    if (!validTypes.includes(finalChangedByType)) {
      console.warn(`Invalid changedByType "${finalChangedByType}", defaulting to "system"`);
      finalChangedByType = 'system';
    }
    
    // If changedBy is provided and no valid changedByType, try to determine it
    if (changedBy && finalChangedByType === 'system') {
      // Check if changedBy is a restaurant user
      const { data: userType } = await supabase
        .from('user_types')
        .select('type')
        .eq('user_id', changedBy)
        .single();
      
      if (userType?.type === 'restaurant') {
        finalChangedByType = 'restaurant';
      } else if (userType?.type === 'customer') {
        finalChangedByType = 'customer';
      } else if (userType?.type === 'delivery') {
        finalChangedByType = 'delivery';
      }
    }

    // Add entry to order_history table with proper changed_by_type
    const { error: orderHistoryError } = await supabase
      .from('order_history')
      .insert({
        order_id: orderId,
        status,
        previous_status: oldStatus,
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        changed_by: changedBy,
        changed_by_type: finalChangedByType,
        details: {
          previous_status: oldStatus,
          updated_via: 'status-to-customer webhook',
          webhook_source: true
        }
      });

    if (orderHistoryError) {
      console.error('Error recording order history:', orderHistoryError);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
