
import { supabase } from '@/integrations/supabase/client';

export const notifyOrderConfirmed = async (orderId: string, customerId: string, restaurantId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        notifications_user_id: customerId,
        title: 'Order Confirmed',
        message: `Your order #${orderId.slice(0, 8)} has been confirmed`,
        notification_type: 'order_confirmed',
        order_id: orderId,
        restaurant_id: restaurantId
      });

    if (error) {
      console.error('Error sending order confirmation notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in notifyOrderConfirmed:', error);
    return { success: false, error: 'Failed to send notification' };
  }
};

export const notifyOrderReady = async (orderId: string, customerId: string, restaurantId: string, estimatedDeliveryTime?: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        notifications_user_id: customerId,
        title: 'Order Ready',
        message: `Your order #${orderId.slice(0, 8)} is ready${estimatedDeliveryTime ? ` - ETA: ${estimatedDeliveryTime}` : ''}`,
        notification_type: 'order_ready',
        order_id: orderId,
        restaurant_id: restaurantId
      });

    if (error) {
      console.error('Error sending order ready notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in notifyOrderReady:', error);
    return { success: false, error: 'Failed to send notification' };
  }
};

export const notifyOrderPickedUp = async (orderId: string, customerId: string, restaurantId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        notifications_user_id: customerId,
        title: 'Order Picked Up',
        message: `Your order #${orderId.slice(0, 8)} has been picked up for delivery`,
        notification_type: 'order_picked_up',
        order_id: orderId,
        restaurant_id: restaurantId
      });

    if (error) {
      console.error('Error sending order pickup notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in notifyOrderPickedUp:', error);
    return { success: false, error: 'Failed to send notification' };
  }
};

export const notifyOrderDelivered = async (orderId: string, customerId: string, restaurantId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        notifications_user_id: customerId,
        title: 'Order Delivered',
        message: `Your order #${orderId.slice(0, 8)} has been delivered`,
        notification_type: 'order_delivered',
        order_id: orderId,
        restaurant_id: restaurantId
      });

    if (error) {
      console.error('Error sending order delivery notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in notifyOrderDelivered:', error);
    return { success: false, error: 'Failed to send notification' };
  }
};

export const sendStageUpdateNotification = async (orderId: string, stageName: string, customerId: string) => {
  try {
    const stageMessages = {
      preparation_started: 'Your order preparation has started',
      ingredients_prepared: 'Ingredients are being prepared',
      cooking_started: 'Your order is now cooking',
      quality_check: 'Your order is undergoing quality check',
      packaging: 'Your order is being packaged',
      ready_for_pickup: 'Your order is ready for pickup'
    };

    const message = stageMessages[stageName as keyof typeof stageMessages] || `Order stage updated: ${stageName}`;

    const { error } = await supabase
      .from('notifications')
      .insert({
        notifications_user_id: customerId,
        title: 'Order Update',
        message: message,
        notification_type: 'stage_update',
        order_id: orderId,
        data: { stage: stageName }
      });

    if (error) {
      console.error('Error sending stage update notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendStageUpdateNotification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
};

export const preparationNotificationService = {
  notifyOrderConfirmed,
  notifyOrderReady,
  notifyOrderPickedUp,
  notifyOrderDelivered,
  sendStageUpdateNotification
};
