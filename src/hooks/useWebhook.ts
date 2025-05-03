
import { supabase } from '@/integrations/supabase/client';

interface WebhookResponse {
  success: boolean;
  message?: string;
  error?: any;
  data?: any;
}

export function useWebhook() {
  const callWebhook = async (
    hookType: string, 
    payload: Record<string, any>
  ): Promise<WebhookResponse> => {
    try {
      // Log webhook call to database
      await supabase
        .from('webhook_logs')
        .insert({
          payload: {
            type: hookType,
            data: payload
          },
          processed_at: new Date().toISOString()
        });
        
      // Since we're in a frontend environment, we'd typically call an API endpoint
      // This is a simplified implementation
      const response = await fetch(`/api/webhooks/${hookType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update webhook log with success
      await supabase
        .from('webhook_logs')
        .update({ 
          response_data: data 
        })
        .eq('payload->type', hookType)
        .order('processed_at', { ascending: false })
        .limit(1);
        
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error in webhook call:', error);
      
      // Update webhook log with error
      await supabase
        .from('webhook_logs')
        .update({ 
          error: String(error)
        })
        .eq('payload->type', hookType)
        .order('processed_at', { ascending: false })
        .limit(1);
        
      return {
        success: false,
        error
      };
    }
  };

  return { callWebhook };
}
