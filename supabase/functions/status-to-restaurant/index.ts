import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StatusChange {
  table: string;
  record_id: string;
  status_column: string;
  new_status: string;
  old_status: string | null;
  metadata?: Record<string, any>;
}

/**
 * Validate user authentication from request headers
 */
const validateUserAuth = async (req: Request, supabase: any) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'No valid authorization header' };
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { user: null, error: 'Invalid or expired token' };
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error: 'Authentication validation failed' };
  }
};

/**
 * Validate user has access to the order
 */
const validateOrderAccess = async (supabase: any, orderId: string, userId: string) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id, 
        customer_id, 
        restaurant_id,
        restaurants!orders_restaurant_id_fkey (
          customer_id
        )
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return { hasAccess: false, message: 'Order not found' };
    }

    // Check if user owns the order or owns the restaurant
    const isOrderOwner = order.customer_id === userId;
    const isRestaurantOwner = order.restaurants?.user_id === userId;

    if (!isOrderOwner && !isRestaurantOwner) {
      return { hasAccess: false, message: 'Unauthorized access to order' };
    }

    return { hasAccess: true, message: 'Access granted' };
  } catch (error) {
    return { hasAccess: false, message: 'Error validating order access' };
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://hozgutjvbrljeijybnyg.supabase.co';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const TARGET_WEBHOOK_URL = Deno.env.get('TARGET_WEBHOOK_URL');

    if (!TARGET_WEBHOOK_URL) {
      throw new Error('TARGET_WEBHOOK_URL environment variable is not set');
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false }
      }
    );

    const statusChange: StatusChange = await req.json();
    
    if (!statusChange.table || !statusChange.record_id || !statusChange.status_column || !statusChange.new_status) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: table, record_id, status_column, new_status' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    // For order status changes, validate user access
    if (statusChange.table === 'orders' && statusChange.status_column === 'status') {
      const authValidation = await validateUserAuth(req, supabase);
      if (authValidation.user) {
        const accessValidation = await validateOrderAccess(
          supabase, 
          statusChange.record_id, 
          authValidation.user.id
        );
        if (!accessValidation.hasAccess) {
          console.warn(`Unauthorized access attempt: ${accessValidation.message}`);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: accessValidation.message 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
              status: 403 
            }
          );
        }
      }
    }

    console.log(`Forwarding status change: ${JSON.stringify(statusChange)}`);

    // Process status change based on table type to match the expected format
    let targetPayload;
    if (statusChange.table === 'orders' && statusChange.status_column === 'status') {
      // Get location data for the order to provide required latitude and longitude
      const { data: orderLocation } = await supabase
        .from('order_locations')
        .select('latitude, longitude')
        .eq('order_id', statusChange.record_id)
        .maybeSingle();
      
      // If no order location is found, try to get it from user_locations
      let latitude = orderLocation?.latitude;
      let longitude = orderLocation?.longitude;
      
      if (!latitude || !longitude) {
        // Get the user id from the order
        const { data: order } = await supabase
          .from('orders')
          .select('customer_id, restaurant_id')
          .eq('id', statusChange.record_id)
          .maybeSingle();
          
        if (order?.customer_id) {
          // Try to get the most recent location for this user
          const { data: userLocation } = await supabase
            .from('user_locations')
            .select('latitude, longitude')
            .eq('user_id', order.customer_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          latitude = userLocation?.latitude;
          longitude = userLocation?.longitude;
        }

        // Add entry to order_history table
        let restaurantName;
        if (order?.restaurant_id) {
          const { data: restaurant } = await supabase
            .from('restaurants')
            .select('name')
            .eq('id', order.restaurant_id)
            .single();
          
          restaurantName = restaurant?.name;
        }

        await supabase
          .from('order_history')
          .insert({
            order_id: statusChange.record_id,
            status: statusChange.new_status,
            restaurant_id: order?.restaurant_id,
            restaurant_name: restaurantName,
            details: {
              previous_status: statusChange.old_status,
              updated_via: 'status-to-restaurant webhook'
            }
          });
      }
      
      // Default coordinates if none are found
      latitude = latitude || 0;
      longitude = longitude || 0;
      
      // Adapting to the target webhook's expected format for orders
      targetPayload = {
        order_id: statusChange.record_id,
        status: statusChange.new_status,
        latitude,
        longitude,
        action: 'status_update'
      };
      
      console.log(`Formatted payload for order-webhook: ${JSON.stringify(targetPayload)}`);
    } else {
      // For other types of status changes, add default fields needed by order-webhook
      targetPayload = {
        ...statusChange,
        order_id: statusChange.record_id,
        latitude: 0,
        longitude: 0
      };
    }

    // Forward the status change to the target webhook
    const response = await fetch(TARGET_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(targetPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to forward status change: ${errorText}`);
    }

    // Log the status change in our database
    const { error: logError } = await supabase
      .from('status_change_logs')
      .insert({
        table_name: statusChange.table,
        record_id: statusChange.record_id,
        status_column: statusChange.status_column,
        old_status: statusChange.old_status,
        new_status: statusChange.new_status,
        metadata: statusChange.metadata
      });

    if (logError) {
      console.error('Error logging status change:', logError);
      // Don't throw here - the forwarding succeeded
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing status change:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
