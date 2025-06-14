
import { supabase } from '@/integrations/supabase/client';
import { preparationNotificationService } from '@/services/notifications/preparationNotificationService';

export const notifyStageCompletion = async (orderId: string, stageName: string) => {
  try {
    console.log(`Notifying stage completion for order ${orderId}, stage: ${stageName}`);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('customer_id, restaurant_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order for notification:', orderError);
      return { success: false, error: 'Order not found' };
    }

    // Send notification
    const result = await preparationNotificationService.sendStageUpdateNotification(
      orderId,
      stageName,
      order.customer_id
    );

    return result;
  } catch (error) {
    console.error('Error in notifyStageCompletion:', error);
    return { success: false, error: 'Failed to send notification' };
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    console.log(`Updating order ${orderId} status to: ${status}`);

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return { success: false, error: 'Failed to update order status' };
  }
};

export const getRestaurantFromOrder = async (orderId: string) => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('restaurant_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return null;
    }

    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', order.restaurant_id)
      .single();

    if (restaurantError || !restaurant) {
      console.error('Error fetching restaurant:', restaurantError);
      return null;
    }

    return restaurant;
  } catch (error) {
    console.error('Error in getRestaurantFromOrder:', error);
    return null;
  }
};

export const sendCustomerNotification = async (customerId: string, orderId: string, message: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        notifications_user_id: customerId,
        title: 'Order Update',
        message: message,
        notification_type: 'order_update',
        order_id: orderId
      });

    if (error) {
      console.error('Error sending customer notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendCustomerNotification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
};

export const broadcastToKitchen = async (restaurantId: string, orderId: string, message: string) => {
  try {
    console.log(`Broadcasting to kitchen for restaurant ${restaurantId}: ${message}`);
    
    // Get restaurant details
    const restaurant = await getRestaurantFromOrder(orderId);
    if (!restaurant) {
      return { success: false, error: 'Restaurant not found' };
    }

    // For now, just log the broadcast
    console.log(`Kitchen broadcast sent for order ${orderId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error in broadcastToKitchen:', error);
    return { success: false, error: 'Failed to broadcast to kitchen' };
  }
};

export const preparationIntegrationHub = {
  notifyStageCompletion,
  updateOrderStatus,
  getRestaurantFromOrder,
  sendCustomerNotification,
  broadcastToKitchen
};
