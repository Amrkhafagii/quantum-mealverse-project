// Notification-related types with updated user ID naming

export interface Notification {
  id: string;
  notifications_user_id: string;
  title: string;
  message: string;
  type: 'order_status' | 'delivery_update' | 'promotion' | 'system' | 'achievement' | 'reminder';
  link?: string;
  data?: any;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerNotification {
  id: string;
  customer_id?: string;
  order_id?: string;
  notification_type: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  is_sent: boolean;
  sent_at?: string;
  read_at?: string;
  created_at: string;
}

export interface CustomerCommunication {
  id: string;
  sender_id: string;
  recipient_id: string;
  order_id: string;
  message_type: string;
  content: string;
  media_urls?: string[];
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  notification_preferences_user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  order_updates: boolean;
  promotional_messages: boolean;
  delivery_updates: boolean;
  achievement_notifications: boolean;
  workout_reminders: boolean;
  meal_plan_reminders: boolean;
  created_at: string;
  updated_at: string;
}

export interface PushNotificationToken {
  id: string;
  push_notification_tokens_user_id: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// --- FIX: Extended types for restaurant/assignment/promotions/reviews features ---

// RestaurantAssignment type with all expected fields
export interface RestaurantAssignment {
  id: string;
  order_id: string;
  restaurant_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  assigned_at: string;
  responded_at?: string;
  created_at: string;
  details?: any;
  expires_at?: string; // <-- add this field
  distance_km?: number; // <-- add this field
}

// PromotionType and RestaurantPromotion
export type PromotionType = 'discount' | 'free_item' | 'bogo' | 'special';

export interface RestaurantPromotion {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  promotion_type: PromotionType;
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  usage_count: number;
  applicable_items: any[];
  promo_code: string;
  terms_conditions: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RestaurantReview {
  id: string;
  user_id: string;
  restaurant_id: string;
  rating: number;
  comment: string;
  images: string[];
  is_verified_purchase: boolean;
  is_flagged: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RestaurantPerformanceMetrics {
  total_orders: number;
  total_revenue: number;
  average_rating: number;
  average_preparation_time: number;
}
