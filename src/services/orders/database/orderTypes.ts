
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
  // Add/remove fields as needed to match DB schema
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
  preparation_time?: number;
  source_type?: string;
}

export function orderRowToOrder(row: OrderDB): Order {
  return row; // Direct assign for now, expand if transformation needed
}

export function orderItemRowToOrderItem(row: OrderItemDB): OrderItem {
  return row as OrderItem;
}
