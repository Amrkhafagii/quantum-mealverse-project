
import { supabase } from '@/integrations/supabase/client';
import { RestaurantOrder, OrderStatus } from '@/types/restaurant';
import { recordOrderHistory } from '@/services/orders/webhook/orderHistoryService';

/**
 * Update an order's status with proper validation and history tracking
 * @param orderId Order ID
 * @param newStatus New status to apply
 * @param restaurantId Restaurant ID
 * @param details Additional details for the history
 * @returns Success or failure
 */
export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  restaurantId: string,
  details?: Record<string, unknown>
): Promise<boolean> => {
  try {
    // Get current order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .eq('restaurant_id', restaurantId)
      .single();
      
    if (orderError || !order) {
      console.error('Failed to fetch order:', orderError);
      return false;
    }
    
    // Validate status transition
    if (!isValidStatusTransition(order.status, newStatus)) {
      console.error(`Invalid status transition from ${order.status} to ${newStatus}`);
      return false;
    }
    
    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
      
    if (updateError) {
      console.error('Failed to update order status:', updateError);
      return false;
    }
    
    // Record to order history
    await recordOrderHistory(
      orderId,
      newStatus,
      restaurantId,
      details,
      undefined,
      undefined,
      'restaurant'
    );
    
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};

/**
 * Get active orders for a restaurant
 * @param restaurantId Restaurant ID
 * @returns Array of orders
 */
export const getRestaurantOrders = async (
  restaurantId: string,
  statusFilter?: OrderStatus[]
): Promise<RestaurantOrder[]> => {
  try {
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('restaurant_id', restaurantId);
      
    if (statusFilter && statusFilter.length > 0) {
      query = query.in('status', statusFilter);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as RestaurantOrder[];
  } catch (error) {
    console.error('Error fetching restaurant orders:', error);
    return [];
  }
};

/**
 * Checks if a status transition is valid
 */
const isValidStatusTransition = (currentStatus: string, newStatus: string): boolean => {
  // Define valid transitions for each status
  const validTransitions: Record<string, OrderStatus[]> = {
    [OrderStatus.AWAITING_RESTAURANT]: [OrderStatus.RESTAURANT_ACCEPTED, OrderStatus.RESTAURANT_REJECTED],
    [OrderStatus.RESTAURANT_ASSIGNED]: [OrderStatus.RESTAURANT_ACCEPTED, OrderStatus.RESTAURANT_REJECTED],
    [OrderStatus.RESTAURANT_ACCEPTED]: [OrderStatus.PREPARING],
    [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP],
    [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.ON_THE_WAY],
    [OrderStatus.ON_THE_WAY]: [OrderStatus.DELIVERED],
    // Terminal states
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.REFUNDED]: [],
    [OrderStatus.RESTAURANT_REJECTED]: []
  };
  
  // Check if the transition is valid
  const allowed = validTransitions[currentStatus];
  return allowed ? allowed.includes(newStatus as OrderStatus) : false;
};
