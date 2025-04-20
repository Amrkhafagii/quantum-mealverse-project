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
  order_items?: Array<{
    id: string;
    meal_id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  return_status?: string;
  return_reason?: string;
  return_images?: string[];
  refund_status?: string;
  refund_amount?: number;
  restaurant_attempts?: {
    restaurants: Array<{
      restaurant_id: string;
      name: string;
      distance_km?: number;
    }>;
    current_attempt: number;
  };
}
