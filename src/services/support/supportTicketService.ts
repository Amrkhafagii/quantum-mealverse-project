
import { supabase } from '@/integrations/supabase/client';
import type { SupportTicket, SupportTicketMessage } from '@/types/delivery-features';
import type { RealtimeChannel } from '@supabase/supabase-js';

class SupportTicketService {
  private channels: Map<string, RealtimeChannel> = new Map();

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
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: userId,
          category,
          subject,
          description,
          priority,
          order_id: orderId,
          delivery_assignment_id: deliveryAssignmentId,
          attachments
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        category: data.category as 'delivery_issue' | 'payment_issue' | 'quality_issue' | 'technical_issue' | 'other',
        priority: data.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: data.status as 'open' | 'in_progress' | 'resolved' | 'closed'
      };
    } catch (error) {
      console.error('Error creating support ticket:', error);
      return null;
    }
  }

  async getUserTickets(userId: string, status?: string): Promise<SupportTicket[]> {
    try {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      return (data || []).map(item => ({
        ...item,
        category: item.category as 'delivery_issue' | 'payment_issue' | 'quality_issue' | 'technical_issue' | 'other',
        priority: item.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: item.status as 'open' | 'in_progress' | 'resolved' | 'closed'
      }));
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      return [];
    }
  }

  async getTicket(ticketId: string): Promise<SupportTicket | null> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (error) throw error;
      return {
        ...data,
        category: data.category as 'delivery_issue' | 'payment_issue' | 'quality_issue' | 'technical_issue' | 'other',
        priority: data.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: data.status as 'open' | 'in_progress' | 'resolved' | 'closed'
      };
    } catch (error) {
      console.error('Error fetching ticket:', error);
      return null;
    }
  }

  async addMessage(
    ticketId: string,
    senderId: string,
    message: string,
    attachments?: string[],
    isInternal = false
  ): Promise<SupportTicketMessage | null> {
    try {
      const { data, error } = await supabase
        .from('support_ticket_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: senderId,
          message,
          attachments,
          is_internal: isInternal
        })
        .select()
        .single();

      if (error) throw error;

      // Update ticket's updated_at timestamp
      await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      return data;
    } catch (error) {
      console.error('Error adding ticket message:', error);
      return null;
    }
  }

  async getTicketMessages(ticketId: string): Promise<SupportTicketMessage[]> {
    try {
      const { data, error } = await supabase
        .from('support_ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .eq('is_internal', false)
        .order('created_at', { ascending: true });

      return data || [];
    } catch (error) {
      console.error('Error fetching ticket messages:', error);
      return [];
    }
  }

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

      return !error;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      return false;
    }
  }

  async uploadAttachment(file: File, ticketId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${ticketId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('support-attachments')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('support-attachments')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      return null;
    }
  }

  subscribeToTicketMessages(
    ticketId: string,
    onMessage: (message: SupportTicketMessage) => void,
    onError?: (error: Error) => void
  ): () => void {
    const channelName = `ticket_messages_${ticketId}`;
    
    // Remove existing channel if it exists
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
      this.channels.delete(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_ticket_messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => {
          console.log('New ticket message received:', payload);
          onMessage(payload.new as SupportTicketMessage);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to messages for ticket: ${ticketId}`);
        } else if (status === 'CHANNEL_ERROR') {
          const error = new Error(`Failed to subscribe to ticket messages: ${status}`);
          console.error(error);
          if (onError) onError(error);
        }
      });

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  unsubscribeAll(): void {
    this.channels.forEach(channel => channel.unsubscribe());
    this.channels.clear();
  }
}

export const supportTicketService = new SupportTicketService();
