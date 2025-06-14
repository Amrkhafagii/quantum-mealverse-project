
import { supabase } from '@/integrations/supabase/client';

export const notifyOrderConfirmed = async (orderId: string, customerId: string, restaurantId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        notifications_user_id: customerId,
        title: 'Order Confirmed',
        message: 'Your order has been confirmed and is being prepared.',
        notification_type: 'order_confirmed',
        order_id: orderId,
        restaurant_id: restaurantId,
        data: { order_id: orderId }
      });

    if (error) {
      console.error('Error sending order confirmed notification:', error);
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
        message: `Your order is ready! ${estimatedDeliveryTime ? `Estimated delivery time: ${estimatedDeliveryTime}` : ''}`,
        notification_type: 'order_ready',
        order_id: orderId,
        restaurant_id: restaurantId,
        data: { 
          order_id: orderId,
          estimated_delivery_time: estimatedDeliveryTime
        }
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

export const notifyOrderPickedUp = async (orderId: string, customerId: string, deliveryUserId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        notifications_user_id: customerId,
        title: 'Order Picked Up',
        message: 'Your order has been picked up by the delivery driver and is on its way!',
        notification_type: 'order_picked_up',
        order_id: orderId,
        delivery_user_id: deliveryUserId,
        data: { 
          order_id: orderId,
          delivery_user_id: deliveryUserId
        }
      });

    if (error) {
      console.error('Error sending order picked up notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in notifyOrderPickedUp:', error);
    return { success: false, error: 'Failed to send notification' };
  }
};

export const notifyDeliveryAssigned = async (orderId: string, deliveryUserId: string, restaurantId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        notifications_user_id: deliveryUserId,
        title: 'New Delivery Assignment',
        message: 'You have been assigned a new delivery order.',
        notification_type: 'delivery_assigned',
        order_id: orderId,
        restaurant_id: restaurantId,
        data: { 
          order_id: orderId,
          restaurant_id: restaurantId
        }
      });

    if (error) {
      console.error('Error sending delivery assignment notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in notifyDeliveryAssigned:', error);
    return { success: false, error: 'Failed to send notification' };
  }
};

export const preparationNotificationService = {
  notifyOrderConfirmed,
  notifyOrderReady,
  notifyOrderPickedUp,
  notifyDeliveryAssigned
};
