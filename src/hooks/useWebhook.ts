
import { supabase } from '@/integrations/supabase/client';

interface WebhookResponse {
  success: boolean;
  message?: string;
  error?: string;
  order_id?: string;
  status?: string;
}

export const useWebhook = () => {
  const callWebhook = async (endpoint: string, payload: any): Promise<WebhookResponse> => {
    try {
      // For now, call our edge function directly
      const { data, error } = await supabase.functions.invoke('order-webhook', {
        body: payload
      });
      
      if (error) {
        console.error('Error invoking order-webhook:', error);
        return {
          success: false,
          error: error.message || 'Failed to invoke webhook'
        };
      }

      return data as WebhookResponse;
    } catch (error: any) {
      console.error(`Error in callWebhook(${endpoint}):`, error);
      return {
        success: false,
        error: error.message || 'Unknown webhook error'
      };
    }
  };

  return {
    callWebhook
  };
};
