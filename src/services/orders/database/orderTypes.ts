
import { Order, OrderItem } from '@/types/order';

export interface OrderDB {
  id?: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  notes?: string;
  delivery_method: string;
  payment_method: string;
  delivery_fee: number;
  subtotal: number;
  total: number;
  status: string;
  assignment_source?: string;
  is_mixed_order?: boolean;
  restaurant_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItemDB {
  id: string;
  order_id: string;
  meal_id?: string | null;
  menu_item_id?: string | null;
  name: string;
  price: number;
  quantity: number;
  created_at?: string;
  source_type?: string;
}

export function orderRowToOrder(row: OrderDB): Order {
  return row as Order;
}

export function orderItemRowToOrderItem(row: OrderItemDB): OrderItem {
  return row as OrderItem;
}
