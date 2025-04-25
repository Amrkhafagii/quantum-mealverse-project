
import { OrderStatus } from '@/types/webhook';

export const mapToCanonicalStatus = (status: string): OrderStatus => {
  switch (status) {
    case 'accepted':
      return OrderStatus.RESTAURANT_ACCEPTED;
    case 'rejected':
      return OrderStatus.RESTAURANT_REJECTED;
    case 'preparing':
      return OrderStatus.PREPARING;
    case 'ready':
      return OrderStatus.READY_FOR_PICKUP;
    case 'delivering':
      return OrderStatus.ON_THE_WAY;
    case 'completed':
      return OrderStatus.DELIVERED;
    default:
      return status as OrderStatus;
  }
};

export const mapToSimplifiedStatus = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.RESTAURANT_ACCEPTED:
      return 'accepted';
    case OrderStatus.RESTAURANT_REJECTED:
      return 'rejected';
    case OrderStatus.PREPARING:
      return 'preparing';
    case OrderStatus.READY_FOR_PICKUP:
      return 'ready';
    case OrderStatus.ON_THE_WAY:
      return 'delivering';
    case OrderStatus.DELIVERED:
      return 'completed';
    default:
      return status;
  }
};

/**
 * Validates if a status transition is allowed based on business rules
 * This is a client-side equivalent of the valid_status_transition database function
 * @param oldStatus Current status of the order
 * @param newStatus New status to transition to
 * @returns boolean indicating if the transition is valid
 */
export const isValidStatusTransition = (oldStatus: string, newStatus: string): boolean => {
  // Map to canonical statuses first
  const canonicalOldStatus = mapToCanonicalStatus(oldStatus);
  const canonicalNewStatus = mapToCanonicalStatus(newStatus);
  
  // Define valid transitions for each status
  switch (canonicalOldStatus) {
    case OrderStatus.PENDING:
      return [OrderStatus.AWAITING_RESTAURANT, OrderStatus.CANCELLED].includes(canonicalNewStatus);
      
    case OrderStatus.AWAITING_RESTAURANT:
      return [OrderStatus.RESTAURANT_ASSIGNED, OrderStatus.CANCELLED, OrderStatus.NO_RESTAURANT_AVAILABLE].includes(canonicalNewStatus);
      
    case OrderStatus.RESTAURANT_ASSIGNED:
      return [
        OrderStatus.RESTAURANT_ACCEPTED, 
        OrderStatus.RESTAURANT_REJECTED, 
        OrderStatus.EXPIRED_ASSIGNMENT,
        OrderStatus.NO_RESTAURANT_ACCEPTED,
        OrderStatus.CANCELLED
      ].includes(canonicalNewStatus);
      
    case OrderStatus.RESTAURANT_ACCEPTED:
      return [OrderStatus.PROCESSING, OrderStatus.CANCELLED].includes(canonicalNewStatus);
      
    case OrderStatus.PROCESSING:
      return [OrderStatus.PREPARING, OrderStatus.CANCELLED].includes(canonicalNewStatus);
      
    case OrderStatus.PREPARING:
      return [OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED].includes(canonicalNewStatus);
      
    case OrderStatus.READY_FOR_PICKUP:
      return [OrderStatus.ON_THE_WAY, OrderStatus.CANCELLED].includes(canonicalNewStatus);
      
    case OrderStatus.ON_THE_WAY:
      return [OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(canonicalNewStatus);
      
    case OrderStatus.DELIVERED:
      return [OrderStatus.REFUNDED].includes(canonicalNewStatus);
      
    case OrderStatus.CANCELLED:
      // Cancelled is generally a terminal state, but refunds can be processed
      return [OrderStatus.REFUNDED].includes(canonicalNewStatus);
      
    case OrderStatus.REFUNDED:
      // Refunded is a terminal state
      return false;
      
    case OrderStatus.EXPIRED_ASSIGNMENT:
    case OrderStatus.NO_RESTAURANT_AVAILABLE:
    case OrderStatus.NO_RESTAURANT_ACCEPTED:
    case OrderStatus.RESTAURANT_REJECTED:
      // These can be retried or cancelled
      return [
        OrderStatus.AWAITING_RESTAURANT, 
        OrderStatus.CANCELLED
      ].includes(canonicalNewStatus);
      
    default:
      return false; // Unknown states
  }
};
