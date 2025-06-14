
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus } from '@/types/webhook';

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
  handleOrderError, 
  createValidationError,
  handleDatabaseError
} from './errors/orderErrorHandler';
import { 
  recordStatusChange, 
  recordCancellation 
} from './history/orderHistoryService';

// Keep existing interfaces
export interface Order {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  delivery_address: string;
  city?: string;
  notes?: string;
  delivery_method?: string;
  payment_method?: string;
  delivery_fee?: number;
  subtotal?: number;
  total: number;
  status: string;
  latitude?: number;
  longitude?: number;
  assignment_source: string;
  created_at: string;
  updated_at: string;
  formatted_order_id?: string;
  restaurant_id?: string;
  customer_id?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  meal_id: string;
  quantity: number;
  price: number;
  customizations?: any;
  special_instructions?: string;
  meal?: {
    name: string;
    description?: string;
    image_url?: string;
  };
}

/**
 * Fetch orders for a specific user - refactored with single responsibility
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
    logOrderError('fetchUserOrders', error, { operation: 'fetchUserOrders', userId });
    return []; // Return empty array on error
  }
};

/**
 * Fetch order items for a specific order - refactored with single responsibility
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
    logOrderError('fetchOrderItems', error, { operation: 'fetchOrderItems', orderId });
    return []; // Return empty array on error
  }
};

/**
 * Update order status - refactored with single responsibility functions
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
    await performOrderUpdate(orderId, updateData);

    // Record the history
    await recordStatusChange(orderId, newStatus, restaurantId, metadata);

    logOrderSuccess('updateOrderStatus', true, { operation: 'updateOrderStatus', orderId, newStatus });
    return true;
  } catch (error) {
    return handleOrderError(error, 'updateOrderStatus', { operation: 'updateOrderStatus', orderId, newStatus, restaurantId });
  }
};

/**
 * Cancel an order - refactored with single responsibility functions
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
    await performOrderUpdate(orderId, updateData);

    // Record the cancellation in history
    await recordCancellation(orderId, reason, restaurantId);

    logOrderSuccess('cancelOrder', true, { operation: 'cancelOrder', orderId });
    return true;
  } catch (error) {
    return handleOrderError(error, 'cancelOrder', { operation: 'cancelOrder', orderId, reason, restaurantId });
  }
};

/**
 * Get order by ID with full details - refactored with single responsibility
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
    logOrderError('getOrderById', error, { operation: 'getOrderById', orderId });
    return null; // Return null on error
  }
};

/**
 * Get order history for an order - simplified with extracted utilities
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
      handleDatabaseError(error, 'getOrderHistory', { orderId });
      return [];
    }

    logOrderSuccess('getOrderHistory', data, { operation: 'getOrderHistory', orderId, count: data?.length || 0 });
    return data || [];
  } catch (error) {
    logOrderError('getOrderHistory', error, { operation: 'getOrderHistory', orderId });
    return [];
  }
};
