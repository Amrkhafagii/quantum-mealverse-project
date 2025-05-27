import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/contexts/CartContext';
import { OrderStatus } from '@/types/webhook';
import { DeliveryFormValues } from '@/hooks/useDeliveryForm';
import { recordOrderHistory } from './webhook/orderHistoryService';
import { MenuValidationService } from '@/services/validation/menuValidationService';

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
    // Create subtotal from items - using flat structure
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
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
 * Creates order items for a given order with enhanced validation
 */
export const createOrderItems = async (orderId: string, items: CartItem[]) => {
  try {
    console.log('Creating order items for order:', {
      orderId,
      itemsCount: items.length,
      itemsStructure: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        hasNestedMeal: item.hasOwnProperty('meal'),
        structure: item.hasOwnProperty('meal') ? 'nested' : 'flat'
      }))
    });

    // First, validate all cart items exist in menu_items table
    const validation = await MenuValidationService.validateCartItems(items);
    
    if (validation.invalidItems.length > 0) {
      const invalidItemNames = validation.invalidItems.map(item => item.name).join(', ');
      throw new Error(`The following items are no longer available: ${invalidItemNames}. Please refresh your cart and try again.`);
    }

    if (validation.validItems.length === 0) {
      throw new Error('No valid items found in cart. Please add items to your cart before placing an order.');
    }

    // Use validated items instead of original items
    const validatedItems = validation.validItems;

    // Map items with defensive programming to handle both nested and flat structures
    const orderItems = validatedItems.map((item, index) => {
      try {
        // Handle both nested (legacy) and flat (current) structures
        let mealId: string;
        let price: number;
        let name: string;
        let quantity: number;

        // Check if this is a nested structure (legacy format)
        if (item.hasOwnProperty('meal') && (item as any).meal) {
          console.log(`Item ${index} has nested structure (legacy format)`);
          const nestedItem = item as any;
          mealId = nestedItem.meal?.id || nestedItem.id;
          price = nestedItem.meal?.price || nestedItem.price;
          name = nestedItem.meal?.name || nestedItem.name;
          quantity = nestedItem.quantity;
        } else {
          // Flat structure (current format)
          console.log(`Item ${index} has flat structure (current format)`);
          mealId = item.id;
          price = item.price;
          name = item.name;
          quantity = item.quantity;
        }

        // Validate required fields
        if (!mealId) {
          throw new Error(`Missing meal ID for item at index ${index}`);
        }
        if (!name) {
          throw new Error(`Missing name for item at index ${index}`);
        }
        if (typeof price !== 'number' || price < 0) {
          throw new Error(`Invalid price for item at index ${index}: ${price}`);
        }
        if (typeof quantity !== 'number' || quantity <= 0) {
          throw new Error(`Invalid quantity for item at index ${index}: ${quantity}`);
        }

        console.log(`Successfully mapped item ${index}:`, {
          meal_id: mealId,
          name,
          price,
          quantity,
          order_id: orderId
        });

        return {
          order_id: orderId,
          meal_id: mealId,
          quantity,
          price,
          name
        };
      } catch (itemError) {
        console.error(`Error mapping item at index ${index}:`, {
          error: itemError,
          item,
          itemKeys: Object.keys(item)
        });
        throw new Error(`Failed to map item at index ${index}: ${itemError instanceof Error ? itemError.message : String(itemError)}`);
      }
    });

    console.log('Final order items to insert:', orderItems);
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
      
    if (itemsError) {
      console.error('Database insertion error for order items:', {
        error: itemsError,
        orderId,
        itemsCount: orderItems.length
      });
      throw itemsError;
    }
    
    console.log(`Successfully created ${orderItems.length} order items for order ${orderId}`);
    
    // Record the items in order history
    await recordOrderHistory(
      orderId,
      OrderStatus.PENDING,
      null,
      { items_count: validatedItems.length }
    );
  } catch (error) {
    console.error('Critical error in createOrderItems:', {
      error,
      orderId,
      itemsReceived: items.length,
      errorMessage: error instanceof Error ? error.message : String(error)
    });
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
