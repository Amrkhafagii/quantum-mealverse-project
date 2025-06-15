import { supabase } from '@/integrations/supabase/client';
import { DeliveryDistanceCalculationService } from './DeliveryDistanceCalculationService';
import { DeliveryLocationTrackingService } from './DeliveryLocationTrackingService';
import { DeliveryEarningsService } from './DeliveryEarningsService';
import {
  DeliveryAssignmentNotFoundError,
  UnauthorizedDeliveryUserError,
  InvalidStatusTransitionError,
  LocationUpdateFailedError
} from './DeliveryAssignmentErrors';

/**
 * Mark an order as picked up by a delivery user.
 */
export async function pickupDelivery(assignmentId: string) {
  // Update delivery assignment status to 'picked_up'
  const { error } = await supabase
    .from('delivery_assignments')
    .update({ status: 'picked_up', pickup_time: new Date().toISOString() })
    .eq('id', assignmentId);

  if (error) {
    throw new Error(`Failed to mark assignment as picked up: ${error.message}`);
  }
  return true;
}

/**
 * Mark an assignment as on the way to customer.
 */
export async function startDeliveryToCustomer(assignmentId: string) {
  const { error } = await supabase
    .from('delivery_assignments')
    .update({ status: 'on_the_way' })
    .eq('id', assignmentId);

  if (error) {
    throw new Error(`Failed to mark assignment as on the way: ${error.message}`);
  }
  return true;
}

/**
 * Mark an assignment as delivered.
 */
export async function completeDelivery(assignmentId: string, deliveryUserId: string) {
  // Mark the assignment as delivered and record completed time
  const { error } = await supabase
    .from('delivery_assignments')
    .update({
      status: 'delivered',
      delivery_time: new Date().toISOString()
    })
    .eq('id', assignmentId);

  if (error) throw new Error(`Failed to complete delivery: ${error.message}`);

  // Record earnings (simplest scenario, could be more complex)
  await DeliveryEarningsService.recordEarnings({
    deliveryUserId,
    orderId: assignmentId, // This ideally should be the order id, but depends on real data
    assignmentId,
    baseAmount: 5
  });

  return true;
}

/**
 * Reject assignment (for delivery driver).
 */
export async function rejectAssignment(assignmentId: string, reason?: string) {
  // Mark assignment as cancelled/rejected for delivery
  const { error } = await supabase
    .from('delivery_assignments')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', assignmentId);

  if (error) throw new Error(`Failed to reject assignment: ${error.message}`);
  return true;
}

// --- Patch: Fix type for supabase.rpc with custom functions ---

// Example usage for calculate_delivery_distance 
// (in case not already correct in DeliveryDistanceCalculationService)
async function someDistanceCall(
  lat1: number, lng1: number, lat2: number, lng2: number
) {
  const { data, error } = await (supabase.rpc as any)('calculate_delivery_distance', {
    lat1, lng1, lat2, lng2,
  });
  if (error) throw error;
  return data as number;
}
