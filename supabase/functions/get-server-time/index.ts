
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Define CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the current server timestamp
    const timestamp = new Date().toISOString();
    console.log(`Server time requested, returning: ${timestamp}`);
    
    // Return the server time as JSON with CORS headers
    return new Response(
      JSON.stringify({
        timestamp,
        server: true
      }),
      {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error in get-server-time function:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get server time',
        message: error.message 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
        status: 500 
      }
    );
  }
});
