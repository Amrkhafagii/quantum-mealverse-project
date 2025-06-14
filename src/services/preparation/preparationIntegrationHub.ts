
import { supabase } from '@/integrations/supabase/client';

export const notifyStageCompletion = async (orderId: string, stageName: string) => {
  try {
    console.log(`Notifying stage completion for order ${orderId}: ${stageName}`);
    
    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: stageName })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order status:', updateError);
      return { success: false, error: updateError.message };
    }

    // Send notification
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('customer_id, restaurant_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order for notification:', orderError);
      return { success: false, error: 'Order not found' };
    }

    const { error: notificationError } = await supabase
      .from('customer_notifications')
      .insert({
        notifications_user_id: order.customer_id,
        order_id: orderId,
        restaurant_id: order.restaurant_id,
        title: 'Order Update',
        message: `Your order has reached stage: ${stageName}`,
        notification_type: 'stage_update'
      });

    if (notificationError) {
      console.error('Error sending notification:', notificationError);
      return { success: false, error: notificationError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in notifyStageCompletion:', error);
    return { success: false, error: 'Failed to notify stage completion' };
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
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
    const { data, error } = await supabase
      .from('orders')
      .select(`
        restaurant_id,
        restaurants!orders_restaurant_id_fkey (
          id,
          name
        )
      `)
      .eq('id', orderId)
      .single();

    if (error || !data || !data.restaurants) {
      console.error('Error fetching restaurant from order:', error);
      return null;
    }

    return {
      id: data.restaurant_id,
      name: data.restaurants.name || 'Unknown Restaurant'
    };
  } catch (error) {
    console.error('Error in getRestaurantFromOrder:', error);
    return null;
  }
};

export const sendCustomerNotification = async (customerId: string, message: string, title: string = 'Order Update') => {
  try {
    const { error } = await supabase
      .from('customer_notifications')
      .insert({
        notifications_user_id: customerId,
        title,
        message,
        notification_type: 'general'
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

export const getPreparationAnalytics = async (restaurantId: string) => {
  try {
    console.log('Fetching preparation analytics for restaurant:', restaurantId);
    
    // Mock analytics data for now
    return {
      averagePreparationTime: 25,
      completionRate: 0.92,
      delayFrequency: 0.08,
      qualityScore: 4.6,
      staffEfficiency: 0.85
    };
  } catch (error) {
    console.error('Error fetching preparation analytics:', error);
    throw error;
  }
};

export const optimizeWorkflow = async (restaurantId: string) => {
  try {
    console.log('Optimizing workflow for restaurant:', restaurantId);
    
    // Mock workflow optimization
    return { success: true };
  } catch (error) {
    console.error('Error optimizing workflow:', error);
    return { success: false, error: 'Failed to optimize workflow' };
  }
};

// Add missing methods for preparation integration service
export const getOrderPreparationStages = async (orderId: string) => {
  try {
    const { data, error } = await supabase
      .from('order_preparation_stages')
      .select('*')
      .eq('order_id', orderId)
      .order('stage_order', { ascending: true });

    if (error) {
      console.error('Error fetching preparation stages:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getOrderPreparationStages:', error);
    return [];
  }
};

export const startStage = async (orderId: string, stageName: string) => {
  try {
    const { error } = await supabase
      .from('order_preparation_stages')
      .update({ 
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .eq('stage_name', stageName);

    if (error) {
      console.error('Error starting stage:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in startStage:', error);
    return false;
  }
};

export const advanceStage = async (orderId: string, stageName: string) => {
  try {
    const { error } = await supabase
      .from('order_preparation_stages')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .eq('stage_name', stageName);

    if (error) {
      console.error('Error advancing stage:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in advanceStage:', error);
    return { success: false, error: 'Failed to advance stage' };
  }
};

export const getPreparationProgress = async (orderId: string) => {
  try {
    const { data, error } = await supabase
      .from('order_preparation_stages')
      .select('*')
      .eq('order_id', orderId)
      .order('stage_order', { ascending: true });

    if (error) {
      console.error('Error fetching preparation progress:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPreparationProgress:', error);
    return [];
  }
};

export const preparationIntegrationHub = {
  notifyStageCompletion,
  updateOrderStatus,
  getRestaurantFromOrder,
  sendCustomerNotification,
  getPreparationAnalytics,
  optimizeWorkflow,
  getOrderPreparationStages,
  startStage,
  advanceStage,
  getPreparationProgress
};
