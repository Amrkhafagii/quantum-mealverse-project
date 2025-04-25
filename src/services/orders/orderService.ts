
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types/cart';
import { OrderStatus } from '@/types/webhook';
import { DeliveryFormValues } from '@/hooks/useDeliveryForm';
import { recordOrderHistory } from './webhook/orderHistoryService';
import { updateOrderStatus } from './webhookService';

/**
 * Creates a new order in the database
 */
export const createOrder = async (
  userId: string,
  deliveryInfo: DeliveryFormValues,
  items: CartItem[],
  totalAmount: number,
  initialStatus: string = OrderStatus.PENDING
) => {
  try {
    // Create subtotal from items
    const subtotal = items.reduce((sum, item) => sum + (item.meal.price * item.quantity), 0);
    
    // Calculate delivery fee based on delivery method
    const deliveryFee = deliveryInfo.deliveryMethod === 'delivery' ? 2.99 : 0;
    
    // Format order ID for display (e.g., ORD-20250425-XXXX)
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const formattedOrderId = `ORD-${timestamp}-${randomPart}`;
    
    // Insert the order - removing latitude and longitude from direct insertion
    const { data: insertedOrder, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        customer_name: deliveryInfo.fullName,
        customer_email: deliveryInfo.email,
        customer_phone: deliveryInfo.phone,
        delivery_address: deliveryInfo.address,
        city: deliveryInfo.city,
        notes: deliveryInfo.notes,
        delivery_method: deliveryInfo.deliveryMethod,
        payment_method: deliveryInfo.paymentMethod,
        status: initialStatus,
        delivery_fee: deliveryFee,
        subtotal,
        total: totalAmount,
        formatted_order_id: formattedOrderId,
      })
      .select()
      .single();
      
    if (error) throw error;
    return insertedOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Creates order items for a given order
 */
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
      OrderStatus.PENDING,
      null,
      { items_count: items.length }
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Saves delivery information for a user
 */
export const saveDeliveryInfo = async (
  userId: string, 
  deliveryInfo: DeliveryFormValues,
  hasExistingInfo: boolean
) => {
  try {
    if (hasExistingInfo) {
      // Update existing delivery info
      const { error } = await supabase
        .from('delivery_info')
        .update({
          full_name: deliveryInfo.fullName,
          phone: deliveryInfo.phone,
          address: deliveryInfo.address,
          city: deliveryInfo.city,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (error) throw error;
    } else {
      // Insert new delivery info
      const { error } = await supabase
        .from('delivery_info')
        .insert({
          user_id: userId,
          full_name: deliveryInfo.fullName,
          phone: deliveryInfo.phone,
          address: deliveryInfo.address,
          city: deliveryInfo.city
        });
        
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving delivery info:', error);
    throw error;
  }
};

/**
 * Saves user location to the database
 */
export const saveUserLocation = async (
  userId: string,
  latitude: number,
  longitude: number
) => {
  try {
    const { error } = await supabase
      .from('user_locations')
      .upsert({
        user_id: userId,
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving user location:', error);
    throw error;
  }
};

/**
 * Cancels an order by updating its status
 */
export const cancelOrder = async (orderId: string) => {
  try {
    // Update order status through the central function
    const success = await updateOrderStatus(
      orderId,
      OrderStatus.CANCELLED,
      null,
      { cancelled_at: new Date().toISOString() },
      undefined,
      'customer'
    );
    
    if (!success) {
      throw new Error('Failed to cancel order');
    }
    
    return true;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

/**
 * Processes a refund request
 */
export const requestRefund = async (
  orderId: string, 
  reason: string, 
  userId: string, 
  amount?: number
) => {
  try {
    // Get the order to check if refund is allowed
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('total, status')
      .eq('id', orderId)
      .single();
      
    if (orderError || !order) {
      throw new Error('Order not found');
    }
    
    // Only allow refunds for delivered or cancelled orders
    if (order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED) {
      throw new Error(`Cannot request refund for order in ${order.status} state`);
    }
    
    // If amount not provided, refund the full amount
    const refundAmount = amount || order.total;
    
    // Update order status to REFUNDED
    const success = await updateOrderStatus(
      orderId,
      OrderStatus.REFUNDED,
      null,
      { 
        reason: reason,
        refund_amount: refundAmount,
        requested_at: new Date().toISOString()
      },
      userId,
      'customer'
    );
    
    if (!success) {
      throw new Error('Failed to request refund');
    }
    
    // Update order refund fields
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        refund_status: 'requested',
        refund_amount: refundAmount
      })
      .eq('id', orderId);
      
    if (updateError) {
      throw updateError;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting refund:', error);
    throw error;
  }
};

/**
 * Central export for recordOrderHistory for backward compatibility
 */
export { recordOrderHistory } from './webhook/orderHistoryService';
