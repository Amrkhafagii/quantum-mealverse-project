
import { supabase } from '@/integrations/supabase/client';
import type { SupportTicket, CreateSupportTicketData } from '@/types/delivery-features';

export const supportTicketService = {
  async createTicket(
    userId: string,
    category: 'delivery_issue' | 'payment_issue' | 'quality_issue' | 'technical_issue' | 'other',
    subject: string,
    description: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    orderId?: string,
    deliveryAssignmentId?: string,
    attachments?: string[]
  ): Promise<SupportTicket | null> {
    try {
      // Generate a ticket number
      const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{
          support_tickets_user_id: userId, // Use correct database field name
          ticket_number: ticketNumber,
          subject,
          description,
          category,
          priority,
          status: 'open',
          order_id: orderId,
          delivery_assignment_id: deliveryAssignmentId,
          attachments: attachments || []
        }])
        .select()
        .single();

      if (error) throw error;

      // Map database response to SupportTicket type
      const ticket: SupportTicket = {
        ...data,
        user_id: data.support_tickets_user_id, // Map database field to expected field
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };

      return ticket;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      return null;
    }
  },

  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('support_tickets_user_id', userId) // Use correct database field name
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map database response to SupportTicket array
      return (data || []).map(item => ({
        ...item,
        user_id: item.support_tickets_user_id, // Map database field to expected field
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      return [];
    }
  },

  async getTicketById(ticketId: string): Promise<SupportTicket | null> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (error) throw error;

      // Map database response to SupportTicket type
      const ticket: SupportTicket = {
        ...data,
        user_id: data.support_tickets_user_id, // Map database field to expected field
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };

      return ticket;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      return null;
    }
  },

  async updateTicketStatus(
    ticketId: string,
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      return false;
    }
  },

  async addTicketMessage(
    ticketId: string,
    message: string,
    senderId: string,
    senderType: 'user' | 'admin' = 'user'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('support_ticket_messages')
        .insert([{
          ticket_id: ticketId,
          message,
          sender_id: senderId,
          sender_type: senderType
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding ticket message:', error);
      return false;
    }
  },

  async getTicketMessages(ticketId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('support_ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching ticket messages:', error);
      return [];
    }
  },

  async assignTicket(ticketId: string, adminUserId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          assigned_to: adminUserId,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error assigning ticket:', error);
      return false;
    }
  },

  async getTicketsByStatus(status: string): Promise<SupportTicket[]> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map database response to SupportTicket array
      return (data || []).map(item => ({
        ...item,
        user_id: item.support_tickets_user_id, // Map database field to expected field
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching tickets by status:', error);
      return [];
    }
  },

  async getTicketStats(userId?: string): Promise<any> {
    try {
      let query = supabase
        .from('support_tickets')
        .select('status');

      if (userId) {
        query = query.eq('support_tickets_user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        open: data?.filter(t => t.status === 'open').length || 0,
        in_progress: data?.filter(t => t.status === 'in_progress').length || 0,
        resolved: data?.filter(t => t.status === 'resolved').length || 0,
        closed: data?.filter(t => t.status === 'closed').length || 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
      return {
        total: 0,
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0
      };
    }
  },

  // Fixed: Removed the incorrect function signature and implemented proper createTicket
  async createSupportTicket(ticketData: CreateSupportTicketData): Promise<SupportTicket | null> {
    return this.createTicket(
      ticketData.user_id,
      ticketData.category,
      ticketData.subject,
      ticketData.description,
      ticketData.priority,
      ticketData.order_id,
      ticketData.delivery_assignment_id,
      ticketData.attachments
    );
  }
};
