
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types/cart';

interface OrderData {
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  city?: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  status: string;
  payment_method?: string;
  delivery_method?: string;
  special_instructions?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  assignment_source?: string;
  is_mixed_order?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  validItems: CartItem[];
  invalidItems: CartItem[];
  errors: string[];
}

/**
 * Calculates dynamic delivery fee based on distance, time, and other factors
 */
const calculateDeliveryFee = (
  latitude?: number | null,
  longitude?: number | null,
  deliveryMethod?: string,
  subtotal?: number
): number => {
  console.log('Calculating delivery fee with params:', { latitude, longitude, deliveryMethod, subtotal });
  
  // Base delivery fee
  let deliveryFee = 5.00;
  
  // If pickup, no delivery fee
  if (deliveryMethod === 'pickup') {
    return 0;
  }
  
  // Distance-based calculation (simplified - in real app, calculate actual distance)
  if (latitude && longitude) {
    // Mock distance calculation - replace with actual distance API
    const mockDistance = Math.random() * 20; // 0-20 km
    if (mockDistance > 10) {
      deliveryFee += 2.00; // Extra fee for long distance
    }
  }
  
  // Time-based surcharge (peak hours)
  const currentHour = new Date().getHours();
  if ((currentHour >= 11 && currentHour <= 14) || (currentHour >= 18 && currentHour <= 21)) {
    deliveryFee += 1.50; // Peak hour surcharge
  }
  
  // Minimum order discount
  if (subtotal && subtotal > 50) {
    deliveryFee = Math.max(0, deliveryFee - 2.00); // Free delivery for large orders
  }
  
  console.log(`Calculated delivery fee: ${deliveryFee}`);
  return Number(deliveryFee.toFixed(2));
};

/**
 * Validates and transforms cart items for order creation
 */
const validateAndTransformItems = async (items: CartItem[]): Promise<ValidationResult> => {
  console.log(`Validating ${items.length} cart items`);
  
  const validItems: CartItem[] = [];
  const invalidItems: CartItem[] = [];
  const errors: string[] = [];
  
  for (const item of items) {
    try {
      // Basic validation
      if (!item.id || !item.name || !item.price || !item.quantity) {
        invalidItems.push(item);
        errors.push(`Invalid item data for ${item.name || 'unknown item'}`);
        continue;
      }
      
      // Price validation
      if (item.price <= 0 || item.quantity <= 0) {
        invalidItems.push(item);
        errors.push(`Invalid price or quantity for ${item.name}`);
        continue;
      }
      
      // Item is valid
      validItems.push(item);
    } catch (error) {
      console.error(`Error validating item ${item.name}:`, error);
      invalidItems.push(item);
      errors.push(`Validation error for ${item.name}`);
    }
  }
  
  console.log(`Validation complete: ${validItems.length} valid, ${invalidItems.length} invalid`);
  
  return {
    isValid: invalidItems.length === 0,
    validItems,
    invalidItems,
    errors
  };
};

/**
 * Creates a new order with enhanced logging and validation
 */
export const createOrder = async (
  orderData: Omit<OrderData, 'delivery_fee'> & { deliveryMethod?: string },
  items: CartItem[]
): Promise<{ success: boolean; orderId?: string; error?: string }> => {
  console.log(`Creating order for user ${orderData.user_id} with total amount: ${orderData.total}`);
  console.log('Order data:', JSON.stringify(orderData, null, 2));
  
  try {
    // Validate items first
    const validation = await validateAndTransformItems(items);
    if (!validation.isValid) {
      console.error('Item validation failed:', validation.errors);
      return {
        success: false,
        error: `Invalid items: ${validation.errors.join(', ')}`
      };
    }
    
    // Calculate dynamic delivery fee
    const deliveryFee = calculateDeliveryFee(
      orderData.latitude,
      orderData.longitude,
      orderData.deliveryMethod,
      orderData.subtotal
    );
    
    // Prepare final order data
    const finalOrderData: OrderData = {
      ...orderData,
      delivery_fee: deliveryFee,
      total: orderData.subtotal + deliveryFee // Recalculate total with dynamic fee
    };
    
    console.log('Creating order with final data:', finalOrderData);
    
    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(finalOrderData)
      .select()
      .single();
    
    if (orderError) {
      console.error('Failed to create order:', orderError);
      throw new Error(`Order creation failed: ${orderError.message}`);
    }
    
    console.log('Order created successfully:', order.id);
    
    // Create order items in batch
    const orderItems = validation.validItems.map(item => ({
      order_id: order.id,
      meal_id: item.id,
      menu_item_id: null,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      source_type: item.assignment_source === 'nutrition_generation' ? 'meal_plan' : 'menu_item'
    }));
    
    console.log(`Creating ${orderItems.length} order items`);
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('Failed to create order items:', itemsError);
      // Try to cleanup the order if items failed
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(`Order items creation failed: ${itemsError.message}`);
    }
    
    console.log('Order items created successfully');
    
    return {
      success: true,
      orderId: order.id
    };
    
  } catch (error) {
    console.error('Critical error in order creation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Helper function to determine source type for order items
 */
export const determineSourceType = (item: CartItem): string => {
  if (item.assignment_source === 'nutrition_generation') {
    return 'meal_plan';
  }
  if (item.assignment_source === 'traditional_ordering') {
    return 'menu_item';
  }
  return 'meal_plan'; // Default for backward compatibility
};

/**
 * Check if order has mixed item types
 */
export const hasMixedOrderTypes = (items: CartItem[]): boolean => {
  const sourceTypes = new Set(items.map(item => determineSourceType(item)));
  return sourceTypes.size > 1;
};
