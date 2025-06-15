export interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  country?: string;
  phone: string;
  phone_number?: string;
  email: string;
  description?: string;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
  user_id: string;
  logo_url?: string;
  cover_image_url?: string;
  cuisine_type?: string;
  delivery_fee?: number;
  delivery_radius?: number;
  rating?: number;
  menu_url?: string;
  business_license?: string;
  website_url?: string;
  opening_hours?: {
    [key: string]: { open: string; close: string }
  };
  payment_methods?: string[];
  terms_and_conditions?: string;
  privacy_policy?: string;
  cancellation_policy?: string;
  verification_status?: string;
  is_verified?: boolean;
  onboarding_status?: string;
  onboarding_step?: number;
  onboarding_completed_at?: string;
  postal_code?: string;
  minimum_order_amount?: number;
  estimated_delivery_time?: number;
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
  ingredients?: string[];
  steps?: string[];
  nutritional_info?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    allergens?: string[];
    health_score?: number;
  };
}

export enum OrderStatus {
  PENDING = 'pending',
  AWAITING_RESTAURANT = 'awaiting_restaurant',
  RESTAURANT_ASSIGNED = 'restaurant_assigned',
  RESTAURANT_ACCEPTED = 'restaurant_accepted',
  RESTAURANT_REJECTED = 'restaurant_rejected',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  ON_THE_WAY = 'on_the_way',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  NO_RESTAURANT_ACCEPTED = 'no_restaurant_accepted',
  EXPIRED_ASSIGNMENT = 'expired_assignment'
}

export interface OrderItem {
  id: string;
  order_id: string;
  meal_id: string;
  menu_item_id?: string;
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
