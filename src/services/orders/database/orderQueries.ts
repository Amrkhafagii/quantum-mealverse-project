
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types/order';
import { DEFAULT_ORDER_FIELDS } from './orderConstants';
import { mapOrderDBToOrder, mapOrderItemDBToOrderItem } from './orderTransformers';
import { OrderDB, OrderItemDB } from './orderTypes';

// Get order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        city,
        notes,
        delivery_method,
        payment_method,
        delivery_fee,
        subtotal,
        total,
        status,
        restaurant_id,
        created_at,
        updated_at,
        assignment_source,
        is_mixed_order
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }

    return mapOrderDBToOrder(data as OrderDB);
  } catch (error) {
    console.error('Error in getOrderById:', error);
    return null;
  }
};
export const queryOrderById = getOrderById;

// Get all orders for a restaurant
export const getOrdersByRestaurant = async (restaurantId: string): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        city,
        notes,
        delivery_method,
        payment_method,
        delivery_fee,
        subtotal,
        total,
        status,
        restaurant_id,
        created_at,
        updated_at,
        assignment_source,
        is_mixed_order
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders by restaurant:', error);
      return [];
    }

    return (data || []).map(d => mapOrderDBToOrder(d as OrderDB));
  } catch (error) {
    console.error('Error in getOrdersByRestaurant:', error);
    return [];
  }
};

// Get user orders
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        city,
        notes,
        delivery_method,
        payment_method,
        delivery_fee,
        subtotal,
        total,
        status,
        restaurant_id,
        created_at,
        updated_at,
        assignment_source,
        is_mixed_order
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }

    return (data || []).map(d => mapOrderDBToOrder(d as OrderDB));
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    return [];
  }
};
export const queryUserOrders = getUserOrders;

// Get order items for an order
export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        id,
        order_id,
        meal_id,
        menu_item_id,
        name,
        price,
        quantity,
        created_at,
        source_type
      `)
      .eq('order_id', orderId);

    if (error) {
      console.error('Error fetching order items:', error);
      return [];
    }

    return (data || []).map(d => mapOrderItemDBToOrderItem(d as OrderItemDB));
  } catch (error) {
    console.error('Error in getOrderItems:', error);
    return [];
  }
};
export const queryOrderItems = getOrderItems;

// Update order status
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

// Create an order (ensure default/required fields are set)
export const createOrder = async (orderData: Partial<Order>): Promise<Order | null> => {
  try {
    // Fill all required fields with default or provided values
    const completeOrderData: OrderDB = {
      city: orderData.city || DEFAULT_ORDER_FIELDS.city,
      customer_email: orderData.customer_email || DEFAULT_ORDER_FIELDS.customer_email,
      customer_id: orderData.customer_id || DEFAULT_ORDER_FIELDS.customer_id,
      customer_name: orderData.customer_name || DEFAULT_ORDER_FIELDS.customer_name,
      customer_phone: orderData.customer_phone || DEFAULT_ORDER_FIELDS.customer_phone,
      delivery_address: orderData.delivery_address || DEFAULT_ORDER_FIELDS.delivery_address,
      delivery_method: orderData.delivery_method || DEFAULT_ORDER_FIELDS.delivery_method,
      payment_method: orderData.payment_method || DEFAULT_ORDER_FIELDS.payment_method,
      delivery_fee: typeof orderData.delivery_fee === 'number' ? orderData.delivery_fee : DEFAULT_ORDER_FIELDS.delivery_fee,
      subtotal: typeof orderData.subtotal === 'number' ? orderData.subtotal : DEFAULT_ORDER_FIELDS.subtotal,
      total: typeof orderData.total === 'number' ? orderData.total : DEFAULT_ORDER_FIELDS.total,
      status: orderData.status || DEFAULT_ORDER_FIELDS.status,
      assignment_source: orderData.assignment_source || DEFAULT_ORDER_FIELDS.assignment_source,
      is_mixed_order: orderData.is_mixed_order,
      notes: orderData.notes,
      restaurant_id: orderData.restaurant_id,
      // Leave fields like id/created_at/updated_at undefined for DB to autogenerate
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

    return mapOrderDBToOrder(data as OrderDB);
  } catch (error) {
    console.error('Error in createOrder:', error);
    return null;
  }
};
