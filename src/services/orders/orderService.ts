
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus } from '@/types/webhook';
import { Order, OrderItem } from '@/types/order';

// Import refactored utilities
import { 
  queryOrderById, 
  queryUserOrders, 
  queryOrderItems, 
  performOrderUpdate 
} from './database/orderQueries';
import { 
  logOrderOperation, 
  logOrderError, 
  logOrderSuccess, 
  logOrderQuery 
} from './logging/orderLogger';
import { 
  buildOrderUpdateData, 
  buildCancellationMetadata, 
  validateOrderUpdateParams 
} from './transformation/orderDataTransformers';
import { 
  createValidationError,
  logAndReturnDefault
} from './errors/orderErrorHandler';
import { 
  recordStatusChange, 
  recordCancellation 
} from './history/orderHistoryService';

/**
 * Fetch orders for a specific user - refactored with proper error handling
 */
export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    logOrderQuery('fetchUserOrders', { userId });
    
    if (!userId) {
      throw createValidationError('User ID is required');
    }

    const data = await queryUserOrders(userId);
    
    logOrderSuccess('fetchUserOrders', data, { operation: 'fetchUserOrders', userId, count: data.length });
    return data;
  } catch (error) {
    return logAndReturnDefault(error, 'fetchUserOrders', { userId }, []);
  }
};

/**
 * Fetch order items for a specific order - refactored with proper error handling
 */
export const fetchOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  try {
    logOrderQuery('fetchOrderItems', { orderId });
    
    if (!orderId) {
      throw createValidationError('Order ID is required');
    }

    const data = await queryOrderItems(orderId);
    
    logOrderSuccess('fetchOrderItems', data, { operation: 'fetchOrderItems', orderId, count: data.length });
    return data;
  } catch (error) {
    return logAndReturnDefault(error, 'fetchOrderItems', { orderId }, []);
  }
};

/**
 * Update order status - refactored with proper error handling
 */
export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  restaurantId?: string,
  metadata?: Record<string, any>
): Promise<boolean> => {
  try {
    logOrderOperation('updateOrderStatus', { orderId, newStatus, restaurantId });

    // Validate input parameters
    if (!validateOrderUpdateParams(orderId, newStatus, restaurantId)) {
      throw createValidationError('Invalid parameters for order status update');
    }

    // Build update data
    const updateData = buildOrderUpdateData(newStatus, restaurantId, metadata);

    // Perform database update
    const success = await performOrderUpdate(orderId, updateData);
    
    if (!success) {
      return false;
    }

    // Record the history
    await recordStatusChange(orderId, newStatus, restaurantId, metadata);

    logOrderSuccess('updateOrderStatus', true, { operation: 'updateOrderStatus', orderId, newStatus });
    return true;
  } catch (error) {
    return logAndReturnDefault(error, 'updateOrderStatus', { orderId, newStatus, restaurantId }, false);
  }
};

/**
 * Cancel an order - refactored with proper error handling
 */
export const cancelOrder = async (
  orderId: string,
  reason?: string,
  restaurantId?: string
): Promise<boolean> => {
  try {
    logOrderOperation('cancelOrder', { orderId, reason });

    // Validate input
    if (!orderId) {
      throw createValidationError('Order ID is required for cancellation');
    }

    // Build cancellation data
    const updateData = buildOrderUpdateData(OrderStatus.CANCELLED);
    const cancellationMetadata = buildCancellationMetadata(reason);

    // Perform database update
    const success = await performOrderUpdate(orderId, updateData);
    
    if (!success) {
      return false;
    }

    // Record the cancellation in history
    await recordCancellation(orderId, reason, restaurantId);

    logOrderSuccess('cancelOrder', true, { operation: 'cancelOrder', orderId });
    return true;
  } catch (error) {
    return logAndReturnDefault(error, 'cancelOrder', { orderId, reason, restaurantId }, false);
  }
};

/**
 * Get order by ID with full details - refactored with proper error handling
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    logOrderQuery('getOrderById', { orderId });
    
    if (!orderId) {
      throw createValidationError('Order ID is required');
    }

    const data = await queryOrderById(orderId);
    
    logOrderSuccess('getOrderById', !!data, { operation: 'getOrderById', orderId });
    return data;
  } catch (error) {
    return logAndReturnDefault(error, 'getOrderById', { orderId }, null);
  }
};

/**
 * Get order history for an order - simplified with proper error handling
 */
export const getOrderHistory = async (orderId: string) => {
  try {
    logOrderQuery('getOrderHistory', { orderId });
    
    if (!orderId) {
      throw createValidationError('Order ID is required');
    }

    const { data, error } = await supabase
      .from('order_history')
      .select(`
        *,
        restaurant:restaurants!order_history_restaurant_id_fkey (
          name
        )
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    logOrderSuccess('getOrderHistory', data, { operation: 'getOrderHistory', orderId, count: data?.length || 0 });
    return data || [];
  } catch (error) {
    return logAndReturnDefault(error, 'getOrderHistory', { orderId }, []);
  }
};
