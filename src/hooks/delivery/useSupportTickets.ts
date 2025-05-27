
import { useState, useEffect } from 'react';
import { supportTicketService } from '@/services/support/supportTicketService';
import type { SupportTicket } from '@/types/delivery-features';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useSupportTickets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadTickets();
    }
  }, [user?.id]);

  const loadTickets = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const userTickets = await supportTicketService.getUserTickets(user.id);
      setTickets(userTickets);
    } finally {
      setLoading(false);
    }
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
    try {
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
        setTickets(prev => [ticket, ...prev]);
        toast({
          title: 'Support ticket created',
          description: `Ticket ${ticket.ticket_number} has been created`,
        });
      } else {
        toast({
          title: 'Failed to create ticket',
          description: 'Please try again later',
          variant: 'destructive'
        });
      }

      return ticket;
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (
    ticketId: string,
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
  ): Promise<boolean> => {
    const success = await supportTicketService.updateTicketStatus(ticketId, status);
    
    if (success) {
      setTickets(prev =>
        prev.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, status, updated_at: new Date().toISOString() }
            : ticket
        )
      );
    }

    return success;
  };

  return {
    tickets,
    loading,
    createTicket,
    updateTicketStatus,
    loadTickets
  };
};
