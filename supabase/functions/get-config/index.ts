
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

interface ConfigRequest {
  key: string
}

export const getConfig = async (req: Request) => {
  try {
    const { key } = (await req.json()) as ConfigRequest
    
    if (!key) {
      return withCors(
        new Response(
          JSON.stringify({ error: 'Key parameter is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      )
    }
    
    // Create a Supabase client with the service role key (only available in edge functions)
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
    
    // Query the app_config table for the requested key
    const { data, error } = await supabase
      .from('app_config')
      .select('value, is_secret')
      .eq('key', key)
      .maybeSingle()
    
    if (error) {
      console.error('Error fetching config:', error)
      return withCors(
        new Response(
          JSON.stringify({ error: 'Failed to fetch configuration' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      )
    }
    
    if (!data) {
      return withCors(
        new Response(
          JSON.stringify({ error: 'Configuration key not found', key }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        )
      )
    }
    
    return withCors(
      new Response(
        JSON.stringify({ 
          key,
          value: data.value,
          is_secret: data.is_secret 
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
  
  // Handle GET method for retrieving app configuration
  if (req.method === 'POST') {
    return await getConfig(req)
  }
  
  // Return 405 for other methods
  return withCors(
    new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  )
})
