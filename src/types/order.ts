
export interface Order {
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
  latitude?: number | null;
  longitude?: number | null;
  formatted_order_id?: string;
  created_at?: string;
  updated_at?: string;
  restaurant_id?: string;
  restaurant?: {
    id: string;
    name: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  order_items?: Array<OrderItem>;
  return_status?: string;
  return_reason?: string;
  return_images?: string[];
  refund_status?: string;
  refund_amount?: number;
  // New flexible ordering fields from Phase 5
  assignment_source?: string;
  is_mixed_order?: boolean;
}

export interface OrderItem {
  id: string;
  meal_id?: string | null; // Now nullable for flexible ordering
  menu_item_id?: string | null; // New field for traditional restaurant items
  name: string;
  price: number;
  quantity: number;
  created_at?: string;
  preparation_time?: number;
  source_type?: string; // New field to track item origin
}
