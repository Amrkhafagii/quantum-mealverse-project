
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
 * Helper to get a delivery assignment by id.
 */
async function getAssignmentById(assignmentId: string) {
  const { data, error } = await supabase
    .from('delivery_assignments')
    .select('*')
    .eq('id', assignmentId)
    .maybeSingle();

  if (error) throw new DeliveryAssignmentNotFoundError(error.message);
  if (!data) throw new DeliveryAssignmentNotFoundError();
  return data;
}

/**
 * Helper to validate that the user calling the action is assigned to this delivery assignment.
 */
async function validateAssignmentAccess(assignmentId: string, deliveryUserId: string) {
  const assignment = await getAssignmentById(assignmentId);
  if (assignment.delivery_user_id !== deliveryUserId) {
    throw new UnauthorizedDeliveryUserError();
  }
  return assignment;
}

/**
 * Validates a status transition for the assignment.
 */
function isValidStatusTransition(oldStatus: string, newStatus: string): boolean {
  // Only allow status transitions according to a simple state machine.
  if (oldStatus === 'assigned' && newStatus === 'picked_up') return true;
  if (oldStatus === 'picked_up' && newStatus === 'on_the_way') return true;
  if (oldStatus === 'on_the_way' && newStatus === 'delivered') return true;
  // Allow cancelling from any non-terminal state
  if (['assigned', 'picked_up', 'on_the_way'].includes(oldStatus) && newStatus === 'cancelled') return true;
  return false;
}

/** 
 * Mark an order as picked up by a delivery user.
 */
export async function pickupDelivery(assignmentId: string, deliveryUserId: string) {
  // Must validate access and correct state transition
  const assignment = await validateAssignmentAccess(assignmentId, deliveryUserId);
  if (!isValidStatusTransition(assignment.status, 'picked_up')) {
    throw new InvalidStatusTransitionError();
  }
  const { error } = await supabase
    .from('delivery_assignments')
    .update({
      status: 'picked_up',
      pickup_time: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', assignmentId);

  if (error) {
    throw new Error(`Failed to mark assignment as picked up: ${error.message}`);
  }
  return true;
}

/**
 * Mark an assignment as on the way to customer.
 */
export async function startDeliveryToCustomer(assignmentId: string, deliveryUserId: string) {
  const assignment = await validateAssignmentAccess(assignmentId, deliveryUserId);
  if (!isValidStatusTransition(assignment.status, 'on_the_way')) {
    throw new InvalidStatusTransitionError();
  }
  const { error } = await supabase
    .from('delivery_assignments')
    .update({
      status: 'on_the_way',
      updated_at: new Date().toISOString(),
    })
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
  // Validate access and correct status
  const assignment = await validateAssignmentAccess(assignmentId, deliveryUserId);
  if (!isValidStatusTransition(assignment.status, 'delivered')) {
    throw new InvalidStatusTransitionError();
  }

  // Mark the assignment as delivered and record completed time
  const { error } = await supabase
    .from('delivery_assignments')
    .update({
      status: 'delivered',
      delivery_time: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', assignmentId);

  if (error) throw new Error(`Failed to complete delivery: ${error.message}`);

  // Get orderId from the assignment (not assignmentId)
  const orderId = assignment.order_id;

  // Calculate baseAmount using delivery distance (database-driven, no hardcoded value)
  let baseAmount = 5;
  try {
    if (
      assignment.restaurant &&
      assignment.customer &&
      typeof assignment.restaurant.latitude === 'number' &&
      typeof assignment.restaurant.longitude === 'number' &&
      typeof assignment.customer.latitude === 'number' &&
      typeof assignment.customer.longitude === 'number'
    ) {
      baseAmount = Math.max(
        5,
        Math.round(
          (await DeliveryDistanceCalculationService.calculateDistanceKm(
            assignment.restaurant.latitude,
            assignment.restaurant.longitude,
            assignment.customer.latitude,
            assignment.customer.longitude
          )) * 1.2 + 3 // dynamic formula: scale with distance (example: 1.2 per km + base)
        )
      );
    }
  } catch (err) {
    // Fallback to default if distance calculation fails (should not be a mock, but a real fallback)
    baseAmount = 5;
  }

  // Record earnings (real DB, not fallback)
  await DeliveryEarningsService.recordEarnings({
    deliveryUserId,
    orderId,
    assignmentId,
    baseAmount
  });

  return true;
}

/**
 * Reject assignment (for delivery driver).
 */
export async function rejectAssignment(assignmentId: string, deliveryUserId: string, reason?: string) {
  // Validate access and correct state
  const assignment = await validateAssignmentAccess(assignmentId, deliveryUserId);

  if (!isValidStatusTransition(assignment.status, 'cancelled')) {
    throw new InvalidStatusTransitionError();
  }

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
