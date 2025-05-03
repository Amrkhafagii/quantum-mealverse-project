
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
export const corsResponse = () => {
  return new Response(null, {
    headers: corsHeaders,
    status: 204,
  })
}

// Add CORS headers to all responses
export const withCors = (response: Response) => {
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value)
  }
  return response
}

interface InitConfigRequest {
  admin_key: string;
  google_maps_api_key: string;
}

export const initAppConfig = async (req: Request) => {
  try {
    const adminSecret = Deno.env.get('ADMIN_SECRET_KEY')
    if (!adminSecret) {
      return withCors(
        new Response(
          JSON.stringify({ error: 'Admin secret not configured' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      )
    }

    const { admin_key, google_maps_api_key } = (await req.json()) as InitConfigRequest
    
    // Verify admin key
    if (!admin_key || admin_key !== adminSecret) {
      return withCors(
        new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      )
    }
    
    if (!google_maps_api_key) {
      return withCors(
        new Response(
          JSON.stringify({ error: 'API key is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      )
    }
    
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return withCors(
        new Response(
          JSON.stringify({ error: 'Server configuration error' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Check if app_config table exists
    const { error: tableCheckError } = await supabase
      .from('app_config')
      .select('key', { count: 'exact', head: true })
      .limit(1)
    
    // If table doesn't exist, create it
    if (tableCheckError && tableCheckError.message.includes('relation "app_config" does not exist')) {
      // Create table via SQL - edge functions can't create tables directly
      const { error: createTableError } = await supabase.rpc('create_app_config_table')
      
      if (createTableError) {
        console.error('Error creating table:', createTableError)
        return withCors(
          new Response(
            JSON.stringify({ 
              error: 'Failed to create app_config table',
              details: createTableError.message
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        )
      }
    }
    
    // Upsert the Google Maps API key
    const { error: upsertError } = await supabase
      .from('app_config')
      .upsert(
        { 
          key: 'google_maps_api_key',
          value: google_maps_api_key,
          description: 'Google Maps API key for maps integration', 
          is_secret: true,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      )
    
    if (upsertError) {
      return withCors(
        new Response(
          JSON.stringify({ 
            error: 'Failed to save configuration',
            details: upsertError.message 
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      )
    }
    
    return withCors(
      new Response(
        JSON.stringify({ 
          success: true,
          message: 'Configuration initialized successfully'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return withCors(
      new Response(
        JSON.stringify({ error: 'An unexpected error occurred' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    )
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return corsResponse()
  }
  
  // Handle POST method for setting up app configuration
  if (req.method === 'POST') {
    return await initAppConfig(req)
  }
  
  // Return 405 for other methods
  return withCors(
    new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  )
})
