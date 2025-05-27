
import { useState, useEffect, useCallback } from 'react';
import { supportTicketService } from '@/services/support/supportTicketService';
import type { SupportTicket, SupportTicketMessage } from '@/types/delivery-features';
import { useAuth } from '@/hooks/useAuth';

export const useSupportTickets = (ticketId?: string) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleNewMessage = useCallback((message: SupportTicketMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadUserTickets();
    }
  }, [user?.id]);

  useEffect(() => {
    if (ticketId) {
      loadTicketDetails();
      loadTicketMessages();
      
      // Subscribe to new messages
      const unsubscribe = supportTicketService.subscribeToTicketMessages(
        ticketId,
        handleNewMessage
      );

      setIsConnected(true);

      return () => {
        unsubscribe();
        setIsConnected(false);
      };
    }
  }, [ticketId, handleNewMessage]);

  const loadUserTickets = async () => {
    if (!user?.id) return;

    setLoading(true);
    const userTickets = await supportTicketService.getUserTickets(user.id);
    setTickets(userTickets);
    setLoading(false);
  };

  const loadTicketDetails = async () => {
    if (!ticketId) return;

    const ticket = await supportTicketService.getTicket(ticketId);
    setCurrentTicket(ticket);
  };

  const loadTicketMessages = async () => {
    if (!ticketId) return;

    const ticketMessages = await supportTicketService.getTicketMessages(ticketId);
    setMessages(ticketMessages);
  };

  const createTicket = async (
    category: 'delivery_issue' | 'payment_issue' | 'quality_issue' | 'technical_issue' | 'other',
    subject: string,
    description: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    orderId?: string,
    deliveryAssignmentId?: string,
    attachments?: string[]
  ): Promise<SupportTicket | null> => {
    if (!user?.id) return null;

    setLoading(true);
    const ticket = await supportTicketService.createTicket(
      user.id,
      category,
      subject,
      description,
      priority,
      orderId,
      deliveryAssignmentId,
      attachments
    );

    if (ticket) {
      await loadUserTickets();
    }

    setLoading(false);
    return ticket;
  };

  const addMessage = async (
    message: string,
    attachments?: string[]
  ): Promise<boolean> => {
    if (!ticketId || !user?.id) return false;

    const newMessage = await supportTicketService.addMessage(
      ticketId,
      user.id,
      message,
      attachments
    );

    return !!newMessage;
  };

  const updateStatus = async (
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
  ): Promise<boolean> => {
    if (!ticketId) return false;

    const success = await supportTicketService.updateTicketStatus(ticketId, status);
    
    if (success) {
      await loadTicketDetails();
      await loadUserTickets();
    }

    return success;
  };

  const uploadAttachment = async (file: File): Promise<string | null> => {
    if (!ticketId) return null;
    return supportTicketService.uploadAttachment(file, ticketId);
  };

  return {
    tickets,
    currentTicket,
    messages,
    loading,
    isConnected,
    createTicket,
    addMessage,
    updateStatus,
    uploadAttachment,
    loadUserTickets
  };
};
