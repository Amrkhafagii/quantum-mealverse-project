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
