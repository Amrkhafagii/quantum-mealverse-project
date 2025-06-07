import { supabase } from '@/integrations/supabase/client';
import { recordOrderHistory } from './webhook/orderHistoryService';
import { OrderStatus } from '@/types/webhook';

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
 * Fetch orders for a specific user
 */
export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    console.log('Fetching orders for user:', userId);
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        restaurant:restaurants!orders_restaurant_id_fkey (
          name,
          address,
          phone
        )
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }

    console.log('Successfully fetched orders:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in fetchUserOrders:', error);
    throw error;
  }
};

/**
 * Fetch order items for a specific order
 */
export const fetchOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  try {
    console.log('Fetching order items for order:', orderId);
    
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        id,
        order_id,
        meal_id,
        quantity,
        price
      `)
      .eq('order_id', orderId);

    if (error) {
      console.error('Error fetching order items:', error);
      throw error;
    }

    console.log('Successfully fetched order items:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in fetchOrderItems:', error);
    throw error;
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  restaurantId?: string,
  metadata?: Record<string, any>
): Promise<boolean> => {
  try {
    console.log('Updating order status:', { orderId, newStatus, restaurantId });

    // Update the order status
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    if (restaurantId) {
      updateData.restaurant_id = restaurantId;
    }

    const { error: orderError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (orderError) {
      console.error('Error updating order status:', orderError);
      throw orderError;
    }

    // Record the history
    await recordOrderHistory(
      orderId,
      newStatus,
      restaurantId,
      metadata
    );

    console.log('Successfully updated order status');
    return true;
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return false;
  }
};

/**
 * Cancel an order
 */
export const cancelOrder = async (
  orderId: string,
  reason?: string,
  restaurantId?: string
): Promise<boolean> => {
  try {
    console.log('Cancelling order:', { orderId, reason });

    const { error } = await supabase
      .from('orders')
      .update({
        status: OrderStatus.CANCELLED,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }

    // Record the cancellation in history
    await recordOrderHistory(
      orderId,
      OrderStatus.CANCELLED,
      restaurantId,
      { 
        cancellation_reason: reason || 'Order cancelled',
        cancelled_at: new Date().toISOString()
      }
    );

    console.log('Successfully cancelled order');
    return true;
  } catch (error) {
    console.error('Error in cancelOrder:', error);
    return false;
  }
};

/**
 * Get order by ID with full details
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    console.log('Fetching order by ID:', orderId);
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        restaurant:restaurants!orders_restaurant_id_fkey (
          name,
          address,
          phone,
          latitude,
          longitude
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('Order not found:', orderId);
        return null;
      }
      console.error('Error fetching order:', error);
      throw error;
    }

    console.log('Successfully fetched order');
    return data;
  } catch (error) {
    console.error('Error in getOrderById:', error);
    throw error;
  }
};

/**
 * Get order history for an order
 */
export const getOrderHistory = async (orderId: string) => {
  try {
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
      console.error('Error fetching order history:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getOrderHistory:', error);
    throw error;
  }
};
