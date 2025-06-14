
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types/order';

export interface GenericStringError extends String {
  error: true;
}

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

    return (data || []) as OrderItem[];
  } catch (error) {
    console.error('Error in getOrderItems:', error);
    return [];
  }
};

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

export const createOrder = async (orderData: Partial<Order>): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
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
