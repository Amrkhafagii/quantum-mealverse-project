
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
