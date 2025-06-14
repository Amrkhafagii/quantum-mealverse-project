
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types/order';

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        delivery_address,
        total,
        status,
        created_at,
        restaurant_id,
        customer_id
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }

    return data as Order;
  } catch (error) {
    console.error('Error in getOrderById:', error);
    return null;
  }
};

// Export alias for orderService compatibility
export const queryOrderById = getOrderById;

export const getOrdersByRestaurant = async (restaurantId: string): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        delivery_address,
        total,
        status,
        created_at,
        restaurant_id,
        customer_id
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders by restaurant:', error);
      return [];
    }

    return (data || []) as Order[];
  } catch (error) {
    console.error('Error in getOrdersByRestaurant:', error);
    return [];
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        delivery_address,
        total,
        status,
        created_at,
        restaurant_id,
        customer_id
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }

    return (data || []) as Order[];
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    return [];
  }
};

// Export alias for orderService compatibility
export const queryUserOrders = getUserOrders;

export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  try {
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
      return [];
    }

    // Transform the data to match the expected OrderItem interface
    return (data || []).map(item => ({
      ...item,
      name: `Item ${item.id}`, // Provide a default name since meals relation failed
      meal: null
    })) as OrderItem[];
  } catch (error) {
    console.error('Error in getOrderItems:', error);
    return [];
  }
};

// Export alias for orderService compatibility
export const queryOrderItems = getOrderItems;

export const updateOrderStatus = async (orderId: string, status: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return false;
  }
};

export const performOrderUpdate = async (orderId: string, updateData: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      console.error('Error performing order update:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in performOrderUpdate:', error);
    return false;
  }
};

export const createOrder = async (orderData: Partial<Order>): Promise<Order | null> => {
  try {
    // Ensure required fields have default values that match database schema
    const completeOrderData = {
      city: orderData.city || 'Unknown',
      customer_email: orderData.customer_email || 'unknown@example.com',
      customer_id: orderData.customer_id || 'unknown',
      customer_name: orderData.customer_name || 'Unknown Customer',
      customer_phone: orderData.customer_phone || '000-000-0000', // Provide required field
      delivery_address: orderData.delivery_address || 'Unknown Address',
      total: orderData.total || 0,
      status: orderData.status || 'pending',
      assignment_source: orderData.assignment_source || 'manual',
      ...orderData
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(completeOrderData)
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return null;
    }

    return data as Order;
  } catch (error) {
    console.error('Error in createOrder:', error);
    return null;
  }
};
