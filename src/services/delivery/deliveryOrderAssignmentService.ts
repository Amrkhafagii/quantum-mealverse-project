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
 * Helper to get a restaurant by id.
 */
async function getRestaurantById(restaurantId: string) {
  const { data, error } = await supabase
    .from('restaurants')
    .select('id, name, address, latitude, longitude')
    .eq('id', restaurantId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Helper to get customer (delivery address/user) by order id.
 * We assume "orders" has customer info + optionally order_locations for precise lat/lng.
 */
async function getCustomerByOrderId(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('customer_name:customer_name, delivery_address:delivery_address, id')
    .eq('id', orderId)
    .maybeSingle();
  if (error) throw new Error(error.message);

  // Try to find latest order location for lat/lng
  const { data: loc, error: locErr } = await supabase
    .from('order_locations')
    .select('latitude, longitude')
    .eq('order_id', orderId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (locErr) throw new Error(locErr.message);

  return {
    name: data?.customer_name ?? '',
    address: data?.delivery_address ?? '',
    latitude: loc?.latitude,
    longitude: loc?.longitude
  };
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

  // Get orderId and restaurantId from the assignment
  const orderId = assignment.order_id;
  const restaurantId = assignment.restaurant_id;

  // Look up restaurant details
  const restaurant = restaurantId ? await getRestaurantById(restaurantId) : undefined;
  // Look up customer details using order id
  const customer = orderId ? await getCustomerByOrderId(orderId) : undefined;

  // Calculate baseAmount using delivery distance (DB-driven)
  let baseAmount: number = 5;
  try {
    if (
      restaurant &&
      customer &&
      typeof restaurant.latitude === 'number' &&
      typeof restaurant.longitude === 'number' &&
      typeof customer.latitude === 'number' &&
      typeof customer.longitude === 'number'
    ) {
      baseAmount = Math.max(
        5,
        Math.round(
          (await DeliveryDistanceCalculationService.calculateDistanceKm(
            restaurant.latitude,
            restaurant.longitude,
            customer.latitude,
            customer.longitude
          )) * 1.2 + 3
        )
      );
    }
  } catch (err) {
    // No fallback/default, just throw
    throw err;
  }

  // Record earnings (real DB)
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
