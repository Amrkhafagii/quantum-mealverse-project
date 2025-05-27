
export interface PushNotificationToken {
  id: string;
  user_id: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  device_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PushNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  data: Record<string, any>;
  notification_type: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sent_at?: string;
  delivered_at?: string;
  created_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  event_type: string;
  event_data: Record<string, any>;
  user_id?: string;
  delivery_user_id?: string;
  restaurant_id?: string;
  created_at: string;
}

export interface CustomerCommunication {
  id: string;
  order_id: string;
  sender_id: string;
  recipient_id: string;
  message_type: 'chat' | 'sms' | 'system';
  content: string;
  media_urls?: string[];
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface DeliveryConfirmation {
  id: string;
  delivery_assignment_id: string;
  confirmation_type: 'pickup' | 'delivery';
  photo_urls: string[];
  location_latitude?: number;
  location_longitude?: number;
  notes?: string;
  confirmed_by: string;
  confirmed_at: string;
}

export interface DeliveryRating {
  id: string;
  delivery_assignment_id: string;
  order_id: string;
  customer_id: string;
  delivery_user_id: string;
  rating: number;
  comment?: string;
  rating_categories: Record<string, number>;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  delivery_assignment_id?: string;
  order_id?: string;
  category: 'delivery_issue' | 'payment_issue' | 'quality_issue' | 'technical_issue' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  subject: string;
  description: string;
  attachments?: string[];
  assigned_to?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  attachments?: string[];
  is_internal: boolean;
  created_at: string;
}
