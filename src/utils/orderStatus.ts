
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
 * Validates if a status transition is allowed based on the database function
 * This is a client-side equivalent of the valid_status_transition database function
 */
export const isValidStatusTransition = (oldStatus: string, newStatus: string): boolean => {
  // Map to canonical statuses first
  const canonicalOldStatus = mapToCanonicalStatus(oldStatus);
  const canonicalNewStatus = mapToCanonicalStatus(newStatus);
  
  // Basic validation - actual validation should be enforced by the database
  switch (canonicalOldStatus) {
    case OrderStatus.PENDING:
      return [OrderStatus.AWAITING_RESTAURANT, OrderStatus.CANCELLED].includes(canonicalNewStatus);
    case OrderStatus.AWAITING_RESTAURANT:
      return [OrderStatus.RESTAURANT_ASSIGNED, OrderStatus.CANCELLED, OrderStatus.NO_RESTAURANT_AVAILABLE].includes(canonicalNewStatus);
    case OrderStatus.RESTAURANT_ASSIGNED:
      return [OrderStatus.RESTAURANT_ACCEPTED, OrderStatus.RESTAURANT_REJECTED, OrderStatus.EXPIRED_ASSIGNMENT].includes(canonicalNewStatus);
    case OrderStatus.RESTAURANT_ACCEPTED:
      return [OrderStatus.PREPARING].includes(canonicalNewStatus);
    case OrderStatus.PREPARING:
      return [OrderStatus.READY_FOR_PICKUP].includes(canonicalNewStatus);
    case OrderStatus.READY_FOR_PICKUP:
      return [OrderStatus.ON_THE_WAY].includes(canonicalNewStatus);
    case OrderStatus.ON_THE_WAY:
      return [OrderStatus.DELIVERED].includes(canonicalNewStatus);
    default:
      return false; // Terminal states
  }
};
