
import { supabase } from '@/integrations/supabase/client';
import { DeliveryFormValues } from '@/hooks/useDeliveryForm';
import { CartItem } from '@/types/cart';
import { Order } from '@/types/order';
import { sendOrderToWebhook } from '@/integrations/webhook';
import { recordOrderHistory } from '@/services/orders/webhookService';

export const saveDeliveryInfo = async (
  userId: string, 
  data: DeliveryFormValues, 
  hasDeliveryInfo: boolean
) => {
  const deliveryInfoData = {
    user_id: userId,
    full_name: data.fullName,
    phone: data.phone,
    address: data.address,
    city: data.city,
    // Note: latitude and longitude are stored separately in user_locations,
    // not in the delivery_info table
  };

  try {
    if (hasDeliveryInfo) {
      const { error: updateError } = await supabase
        .from('delivery_info')
        .update(deliveryInfoData)
        .eq('user_id', userId);
        
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('delivery_info')
        .insert(deliveryInfoData);
        
      if (insertError) throw insertError;
    }
  } catch (error) {
    throw error;
  }
};

export const createOrder = async (
  userId: string,
  data: DeliveryFormValues,
  items: CartItem[],
  totalAmount: number
) => {
  const deliveryFee = data.deliveryMethod === "delivery" ? 50 : 0;
  const finalTotal = totalAmount + deliveryFee;
  
  // Create order data without latitude and longitude initially
  const orderData: Omit<Order, 'id'> = {
    user_id: userId,
    customer_name: data.fullName,
    customer_email: data.email,
    customer_phone: data.phone,
    delivery_address: data.address,
    city: data.city,
    notes: data.notes,
    delivery_method: data.deliveryMethod,
    payment_method: data.paymentMethod,
    delivery_fee: deliveryFee,
    subtotal: totalAmount,
    total: finalTotal,
    status: "pending"
  };
  
  try {
    // Insert order without location data first
    const { data: insertedOrder, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select('id, status, total')
      .single();
      
    if (orderError) throw orderError;
    
    // If we have location data and it's a delivery order, save it separately
    if (data.latitude && data.longitude && data.deliveryMethod === "delivery") {
      await saveUserLocation(userId, data.latitude, data.longitude);
    }
    
    // Record the initial order creation in history
    if (insertedOrder && insertedOrder.id) {
      await recordOrderHistory(
        insertedOrder.id,
        'created',
        null,
        { total: finalTotal, delivery_method: data.deliveryMethod }
      );
    }
    
    return insertedOrder;
  } catch (error) {
    throw error;
  }
};

export const createOrderItems = async (orderId: string, items: CartItem[]) => {
  const orderItems = items.map(item => ({
    order_id: orderId,
    meal_id: item.meal.id,
    quantity: item.quantity,
    price: item.meal.price,
    name: item.meal.name
  }));
  
  try {
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
      
    if (itemsError) throw itemsError;
    
    // Record the items in order history
    await recordOrderHistory(
      orderId,
      'items_added',
      null,
      { items_count: items.length }
    );
  } catch (error) {
    throw error;
  }
};

export const saveUserLocation = async (
  userId: string,
  latitude: number,
  longitude: number
) => {
  try {
    // Fix the ambiguous user_id column issue by explicitly creating a structure
    // with a properly named field that won't conflict with any table joins
    const locationData = {
      user_id: userId,
      latitude,
      longitude,
      source: 'checkout'
    };

    const { error: locationError } = await supabase
      .from('user_locations')
      .insert(locationData);
      
    if (locationError) throw locationError;
  } catch (error) {
    throw error;
  }
};

export const cancelOrder = async (orderId: string) => {
  try {
    // Update order status to cancelled
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);

    if (error) throw error;

    // Get order details for adding to order history
    const { data: order } = await supabase
      .from('orders')
      .select('restaurant_id')
      .eq('id', orderId)
      .single();

    // Record in order_history
    if (order) {
      let restaurantName;
      if (order.restaurant_id) {
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('name')
          .eq('id', order.restaurant_id)
          .single();
        
        restaurantName = restaurant?.name;
      }

      await recordOrderHistory(
        orderId,
        'cancelled',
        order.restaurant_id,
        { 
          reason: 'Customer cancelled order',
          cancelled_via: 'customer interface' 
        }
      );
    }

    return true;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};
