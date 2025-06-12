
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types/cart';

export interface OrderData {
  customer_id: string | null; // UUID from auth.users
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

    // Ensure customer_id is properly formatted as UUID string
    const formattedOrderData = {
      ...orderData,
      customer_id: orderData.customer_id || null // Keep as UUID string or null
    };

    // Create the main order using customer_id (UUID)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: formattedOrderData.customer_id,
        customer_name: formattedOrderData.customer_name,
        customer_phone: formattedOrderData.customer_phone,
        customer_email: formattedOrderData.customer_email,
        delivery_address: formattedOrderData.delivery_address,
        city: formattedOrderData.city,
        total: formattedOrderData.total,
        subtotal: formattedOrderData.subtotal,
        status: formattedOrderData.status,
        payment_method: formattedOrderData.payment_method,
        delivery_method: formattedOrderData.delivery_method,
        notes: formattedOrderData.special_instructions,
        latitude: formattedOrderData.latitude,
        longitude: formattedOrderData.longitude,
        assignment_source: formattedOrderData.assignment_source,
        delivery_fee: formattedOrderData.total - formattedOrderData.subtotal
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
