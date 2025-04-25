
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  description?: string;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
  user_id: string;
  logo_url?: string;
  opening_hours?: {
    [key: string]: { open: string; close: string }
  };
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  category: string;
  preparation_time: number;
  created_at?: string;
  updated_at?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  AWAITING_RESTAURANT = 'awaiting_restaurant',
  RESTAURANT_ASSIGNED = 'restaurant_assigned',
  RESTAURANT_ACCEPTED = 'accepted',
  RESTAURANT_REJECTED = 'rejected',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready',
  ON_THE_WAY = 'delivering',
  DELIVERED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  NO_RESTAURANT_ACCEPTED = 'no_restaurant_accepted',
  EXPIRED_ASSIGNMENT = 'expired_assignment'
}

export interface OrderItem {
  id: string;
  order_id: string;
  meal_id: string;
  menu_item_id?: string; // Make this optional to handle both meal_id and menu_item_id
  name: string;
  price: number;
  quantity: number;
  created_at?: string;
}

export interface RestaurantOrder {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  status: OrderStatus;
  total: number;
  delivery_fee: number;
  delivery_method: string;
  created_at: string;
  updated_at: string;
  formatted_order_id?: string;
  order_items: OrderItem[];
}
