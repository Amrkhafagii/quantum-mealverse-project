
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order_status' | 'system' | 'promotion';
  is_read: boolean;
  link?: string;
  created_at: string;
}
