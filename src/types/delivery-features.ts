
export interface SupportTicket {
  id: string;
  user_id: string; // Required field
  support_tickets_user_id?: string; // Database field name for compatibility
  ticket_number: string;
  category: 'delivery_issue' | 'payment_issue' | 'quality_issue' | 'technical_issue' | 'other';
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  order_id?: string;
  delivery_assignment_id?: string;
  assigned_to?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface CreateSupportTicketData {
  user_id: string;
  category: 'delivery_issue' | 'payment_issue' | 'quality_issue' | 'technical_issue' | 'other';
  subject: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  order_id?: string;
  delivery_assignment_id?: string;
  attachments?: string[];
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
