
import { supabase } from './supabase/client';
import { WebhookResponse, OrderAssignmentRequest, RestaurantResponseRequest } from '@/types/webhook';

export const sendOrderToWebhook = async (
  orderId: string,
  latitude: number,
  longitude: number
): Promise<WebhookResponse> => {
  try {
    // Create payload for the webhook
    const payload: OrderAssignmentRequest = {
      order_id: orderId,
      latitude,
      longitude
    };
    
    // Log that we're sending this to the webhook
    await supabase
      .from('webhook_logs')
      .insert({
        payload: {
          order_id: orderId,
          action: 'restaurant_assignment',
          latitude,
          longitude
        }
      });
    
    // For now, call our edge function directly
    const { data, error } = await supabase.functions.invoke('order-webhook', {
      body: payload
    });
    
    if (error) {
      console.error('Error invoking order-webhook:', error);
      return {
        success: false,
        message: 'Failed to invoke webhook',
        error: error.message
      };
    }

    return data as WebhookResponse;
  } catch (error: any) {
    console.error('Error in sendOrderToWebhook:', error);
    return {
      success: false,
      error: error.message || 'Unknown webhook error'
    };
  }
};

export const sendRestaurantResponse = async (
  orderId: string,
  restaurantId: string,
  assignmentId: string,
  action: 'accept' | 'reject'
): Promise<WebhookResponse> => {
  try {
    // Create payload for the webhook
    const payload: RestaurantResponseRequest = {
      order_id: orderId,
      restaurant_id: restaurantId,
      assignment_id: assignmentId,
      action
    };
    
    // Log that we're sending this to the webhook
    await supabase
      .from('webhook_logs')
      .insert({
        payload: {
          order_id: orderId,
          action: `restaurant_${action}`,
          restaurant_id: restaurantId,
          assignment_id: assignmentId
        }
      });
    
    // For now, call our edge function directly
    const { data, error } = await supabase.functions.invoke('order-webhook', {
      body: payload
    });
    
    if (error) {
      console.error('Error invoking order-webhook:', error);
      return {
        success: false,
        message: `Failed to ${action} order`,
        error: error.message
      };
    }

    return data as WebhookResponse;
  } catch (error: any) {
    console.error(`Error in sendRestaurantResponse(${action}):`, error);
    return {
      success: false,
      error: error.message || `Unknown error during restaurant ${action}`
    };
  }
};
