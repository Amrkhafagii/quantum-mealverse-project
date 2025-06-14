
// Notification-related types with updated user ID naming

export interface Notification {
  id: string;
  notifications_user_id: string; // Updated to match new naming convention
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
  customer_id?: string; // This might be customer_notifications_user_id in the database
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
  notification_preferences_user_id: string; // Updated to match new naming convention
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
  push_notification_tokens_user_id: string; // Updated to match new naming convention
  token: string;
  platform: 'ios' | 'android' | 'web';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
