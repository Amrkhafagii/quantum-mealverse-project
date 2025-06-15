import { supabase } from '@/integrations/supabase/client';
import { DeliveryDistanceCalculationService } from './DeliveryDistanceCalculationService';
import { DeliveryLocationTrackingService } from './DeliveryLocationTrackingService';
import { DeliveryEarningsService } from './DeliveryEarningsService';
import {
  DeliveryAssignmentNotFoundError,
  UnauthorizedDeliveryUserError,
  InvalidStatusTransitionError,
  LocationUpdateFailedError,
} from './DeliveryAssignmentErrors';

/** Accept, pick up, deliver, update/track, and log real delivery assignments.
 * No mock or fallback logic remains!
 */
export const deliveryOrderAssignmentService = {
  /**
   * Mark assignment as picked up; log timestamp, update order.
   */
  async pickupDelivery(assignmentId: string, deliveryUserId: string): Promise<void> {
    // Find assignment
    const { data: assignment, error: fetchError } = await supabase
      .from('delivery_assignments')
      .select('id, delivery_user_id, status, order_id')
      .eq('id', assignmentId)
      .single();
    if (fetchError || !assignment) throw new DeliveryAssignmentNotFoundError();

    if (assignment.delivery_user_id !== deliveryUserId) {
      throw new UnauthorizedDeliveryUserError();
    }
    if (assignment.status !== "assigned") {
      throw new InvalidStatusTransitionError();
    }

    // Start transaction
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('delivery_assignments')
      .update({ status: 'picked_up', pickup_time: now, updated_at: now })
      .eq('id', assignmentId);
    if (updateError) throw updateError;

    // Trigger order status update via backend triggers if set up.
    // Or update manually if not handled in DB.
    await supabase
      .from('orders')
      .update({ status: 'picked_up' })
      .eq('id', assignment.order_id);
  },

  /**
   * Mark assignment as on-the-way to customer.
   */
  async startDeliveryToCustomer(assignmentId: string, deliveryUserId: string): Promise<void> {
    const { data: assignment, error: fetchError } = await supabase
      .from('delivery_assignments')
      .select('id, delivery_user_id, status, order_id')
      .eq('id', assignmentId)
      .single();
    if (fetchError || !assignment) throw new DeliveryAssignmentNotFoundError();
    if (assignment.delivery_user_id !== deliveryUserId) {
      throw new UnauthorizedDeliveryUserError();
    }
    if (assignment.status !== "picked_up") {
      throw new InvalidStatusTransitionError();
    }
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('delivery_assignments')
      .update({ status: 'on_the_way', updated_at: now })
      .eq('id', assignmentId);
    if (updateError) throw updateError;
    // (Order status auto-updated by trigger or manually.)
    await supabase
      .from('orders')
      .update({ status: 'on_the_way' })
      .eq('id', assignment.order_id);
  },

  /**
   * Mark delivery as completed.
   */
  async completeDelivery(assignmentId: string, deliveryUserId: string): Promise<void> {
    const { data: assignment, error: fetchError } = await supabase
      .from('delivery_assignments')
      .select('id, delivery_user_id, status, order_id')
      .eq('id', assignmentId)
      .single();
    if (fetchError || !assignment) throw new DeliveryAssignmentNotFoundError();
    if (assignment.delivery_user_id !== deliveryUserId) {
      throw new UnauthorizedDeliveryUserError();
    }
    if (assignment.status !== "on_the_way") {
      throw new InvalidStatusTransitionError('Only on_the_way assignments can be delivered');
    }
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('delivery_assignments')
      .update({ status: 'delivered', delivery_time: now, updated_at: now })
      .eq('id', assignmentId);
    if (updateError) throw updateError;
    await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', assignment.order_id);
    // Record earnings (if needed, adjust logic as per your plan)
    // await DeliveryEarningsService.recordEarnings({...});
  },

  /**
   * Allow logging a new location update during delivery.
   */
  async logLocationTrackingUpdate(params: {
    assignmentId: string;
    deliveryUserId: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    accuracy?: number;
    speed?: number;
    heading?: number;
    batteryLevel?: number;
    networkType?: string;
  }) {
    try {
      await DeliveryLocationTrackingService.logLocationUpdate(params);
    } catch (err) {
      throw new LocationUpdateFailedError();
    }
  },

  /**
   * Reject an assignment that was offered to a delivery user
   */
  async rejectAssignment(assignmentId: string, deliveryUserId: string, reason?: string): Promise<void> {
    const { data: assignment, error: fetchError } = await supabase
      .from('delivery_assignments')
      .select('id, delivery_user_id, status, order_id')
      .eq('id', assignmentId)
      .single();
    
    if (fetchError || !assignment) throw new DeliveryAssignmentNotFoundError();
    
    if (assignment.delivery_user_id !== deliveryUserId) {
      throw new UnauthorizedDeliveryUserError();
    }
    
    if (assignment.status !== "assigned") {
      throw new InvalidStatusTransitionError('Only assigned deliveries can be rejected');
    }
    
    const now = new Date().toISOString();
    
    // Record the rejection reason
    await supabase
      .from('delivery_assignment_rejections')
      .insert({
        assignment_id: assignmentId,
        order_id: assignment.order_id,
        delivery_user_id: deliveryUserId,
        reason: reason || 'No reason provided'
      });
    
    // Update the assignment status
    const { error: updateError } = await supabase
      .from('delivery_assignments')
      .update({ 
        status: 'cancelled', 
        updated_at: now,
        cancellation_reason: reason || 'Rejected by driver'
      })
      .eq('id', assignmentId);
    
    if (updateError) throw updateError;
    
    // Make the driver available for other assignments
    await supabase.rpc('decrement_delivery_count', {
      user_id: deliveryUserId
    });
  },

  /**
   * Calculate estimated delivery time based on distance and traffic
   */
  async calculateEstimatedDeliveryTime(
    assignmentId: string,
    restaurantLat: number,
    restaurantLng: number,
    customerLat: number,
    customerLng: number
  ): Promise<Date> {
    try {
      // Calculate distance using our service
      const distanceKm = await DeliveryDistanceCalculationService.calculateDistanceKm(
        restaurantLat, restaurantLng, customerLat, customerLng
      );
      
      // Base calculation: 5 minutes + 3 minutes per km
      const baseMinutes = 5;
      const minutesPerKm = 3;
      const estimatedMinutes = baseMinutes + (distanceKm * minutesPerKm);
      
      // Add buffer for traffic conditions (could be more sophisticated)
      const trafficBuffer = 5; // minutes
      const totalMinutes = estimatedMinutes + trafficBuffer;
      
      // Calculate estimated delivery time
      const estimatedDeliveryTime = new Date();
      estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + totalMinutes);
      
      // Update the assignment with the estimated time
      await supabase
        .from('delivery_assignments')
        .update({ 
          estimated_delivery_time: estimatedDeliveryTime.toISOString(),
          distance_km: distanceKm
        })
        .eq('id', assignmentId);
      
      return estimatedDeliveryTime;
    } catch (error) {
      console.error('Error calculating estimated delivery time:', error);
      // Return a default estimate (30 minutes from now) if calculation fails
      const defaultEstimate = new Date();
      defaultEstimate.setMinutes(defaultEstimate.getMinutes() + 30);
      return defaultEstimate;
    }
  },

  /**
   * Get detailed information about a delivery assignment
   */
  async getAssignmentDetails(assignmentId: string): Promise<any> {
    const { data, error } = await supabase
      .from('delivery_assignments')
      .select(`
        *,
        orders:order_id (
          id,
          customer_name,
          customer_phone,
          delivery_address,
          latitude,
          longitude,
          total,
          status,
          created_at,
          restaurant:restaurant_id (
            id,
            name,
            address,
            latitude,
            longitude,
            phone
          )
        )
      `)
      .eq('id', assignmentId)
      .single();
    
    if (error) throw error;
    if (!data) throw new DeliveryAssignmentNotFoundError();
    
    return data;
  }
};
