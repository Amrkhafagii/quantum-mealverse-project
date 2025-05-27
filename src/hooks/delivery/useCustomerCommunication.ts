
import { useState, useEffect, useCallback } from 'react';
import { customerCommunicationService } from '@/services/communication/customerCommunicationService';
import type { CustomerCommunication } from '@/types/delivery-features';

export const useCustomerCommunication = (orderId?: string) => {
  const [messages, setMessages] = useState<CustomerCommunication[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNewMessage = useCallback((message: CustomerCommunication) => {
    setMessages(prev => [...prev, message]);
  }, []);

  useEffect(() => {
    if (!orderId) return;

    let unsubscribe: (() => void) | undefined;

    const initializeChat = async () => {
      setLoading(true);
      
      // Load existing messages
      const existingMessages = await customerCommunicationService.getOrderMessages(orderId);
      setMessages(existingMessages);

      // Subscribe to new messages
      unsubscribe = customerCommunicationService.subscribeToOrderMessages(
        orderId,
        handleNewMessage
      );

      setIsConnected(true);
      setLoading(false);
    };

    initializeChat();

    return () => {
      if (unsubscribe) unsubscribe();
      setIsConnected(false);
    };
  }, [orderId, handleNewMessage]);

  const sendMessage = async (
    senderId: string,
    recipientId: string,
    content: string,
    messageType: 'chat' | 'sms' | 'system' = 'chat',
    mediaUrls?: string[]
  ): Promise<boolean> => {
    if (!orderId) return false;

    const message = await customerCommunicationService.sendMessage(
      orderId,
      senderId,
      recipientId,
      content,
      messageType,
      mediaUrls
    );

    return !!message;
  };

  const markAsRead = async (messageId: string): Promise<boolean> => {
    const success = await customerCommunicationService.markMessageAsRead(messageId);
    
    if (success) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, is_read: true, read_at: new Date().toISOString() }
            : msg
        )
      );
    }

    return success;
  };

  const uploadMedia = async (file: File): Promise<string | null> => {
    if (!orderId) return null;
    return customerCommunicationService.uploadMedia(file, orderId);
  };

  return {
    messages,
    isConnected,
    loading,
    sendMessage,
    markAsRead,
    uploadMedia
  };
};
