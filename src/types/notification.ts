
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string; // Changed from 'type' to match database
  is_read: boolean;
  link?: string;
  created_at: string;
  data?: Record<string, any>;
  order_id?: string;
  restaurant_id?: string;
  delivery_user_id?: string;
  read_at?: string;
  updated_at?: string;
}
