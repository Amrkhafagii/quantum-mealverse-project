import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/contexts/CartContext';
import { OrderStatus } from '@/types/webhook';
import { DeliveryFormValues } from '@/hooks/useDeliveryForm';
import { recordOrderHistory } from './webhook/orderHistoryService';

/**
 * Safely extracts meal properties from CartItem, handling both flat and nested structures
 */
const extractMealData = (item: CartItem) => {
  console.log('Processing cart item:', JSON.stringify(item, null, 2));
  
  // Handle flat structure (current CartContext format)
  if (typeof item.id === 'string' && typeof item.name === 'string' && typeof item.price === 'number') {
    return {
      meal_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    };
  }
  
  // Handle legacy nested structure if it exists
  const meal = (item as any).meal;
  if (meal && typeof meal.id === 'string') {
    console.log('Using nested meal structure for item:', item);
    return {
      meal_id: meal.id,
      name: meal.name,
      price: meal.price,
      quantity: item.quantity
    };
  }
  
  // Log error for debugging
  console.error('Invalid cart item structure:', item);
  throw new Error(`Invalid cart item structure: missing required fields (id, name, price) in item: ${JSON.stringify(item)}`);
};

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
    console.log('Creating order with items:', items);
    
    // Validate items before processing
    if (!items || items.length === 0) {
      throw new Error('Cannot create order: cart is empty');
    }
    
    // Validate each item has required fields
    items.forEach((item, index) => {
      if (!item.id || !item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
        console.error(`Invalid item at index ${index}:`, item);
        throw new Error(`Invalid cart item at position ${index + 1}: missing required fields`);
      }
    });
    
    // Create subtotal from items - using flat structure
    const subtotal = items.reduce((sum, item) => {
      const price = typeof item.price === 'number' ? item.price : 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
      return sum + (price * quantity);
    }, 0);
    
    console.log('Calculated subtotal:', subtotal, 'Total amount:', totalAmount);
    
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
      
    if (error) {
      console.error('Database error creating order:', error);
      throw error;
    }
    
    console.log('Order created successfully:', insertedOrder);
    return insertedOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Creates order items for a given order with improved error handling
 */
export const createOrderItems = async (orderId: string, items: CartItem[]) => {
  try {
    console.log('Creating order items for order:', orderId, 'with items:', items);
    
    if (!items || items.length === 0) {
      throw new Error('Cannot create order items: no items provided');
    }
    
    const orderItems = items.map((item, index) => {
      try {
        const mealData = extractMealData(item);
        console.log(`Processed item ${index + 1}:`, mealData);
        return {
          order_id: orderId,
          ...mealData
        };
      } catch (error) {
        console.error(`Error processing item ${index + 1}:`, error);
        throw new Error(`Failed to process cart item ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
    
    console.log('Final order items to insert:', orderItems);
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
      
    if (itemsError) {
      console.error('Database error creating order items:', itemsError);
      throw itemsError;
    }
    
    console.log('Order items created successfully');
    
    // Record the items in order history
    await recordOrderHistory(
      orderId,
      OrderStatus.PENDING,
      null,
      { items_count: items.length, items: orderItems }
    );
  } catch (error) {
    console.error('Error in createOrderItems:', error);
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
    // Update order status directly through supabase
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: OrderStatus.CANCELLED,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    if (error) {
      throw error;
    }
    
    // Record in order history
    await recordOrderHistory(
      orderId,
      OrderStatus.CANCELLED,
      null,
      { cancelled_at: new Date().toISOString() },
      undefined,
      'customer'
    );
    
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
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: OrderStatus.REFUNDED,
        refund_status: 'requested',
        refund_amount: refundAmount
      })
      .eq('id', orderId);
      
    if (updateError) {
      throw updateError;
    }
    
    // Record the refund request
    await recordOrderHistory(
      orderId,
      OrderStatus.REFUNDED,
      null,
      { 
        reason: reason,
        refund_amount: refundAmount,
        requested_at: new Date().toISOString()
      },
      undefined,
      userId,
      'customer'
    );
    
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
