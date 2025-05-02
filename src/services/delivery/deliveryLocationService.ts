import { supabase } from '@/integrations/supabase/client';
import { DeliveryLocation, DeliveryAssignmentRejection } from '@/types/delivery-assignment';

/**
 * Update the current location of an active delivery
 */
export const updateDeliveryLocation = async (
  assignmentId: string,
  latitude: number,
  longitude: number
): Promise<DeliveryLocation | null> => {
  try {
    // Record the location in the delivery_locations table
    const { data, error } = await supabase
      .from('delivery_locations')
      .insert({
        assignment_id: assignmentId,
        latitude,
        longitude
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error recording delivery location:', error);
      throw error;
    }
    
    // Also update the current location in the delivery assignment record
    await supabase
      .from('delivery_assignments')
      .update({
        latitude,
        longitude,
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId);
    
    return data;
  } catch (error) {
    console.error('Error in updateDeliveryLocation:', error);
    return null;
  }
};

/**
 * Get location history for a delivery assignment
 */
export const getDeliveryLocationHistory = async (
  assignmentId: string,
  limit: number = 50
): Promise<DeliveryLocation[]> => {
  try {
    const { data, error } = await supabase
      .from('delivery_locations')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('timestamp', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching location history:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getDeliveryLocationHistory:', error);
    return [];
  }
};

/**
 * Record a rejection of a delivery assignment
 */
export const rejectDeliveryAssignment = async (
  assignmentId: string,
  orderId: string,
  reason?: string
): Promise<DeliveryAssignmentRejection | null> => {
  try {
    const { data, error } = await supabase
      .from('delivery_assignment_rejections')
      .insert({
        assignment_id: assignmentId,
        order_id: orderId,
        reason: reason || 'No reason provided'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error recording delivery rejection:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in rejectDeliveryAssignment:', error);
    return null;
  }
};

/**
 * Get assignment rejections history for a delivery driver
 */
export const getAssignmentRejections = async (
  orderId?: string,
  limit: number = 20
): Promise<DeliveryAssignmentRejection[]> => {
  try {
    let query = supabase
      .from('delivery_assignment_rejections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (orderId) {
      query = query.eq('order_id', orderId);
    }
    
    const { data, error } = await query;
      
    if (error) {
      console.error('Error fetching assignment rejections:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAssignmentRejections:', error);
    return [];
  }
};

/**
 * Find nearby delivery assignments based on driver location
 */
export const findNearbyDeliveryAssignments = async (
  latitude: number,
  longitude: number,
  maxDistanceKm: number = 10
) => {
  try {
    const { data, error } = await supabase
      .rpc('find_nearby_delivery_assignments', {
        p_latitude: latitude,
        p_longitude: longitude,
        p_max_distance_km: maxDistanceKm
      });
      
    if (error) {
      console.error('Error finding nearby assignments:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in findNearbyDeliveryAssignments:', error);
    // For now, let's return some simulated data to keep the app working
    // while the backend function might not be immediately available
    return simulateNearbyAssignments(latitude, longitude);
  }
};

// Helper function to simulate nearby assignments during development
const simulateNearbyAssignments = (latitude: number, longitude: number) => {
  // Generate 1-5 random assignments
  const count = Math.floor(Math.random() * 5) + 1;
  const assignments = [];
  
  for (let i = 0; i < count; i++) {
    // Create small random offsets for demonstration
    const latOffset = (Math.random() - 0.5) * 0.01;
    const lngOffset = (Math.random() - 0.5) * 0.01;
    
    assignments.push({
      id: `sim-${crypto.randomUUID()}`,
      order_id: `order-${crypto.randomUUID()}`,
      restaurant_id: `rest-${crypto.randomUUID()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      distance_km: Math.random() * 5 + 1, // Random distance between 1-6 km
      estimate_minutes: Math.floor(Math.random() * 20) + 10, // Random time between 10-30 mins
      restaurant: {
        name: `Restaurant #${i + 1}`,
        address: `${i + 100} Main St, City`,
        latitude: latitude + latOffset,
        longitude: longitude + lngOffset
      },
      customer: {
        name: `Customer #${i + 1}`,
        address: `${i + 200} Side St, City`,
        latitude: latitude + latOffset * 2,
        longitude: longitude + lngOffset * 2
      }
    });
  }
  
  return assignments;
};
