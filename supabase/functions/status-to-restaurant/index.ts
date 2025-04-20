
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

    console.log(`Forwarding status change: ${JSON.stringify(statusChange)}`);

    // Process status change based on table type
    let targetPayload;
    if (statusChange.table === 'orders' && statusChange.status_column === 'status') {
      // Adapting to the target webhook's expected format for orders
      targetPayload = {
        orderId: statusChange.record_id,
        status: statusChange.new_status
      };
    } else {
      // For other types of status changes, forward the original payload
      targetPayload = statusChange;
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
