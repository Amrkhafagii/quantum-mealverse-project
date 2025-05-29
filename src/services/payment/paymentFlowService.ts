
import { supabase } from '@/integrations/supabase/client';
import {
  PaymentTransaction,
  PaymentConfirmation,
  TipDistribution,
  PaymentStatusCoordination,
  PaymentNotification,
  ProcessPaymentRequest,
  ConfirmPaymentRequest,
  ProcessTipRequest
} from '@/types/payment-flow';

export class PaymentFlowService {
  // Process a payment transaction
  async processPayment(request: ProcessPaymentRequest): Promise<string> {
    try {
      const { data, error } = await (supabase.rpc as any)('process_payment_transaction', {
        p_order_id: request.orderId,
        p_customer_id: request.customerId,
        p_transaction_type: request.transactionType,
        p_amount: request.amount,
        p_payment_method: request.paymentMethod,
        p_external_transaction_id: request.externalTransactionId || null
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Confirm a payment
  async confirmPayment(request: ConfirmPaymentRequest): Promise<boolean> {
    try {
      const { data, error } = await (supabase.rpc as any)('confirm_payment', {
        p_confirmation_id: request.confirmationId,
        p_confirming_user_id: request.confirmingUserId,
        p_confirmation_method: request.confirmationMethod || 'app'
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  // Process tip distribution
  async processTip(request: ProcessTipRequest): Promise<string> {
    try {
      const { data, error } = await (supabase.rpc as any)('process_tip_distribution', {
        p_order_id: request.orderId,
        p_total_tip_amount: request.totalTipAmount,
        p_driver_tip_percentage: request.driverTipPercentage || 100.00
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error processing tip:', error);
      throw error;
    }
  }

  // Get payment status coordination for an order
  async getPaymentStatus(orderId: string): Promise<PaymentStatusCoordination | null> {
    try {
      const { data, error } = await supabase
        .from('payment_status_coordination')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as PaymentStatusCoordination | null;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  // Get payment transactions for an order
  async getPaymentTransactions(orderId: string): Promise<PaymentTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as PaymentTransaction[];
    } catch (error) {
      console.error('Error getting payment transactions:', error);
      throw error;
    }
  }

  // Get payment confirmations for an order
  async getPaymentConfirmations(orderId: string): Promise<PaymentConfirmation[]> {
    try {
      const { data, error } = await supabase
        .from('payment_confirmations')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as PaymentConfirmation[];
    } catch (error) {
      console.error('Error getting payment confirmations:', error);
      throw error;
    }
  }

  // Get tip distributions for an order
  async getTipDistributions(orderId: string): Promise<TipDistribution[]> {
    try {
      const { data, error } = await supabase
        .from('tip_distributions')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as TipDistribution[];
    } catch (error) {
      console.error('Error getting tip distributions:', error);
      throw error;
    }
  }

  // Get payment notifications for a user
  async getPaymentNotifications(userId: string): Promise<PaymentNotification[]> {
    try {
      const { data, error } = await supabase
        .from('payment_notifications')
        .select('*')
        .eq('recipient_id', userId)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return (data || []) as PaymentNotification[];
    } catch (error) {
      console.error('Error getting payment notifications:', error);
      throw error;
    }
  }

  // Mark payment notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('payment_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Send payment notification
  async sendNotification(
    orderId: string,
    recipientId: string,
    recipientType: PaymentNotification['recipient_type'],
    notificationType: PaymentNotification['notification_type'],
    title: string,
    message: string,
    amount?: number
  ): Promise<string> {
    try {
      const { data, error } = await (supabase.rpc as any)('send_payment_notification', {
        p_order_id: orderId,
        p_recipient_id: recipientId,
        p_recipient_type: recipientType,
        p_notification_type: notificationType,
        p_title: title,
        p_message: message,
        p_amount: amount || null
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending payment notification:', error);
      throw error;
    }
  }

  // Subscribe to payment status changes
  subscribeToPaymentStatus(
    orderId: string,
    onStatusChange: (status: PaymentStatusCoordination) => void,
    onError?: (error: any) => void
  ) {
    const channel = supabase
      .channel(`payment_status_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_status_coordination',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          console.log('Payment status changed:', payload);
          if (payload.new) {
            onStatusChange(payload.new as PaymentStatusCoordination);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_confirmations',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          console.log('Payment confirmation changed:', payload);
          // Refresh status when confirmations change
          this.getPaymentStatus(orderId).then((status) => {
            if (status) onStatusChange(status);
          }).catch(onError);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Subscribe to payment notifications
  subscribeToNotifications(
    userId: string,
    onNotification: (notification: PaymentNotification) => void
  ) {
    const channel = supabase
      .channel(`payment_notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payment_notifications',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          console.log('New payment notification:', payload);
          if (payload.new) {
            onNotification(payload.new as PaymentNotification);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const paymentFlowService = new PaymentFlowService();
