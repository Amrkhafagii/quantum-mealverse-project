
import { Order, OrderItem } from '@/types/order';
import { OrderDB, OrderItemDB } from './orderTypes';

export function mapOrderDBToOrder(db: OrderDB): Order {
  // If further transformation needed, add here
  return {
    ...db,
  };
}

export function mapOrderItemDBToOrderItem(db: OrderItemDB): OrderItem {
  // If further transformation needed, add here
  return {
    ...db,
  };
}
