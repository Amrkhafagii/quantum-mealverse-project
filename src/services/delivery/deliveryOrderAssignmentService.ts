import { supabase } from '@/integrations/supabase/client';
import { DeliveryAssignment } from '@/types/delivery-assignment';
import { toast } from '@/hooks/use-toast';
// Remove the conflicting import
// import { rejectDeliveryAssignment } from './deliveryLocationService';

// Find nearby delivery assignments for a user based on their location
export const findNearbyAssignments = async (
  latitude: number, 
  longitude: number,
  maxDistanceKm: number = 10
): Promise<DeliveryAssignment[]> => {
  try {
    // Query for actual pending delivery assignments
    const { data, error } = await supabase
      .from('delivery_assignments')
      .select(`
        *,
        restaurant:restaurant_id(*),
        orders:order_id(*)
      `)
      .eq('status', 'pending')
      .is('delivery_user_id', null); // Only get unassigned deliveries
    
    if (error) {
      console.error('Error finding nearby assignments:', error);
      throw error;
    }
    
    // Add distance information based on the user's location
    const assignments = (data || []).map(assignment => {
      // Calculate approximate distance (simplified calculation)
      const restaurantLat = assignment.restaurant?.latitude || 0;
      const restaurantLng = assignment.restaurant?.longitude || 0;
      
      // Simple distance calculation (Haversine would be more accurate)
      const latDiff = Math.abs(latitude - restaurantLat);
      const lngDiff = Math.abs(longitude - restaurantLng);
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Rough km conversion
      
      return {
        ...assignment,
        distance_km: parseFloat(distance.toFixed(2)), 
        estimate_minutes: Math.round(distance * 3) + 10, // Rough estimate: 3 min per km + 10 min base time
        status: assignment.status as DeliveryAssignment['status']
      };
    });
    
    // Filter by distance and sort by proximity
    return assignments
      .filter(a => a.distance_km <= maxDistanceKm)
      .sort((a, b) => a.distance_km - b.distance_km);
  } catch (error) {
    console.error('Error in findNearbyAssignments:', error);
    throw error;
  }
};

