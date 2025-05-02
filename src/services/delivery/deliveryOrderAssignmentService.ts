
import { supabase } from '@/integrations/supabase/client';
import { DeliveryAssignment } from '@/types/delivery-assignment';
import { toast } from '@/hooks/use-toast';
import { rejectDeliveryAssignment } from './deliveryLocationService';

// Find nearby delivery assignments for a user based on their location
export const findNearbyAssignments = async (
  latitude: number, 
  longitude: number,
  maxDistanceKm: number = 10
): Promise<DeliveryAssignment[]> => {
  try {
    // Since we can't directly call the PostgreSQL function, we'll query for assignments
    // in a simulated way (in a real app, we'd have an RPC or API endpoint)
    const { data, error } = await supabase
      .from('delivery_assignments')
      .select('*, restaurant:restaurant_id(*)')
      .eq('status', 'pending')
      .limit(5); // Get a few assignments for testing
    
    if (error) {
      console.error('Error finding nearby assignments:', error);
      throw error;
    }
    
    // Add simulated distance information based on the user's location
    return (data || []).map(assignment => ({
      ...assignment,
      distance_km: Math.random() * 5 + 1, // Random distance between 1-6 km
      estimate_minutes: Math.round(Math.random() * 20 + 10), // Random time between 10-30 mins
      status: assignment.status as DeliveryAssignment['status']
    }));
  } catch (error) {
    console.error('Error in findNearbyAssignments:', error);
    throw error;
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

// Reject a delivery assignment
export const rejectDeliveryAssignment = async (
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
    await rejectDeliveryAssignment(assignmentId, data.order_id, reason);
    
    // If this becomes a real feature, we'd implement:
    // await supabase.from('delivery_assignment_rejections').insert({
    //   assignment_id: assignmentId,
    //   order_id: data.order_id,
    //   reason: reason || 'No reason provided',
    //   delivery_user_id: data.delivery_user_id,
    // });
  } catch (error) {
    console.error('Error in rejectDeliveryAssignment:', error);
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
    
    // If this becomes a real feature with location history tracking, we'd implement:
    // await supabase.from('delivery_locations').insert({
    //   assignment_id: assignmentId,
    //   latitude,
    //   longitude,
    //   timestamp: new Date().toISOString()
    // });
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
