
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
) => {
  const { data, error } = await supabase
    .from('orders')
    .select(selectFields)
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data;
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
) => {
  const { data, error } = await supabase
    .from('orders')
    .select(selectFields)
    .eq('customer_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
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
) => {
  const { data, error } = await supabase
    .from('order_items')
    .select(selectFields)
    .eq('order_id', orderId);

  if (error) throw error;
  return data || [];
};

export const performOrderUpdate = async (orderId: string, updateData: any) => {
  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId);

  if (error) throw error;
  return true;
};
