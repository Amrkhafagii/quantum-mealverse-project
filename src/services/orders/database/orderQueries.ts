
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '../orderService';

/**
 * Raw database query functions - single responsibility for data access
 */

export const queryOrderById = async (
  orderId: string, 
  selectFields: string = `
    *,
    restaurant:restaurants!orders_restaurant_id_fkey (
      name,
      address,
      phone,
      latitude,
      longitude
    )
  `
): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(selectFields)
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error in queryOrderById:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error in queryOrderById:', error);
    return null;
  }
};

export const queryUserOrders = async (
  userId: string,
  selectFields: string = `
    *,
    restaurant:restaurants!orders_restaurant_id_fkey (
      name,
      address,
      phone
    )
  `
): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(selectFields)
      .eq('customer_id', userId) // Keep as customer_id - this is the UUID from auth.users
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error in queryUserOrders:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in queryUserOrders:', error);
    return [];
  }
};

export const queryOrderItems = async (
  orderId: string,
  selectFields: string = `
    id,
    order_id,
    meal_id,
    quantity,
    price
  `
): Promise<OrderItem[]> => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select(selectFields)
      .eq('order_id', orderId);

    if (error) {
      console.error('Error in queryOrderItems:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in queryOrderItems:', error);
    return [];
  }
};

export const performOrderUpdate = async (orderId: string, updateData: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      console.error('Error in performOrderUpdate:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in performOrderUpdate:', error);
    return false;
  }
};
