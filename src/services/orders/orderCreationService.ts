
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types/cart';

export interface OrderData {
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  city: string;
  total: number;
  subtotal: number;
  status: string;
  payment_method: string;
  delivery_method: string;
  special_instructions?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  assignment_source: string;
  is_mixed_order?: boolean;
  deliveryMethod?: string;
}

export interface OrderCreationResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export const hasMixedOrderTypes = (items: CartItem[]): boolean => {
  const sources = new Set(items.map(item => item.source_type || 'nutrition_generation'));
  return sources.size > 1;
};

export const createOrder = async (orderData: OrderData, items: CartItem[]): Promise<OrderCreationResult> => {
  try {
    console.log('Creating order with data:', orderData);
    console.log('Order items:', items);

    // Create the main order using customer_id instead of user_id
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: orderData.customer_id,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_email: orderData.customer_email,
        delivery_address: orderData.delivery_address,
        city: orderData.city,
        total: orderData.total,
        subtotal: orderData.subtotal,
        status: orderData.status,
        payment_method: orderData.payment_method,
        delivery_method: orderData.delivery_method,
        notes: orderData.special_instructions,
        latitude: orderData.latitude,
        longitude: orderData.longitude,
        assignment_source: orderData.assignment_source,
        delivery_fee: orderData.total - orderData.subtotal
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return {
        success: false,
        error: `Failed to create order: ${orderError.message}`
      };
    }

    console.log('Order created successfully:', order);

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      meal_id: item.meal_id || null,
      menu_item_id: item.menu_item_id || null,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      source_type: item.source_type || 'nutrition_generation'
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Try to clean up the order if items creation failed
      await supabase.from('orders').delete().eq('id', order.id);
      return {
        success: false,
        error: `Failed to create order items: ${itemsError.message}`
      };
    }

    console.log('Order items created successfully');

    return {
      success: true,
      orderId: order.id
    };

  } catch (error) {
    console.error('Critical error in createOrder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
