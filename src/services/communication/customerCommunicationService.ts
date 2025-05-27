
import { supabase } from '@/integrations/supabase/client';
import type { CustomerCommunication } from '@/types/delivery-features';
import type { RealtimeChannel } from '@supabase/supabase-js';

class CustomerCommunicationService {
  private channels: Map<string, RealtimeChannel> = new Map();

  async sendMessage(
    orderId: string,
    senderId: string,
    recipientId: string,
    content: string,
    messageType: 'chat' | 'sms' | 'system' = 'chat',
    mediaUrls?: string[]
  ): Promise<CustomerCommunication | null> {
    try {
      const { data, error } = await supabase
        .from('customer_communications')
        .insert({
          order_id: orderId,
          sender_id: senderId,
          recipient_id: recipientId,
          message_type: messageType,
          content,
          media_urls: mediaUrls
        })
        .select()
        .single();

      if (error) throw error;

      // Send SMS if message type is SMS
      if (messageType === 'sms') {
        await this.sendSMSMessage(recipientId, content);
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  private async sendSMSMessage(recipientId: string, message: string): Promise<void> {
    try {
      // Get recipient phone number from delivery_info or user profile
      const { data: deliveryInfo } = await supabase
        .from('delivery_info')
        .select('phone')
        .eq('user_id', recipientId)
        .single();

      if (!deliveryInfo?.phone) {
        console.error('No phone number found for recipient:', recipientId);
        return;
      }

      // Call edge function to send SMS
      await supabase.functions.invoke('send-sms', {
        body: {
          to: deliveryInfo.phone,
          message
        }
      });
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  }

  async getOrderMessages(orderId: string): Promise<CustomerCommunication[]> {
    try {
      const { data, error } = await supabase
        .from('customer_communications')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  async markMessageAsRead(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('customer_communications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', messageId);

      return !error;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  subscribeToOrderMessages(
    orderId: string,
    onMessage: (message: CustomerCommunication) => void,
    onError?: (error: Error) => void
  ): () => void {
    const channelName = `order_messages_${orderId}`;
    
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
          table: 'customer_communications',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          onMessage(payload.new as CustomerCommunication);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to messages for order: ${orderId}`);
        } else if (status === 'CHANNEL_ERROR') {
          const error = new Error(`Failed to subscribe to messages: ${status}`);
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

  async uploadMedia(file: File, orderId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${orderId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('communications')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('communications')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      return null;
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach(channel => channel.unsubscribe());
    this.channels.clear();
  }
}

export const customerCommunicationService = new CustomerCommunicationService();
