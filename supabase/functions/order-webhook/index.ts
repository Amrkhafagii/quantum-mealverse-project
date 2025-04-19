
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to get nearest restaurants
async function findNearestRestaurants(supabase, latitude, longitude, maxDistance = 50, limit = 3) {
  // Use RPC call with explicit parameter names to avoid ambiguity
  const { data, error } = await supabase.rpc('find_nearest_restaurant', {
    order_lat: latitude,
    order_lng: longitude,
    max_distance_km: maxDistance
  })

  if (error) {
    console.error('Error finding nearest restaurants:', error)
    return null
  }

  return data
}

// Helper to update order status
async function updateOrderStatus(supabase, orderId, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    console.error(`Error updating order ${orderId} status to ${status}:`, error)
    return null
  }

  return data
}

// Helper to create a restaurant assignment
async function createRestaurantAssignment(supabase, orderId, restaurantId, expiresAt) {
  const { data, error } = await supabase
    .from('restaurant_assignments')
    .insert({
      order_id: orderId,
      restaurant_id: restaurantId,
      status: 'pending',
      expires_at: expiresAt
    })
    .select()
    .single()

  if (error) {
    console.error(`Error creating assignment for order ${orderId} to restaurant ${restaurantId}:`, error)
    return null
  }

  return data
}

// Helper to log assignment attempts
async function logAssignmentAttempt(supabase, orderId, restaurantId, status, notes = null) {
  const { error } = await supabase
    .from('restaurant_assignment_history')
    .insert({
      order_id: orderId,
      restaurant_id: restaurantId,
      status,
      notes
    })

  if (error) {
    console.error(`Error logging assignment history:`, error)
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://hozgutjvbrljeijybnyg.supabase.co'
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvemd1dGp2YnJsamVpanlibnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5ODc0MjksImV4cCI6MjA2MDU2MzQyOX0.Wy8X0JuOVDQZTVZWtwF42fdcsuPjsGVJJ4slPqMCWT4'
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // Create Supabase client
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
        auth: { persistSession: false }
      }
    )

    // Parse request body
    const requestData = await req.json()
    console.log('Received webhook request:', requestData)

    // Validate required fields
    if (!requestData.order_id || !requestData.latitude || !requestData.longitude) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: order_id, latitude, longitude' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { order_id, latitude, longitude } = requestData
    const action = requestData.action || 'assign'

    // Check if it's an action from a restaurant
    if (action === 'accept' || action === 'reject') {
      if (!requestData.restaurant_id || !requestData.assignment_id) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Missing restaurant_id or assignment_id for accept/reject action' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      const { restaurant_id, assignment_id } = requestData
      
      // Verify assignment exists and is still valid
      const { data: assignment, error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .select('*')
        .eq('id', assignment_id)
        .eq('order_id', order_id)
        .eq('restaurant_id', restaurant_id)
        .eq('status', 'pending')
        .single()
      
      if (assignmentError || !assignment) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid or expired assignment' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Check if assignment is expired
      if (new Date(assignment.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Assignment has expired' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Update assignment status
      const { error: updateError } = await supabase
        .from('restaurant_assignments')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', assignment_id)
      
      if (updateError) {
        console.error('Error updating assignment:', updateError)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update assignment' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      // Log the action
      await logAssignmentAttempt(supabase, order_id, restaurant_id, action)

      // If accepted, update order status and restaurant_id
      if (action === 'accept') {
        const { error: orderUpdateError } = await supabase
          .from('orders')
          .update({ 
            status: 'processing', 
            restaurant_id: restaurant_id 
          })
          .eq('id', order_id)
        
        if (orderUpdateError) {
          console.error('Error updating order after acceptance:', orderUpdateError)
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to update order' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Order accepted successfully',
            order_id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else { // Rejection case
        // Trigger reassignment
        const result = await handleAssignment(supabase, order_id, latitude, longitude)
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Order rejected, reassignment processed',
            result
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // For new assignment requests
    if (action === 'assign') {
      const result = await handleAssignment(supabase, order_id, latitude, longitude)
      return new Response(
        JSON.stringify({ success: true, result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Default response for unrecognized actions
    return new Response(
      JSON.stringify({ success: false, error: 'Unrecognized action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function handleAssignment(supabase, orderId, latitude, longitude) {
  // Check current assignment count for this order
  const { data: assignmentCount, error: countError } = await supabase
    .from('restaurant_assignment_history')
    .select('id', { count: 'exact' })
    .eq('order_id', orderId)
  
  if (countError) {
    console.error('Error checking assignment count:', countError)
    return { success: false, error: 'Failed to check assignment count' }
  }

  // If already tried 3 times, return error
  if (assignmentCount?.count >= 3) {
    await updateOrderStatus(supabase, orderId, 'assignment_failed')
    return { 
      success: false, 
      error: 'Maximum assignment attempts reached',
      retryAllowed: true
    }
  }

  // Find nearest restaurant with explicitly named parameters to avoid function ambiguity
  const nearestRestaurants = await findNearestRestaurants(supabase, latitude, longitude)
  
  if (!nearestRestaurants || nearestRestaurants.length === 0) {
    await updateOrderStatus(supabase, orderId, 'no_restaurants_available')
    return { 
      success: false, 
      error: 'No restaurants available within range'
    }
  }

  // Get restaurant that hasn't been tried yet for this order
  const { data: previousAttempts } = await supabase
    .from('restaurant_assignment_history')
    .select('restaurant_id')
    .eq('order_id', orderId)
  
  const triedRestaurantIds = previousAttempts?.map(a => a.restaurant_id) || []
  
  // Find first restaurant that hasn't been tried
  const availableRestaurant = nearestRestaurants.find(r => 
    !triedRestaurantIds.includes(r.restaurant_id)
  )

  if (!availableRestaurant) {
    await updateOrderStatus(supabase, orderId, 'no_available_restaurants')
    return { 
      success: false, 
      error: 'No more available restaurants to try',
      retryAllowed: true
    }
  }

  // Create expiration time (5 minutes from now)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  // Create assignment
  const assignment = await createRestaurantAssignment(
    supabase, 
    orderId, 
    availableRestaurant.restaurant_id,
    expiresAt
  )

  if (!assignment) {
    return { 
      success: false, 
      error: 'Failed to create restaurant assignment'
    }
  }

  // Log the assignment attempt
  await logAssignmentAttempt(
    supabase, 
    orderId, 
    availableRestaurant.restaurant_id, 
    'assigned',
    `Assignment expires at ${expiresAt}`
  )

  // Update order status
  await updateOrderStatus(supabase, orderId, 'awaiting_restaurant')

  return { 
    success: true, 
    message: 'Order assigned to restaurant',
    restaurant_id: availableRestaurant.restaurant_id,
    assignment_id: assignment.id,
    expires_at: expiresAt,
    attempt_number: (assignmentCount?.count || 0) + 1
  }
}