// Create a delivery assignment for an order that's ready for pickup
export const createDeliveryAssignmentForOrder = async (
  orderId: string,
  restaurantId: string
): Promise<DeliveryAssignment | null> => {
  try {
    // Check if assignment already exists
    const { data: existingAssignment, error: checkError } = await supabase
      .from('delivery_assignments')
      .select('*')
      .eq('order_id', orderId)
      .single();
      
    if (existingAssignment) {
      console.log(`Delivery assignment already exists for order ${orderId}`);
      return existingAssignment as DeliveryAssignment;
    }
    
    // Get restaurant info for location data
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('name, latitude, longitude')
      .eq('id', restaurantId)
      .single();
      
    if (restaurantError) {
      console.error('Error fetching restaurant data:', restaurantError);
      throw restaurantError;
    }
    
    // Create new delivery assignment
    const { data: newAssignment, error: createError } = await supabase
      .from('delivery_assignments')
      .insert({
        order_id: orderId,
        restaurant_id: restaurantId,
        status: 'pending',
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (createError) {
      console.error('Error creating delivery assignment:', createError);
      throw createError;
    }
    
    console.log(`Created new delivery assignment for order ${orderId}`);
    
    // Record in order history
    await supabase.from('order_history').insert({
      order_id: orderId,
      status: 'delivery_requested',
      restaurant_id: restaurantId,
      restaurant_name: restaurant.name,
      details: { assignment_id: newAssignment.id }
    });
    
    return newAssignment as DeliveryAssignment;
  } catch (error) {
    console.error('Error in createDeliveryAssignmentForOrder:', error);
    return null;
  }
};

// Accept a delivery assignment
export const acceptDeliveryAssignment = async (
  assignmentId: string,
  deliveryUserId: string
): Promise<DeliveryAssignment> => {
  try {
    const { data, error } = await supabase
      .from('delivery_assignments')
      .update({ 
        delivery_user_id: deliveryUserId,
        status: 'assigned',
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId)
      .eq('status', 'pending') // Only accept if still pending
      .select()
      .single();
      
    if (error) {
      console.error('Error accepting assignment:', error);
      throw error;
    }
    
    // Record the assignment in order history
    const assignment = data as DeliveryAssignment;
    await supabase.from('order_history').insert({
      order_id: assignment.order_id,
      status: 'delivery_assigned',
      restaurant_id: assignment.restaurant_id,
      restaurant_name: 'Restaurant', // We'll need to fetch this in a real app
      details: { 
        delivery_user_id: deliveryUserId,
        assigned_at: new Date().toISOString()
      }
    });
    
    return {
      ...assignment,
      status: assignment.status as DeliveryAssignment['status']
    };
  } catch (error) {
    console.error('Error in acceptDeliveryAssignment:', error);
    throw error;
  }
};

// Reject a delivery assignment - renamed to avoid conflicts
export const rejectAssignment = async (
  assignmentId: string,
  reason?: string
): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('delivery_assignments')
      .select('order_id, delivery_user_id')
      .eq('id', assignmentId)
      .single();
      
    if (error) {
      throw error;
    }
    
    // Store rejection data in the delivery_assignment_rejections table
    await supabase.from('delivery_assignment_rejections').insert({
      assignment_id: assignmentId,
      order_id: data.order_id,
      reason: reason || 'No reason provided'
    });
  } catch (error) {
    console.error('Error in rejectAssignment:', error);
    throw error;
  }
};

// Update delivery location during active delivery
export const updateDeliveryLocation = async (
  assignmentId: string,
  latitude: number,
  longitude: number
): Promise<void> => {
  try {
    // Update the delivery assignment with current location
    await supabase
      .from('delivery_assignments')
      .update({ 
        latitude,
        longitude,
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId);
    
    // In a production app, we would also store location history for tracking
    // Here we'll just log it
    console.log(`Location updated for delivery ${assignmentId}: ${latitude}, ${longitude}`);
    
    // Store location in the dedicated delivery_locations table
    await supabase.from('delivery_locations').insert({
      assignment_id: assignmentId,
      latitude,
      longitude
    });
  } catch (error) {
    console.error('Error in updateDeliveryLocation:', error);
    throw error;
  }
};

// Mark delivery as picked up from restaurant
export const pickupDelivery = async (
  assignmentId: string
): Promise<DeliveryAssignment> => {
  try {
    const result = await updateDeliveryStatus(assignmentId, 'picked_up');
    
    if (result.error) {
      throw result.error;
    }
    
    return result.data;
  } catch (error) {
    console.error('Error in pickupDelivery:', error);
    throw error;
  }
};

// Mark delivery as on the way to customer
export const startDeliveryToCustomer = async (
  assignmentId: string
): Promise<DeliveryAssignment> => {
  try {
    const result = await updateDeliveryStatus(assignmentId, 'on_the_way');
    
    if (result.error) {
      throw result.error;
    }
    
    return result.data;
  } catch (error) {
    console.error('Error in startDeliveryToCustomer:', error);
    throw error;
  }
};

// Complete delivery
export const completeDelivery = async (
  assignmentId: string,
  deliveryUserId: string,
  baseAmount: number = 5.0,
  tipAmount: number = 0
): Promise<DeliveryAssignment> => {
  try {
    // Get the assignment to verify it's valid
    const { data: assignment, error: assignmentError } = await supabase
      .from('delivery_assignments')
      .select('*, orders:order_id(*)')
      .eq('id', assignmentId)
      .eq('delivery_user_id', deliveryUserId)
      .single();
      
    if (assignmentError) {
      throw assignmentError;
    }
    
    // Mark as delivered
    const result = await updateDeliveryStatus(assignmentId, 'delivered');
    
    if (result.error) {
      throw result.error;
    }
    
    // Update order status
    await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', assignment.order_id);
      
    // Record order history
    await supabase.from('order_history').insert({
      order_id: assignment.order_id,
      status: 'delivered',
      restaurant_id: assignment.restaurant_id,
      restaurant_name: 'Restaurant', // We'd get this from the restaurant in a real app
      details: { 
        delivered_at: new Date().toISOString(),
        delivery_user_id: deliveryUserId
      }
    });
    
    // In a real app, we would record earnings for the delivery
    // Since we don't have a dedicated earnings table yet, we'll simulate it
    const earningData = {
      delivery_user_id: deliveryUserId,
      order_id: assignment.order_id,
      base_amount: baseAmount,
      tip_amount: tipAmount,
      total_amount: baseAmount + tipAmount,
      timestamp: new Date().toISOString()
    };
    
    console.log('Recording earnings', earningData);
    
    // Update delivery user statistics (simulated)
    console.log('Updating delivery stats for user', deliveryUserId);
    
    return result.data;
  } catch (error) {
    console.error('Error in completeDelivery:', error);
    toast({
      title: "Error completing delivery",
      description: (error as Error).message,
      variant: "destructive",
    });
    throw error;
  }
};

// Utility function to update delivery status
export const updateDeliveryStatus = async (
  assignmentId: string,
  status: DeliveryAssignment['status']
): Promise<{ data: DeliveryAssignment, error: any }> => {
  try {
    const result = await supabase
      .from('delivery_assignments')
      .update({
        status,
        ...(status === 'picked_up' ? { pickup_time: new Date().toISOString() } : {}),
        ...(status === 'delivered' ? { delivery_time: new Date().toISOString() } : {}),
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId)
      .select()
      .single();
      
    if (result.error) {
      return { data: null as unknown as DeliveryAssignment, error: result.error };
    }
    
    // Cast the status to the expected type
    const typedData: DeliveryAssignment = {
      ...result.data,
      status: result.data.status as DeliveryAssignment['status']
    };
    
    return { data: typedData, error: null };
  } catch (error) {
    console.error('Error updating delivery status:', error);
    return { data: null as unknown as DeliveryAssignment, error };
  }
};
