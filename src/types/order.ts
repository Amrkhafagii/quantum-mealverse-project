
export interface Order {
  id?: string;
  user_id: string;
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
  latitude?: number;
  longitude?: number;
  formatted_order_id?: string;
  created_at?: string;
  updated_at?: string;
  restaurant_id?: string;
  restaurant?: {
    id: string;
    name: string;
  };
  order_items?: Array<OrderItem>;
  return_status?: string;
  return_reason?: string;
  return_images?: string[];
  refund_status?: string;
  refund_amount?: number;
}

export interface OrderItem {
  id: string;
  meal_id: string;
  name: string;
  price: number;
  quantity: number;
  created_at?: string;
  preparation_time?: number;  // Added this field to fix the error
}
