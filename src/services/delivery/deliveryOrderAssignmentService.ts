
import { supabase } from '@/integrations/supabase/client';
import { DeliveryAssignment } from '@/types/delivery';
import { toast } from '@/hooks/use-toast';

// Find nearby delivery assignments for a user based on their location
export const findNearbyAssignments = async (
  latitude: number, 
  longitude: number,
  maxDistanceKm: number = 10
): Promise<DeliveryAssignment[]> => {
  try {
    // Call a database function to find nearby orders awaiting assignment
    // This assumes you have a PostgreSQL function to calculate distance
    const { data, error } = await supabase.rpc('find_nearby_delivery_assignments', {
      user_lat: latitude,
      user_lng: longitude,
      max_distance_km: maxDistanceKm
    });
    
    if (error) {
      console.error('Error finding nearby assignments:', error);
      throw error;
    }
    
    return data || [];
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
    await supabase.from('order_history').insert({
      order_id: data.order_id,
      status: 'delivery_assigned',
      details: { 
        delivery_user_id: deliveryUserId,
        assigned_at: new Date().toISOString()
      }
    });
    
    return data;
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
      .select('order_id')
      .eq('id', assignmentId)
      .single();
      
    if (error) {
      throw error;
    }
    
    // Record the rejection, but don't change assignment status
    // This allows the assignment to be offered to other delivery users
    await supabase.from('delivery_assignment_rejections').insert({
      assignment_id: assignmentId,
      reason: reason || 'No reason provided',
      order_id: data.order_id
    });
    
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
    const { error } = await supabase
      .from('delivery_locations')
      .insert({
        assignment_id: assignmentId,
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error updating delivery location:', error);
      throw error;
    }
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
    const { data, error } = await updateDeliveryStatus(assignmentId, 'picked_up');
    
    if (error) {
      throw error;
    }
    
    return data;
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
    const { data, error } = await updateDeliveryStatus(assignmentId, 'on_the_way');
    
    if (error) {
      throw error;
    }
    
    return data;
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
    const { data: updatedAssignment, error } = await updateDeliveryStatus(assignmentId, 'delivered');
    
    if (error) {
      throw error;
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
      details: { 
        delivered_at: new Date().toISOString(),
        delivery_user_id: deliveryUserId
      }
    });
    
    // Record earnings for the delivery
    const totalAmount = baseAmount + tipAmount;
    await supabase
      .from('delivery_earnings')
      .insert({
        delivery_user_id: deliveryUserId,
        order_id: assignment.order_id,
        base_amount: baseAmount,
        tip_amount: tipAmount,
        total_amount: totalAmount,
        status: 'pending'
      });
    
    // Update delivery user statistics
    await supabase.rpc('increment_delivery_count', { 
      user_id: deliveryUserId 
    });
    
    return updatedAssignment;
  } catch (error) {
    console.error('Error in completeDelivery:', error);
    toast({
      title: "Error completing delivery",
      description: error.message,
      variant: "destructive",
    });
    throw error;
  }
};

// Utility function to update delivery status
const updateDeliveryStatus = async (
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
      
    return result;
  } catch (error) {
    console.error('Error updating delivery status:', error);
    throw error;
  }
};
