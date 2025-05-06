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
    console.log(`Starting to update order ${orderId} to status ${newStatus} by restaurant ${restaurantId}`);
    
    // Get current order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .eq('restaurant_id', restaurantId)
      .maybeSingle();
      
    if (orderError) {
      console.error('Failed to fetch order:', orderError);
      return false;
    }
    
    // For accept/reject actions, we don't need to check current status as restaurant_id might not be set yet
    if (!order && (newStatus === OrderStatus.RESTAURANT_ACCEPTED || newStatus === OrderStatus.RESTAURANT_REJECTED)) {
      console.log(`Order not found with restaurant_id constraint, handling accept/reject case`);
      
      // Fetch order without restaurant_id constraint for accept/reject actions
      const { data: baseOrder, error: baseOrderError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();
        
      if (baseOrderError || !baseOrder) {
        console.error('Failed to fetch order without restaurant constraint:', baseOrderError);
        return false;
      }
      
      const currentStatus = baseOrder.status;
      console.log(`Current order status: ${currentStatus}`);
      
      // Validate the status transition
      if (!isValidStatusTransition(currentStatus, newStatus)) {
        console.error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        return false;
      }
      
      // For acceptance, also update restaurant_id
      if (newStatus === OrderStatus.RESTAURANT_ACCEPTED || newStatus === OrderStatus.PREPARING) {
        console.log(`Accepting order ${orderId}, setting restaurant_id to ${restaurantId}`);
        
        // Update order status and restaurant_id
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: newStatus,
            restaurant_id: restaurantId,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
          
        if (updateError) {
          console.error('Failed to update order status:', updateError);
          return false;
        }
        
        // Update assignment status if assignment_id is provided in details
        if (details && details.assignment_id) {
          // Properly type cast the assignment_id to string
          const assignmentId = String(details.assignment_id);
          
          const { error: assignmentError } = await supabase
            .from('restaurant_assignments')
            .update({ 
              status: 'accepted',
              updated_at: new Date().toISOString()
            })
            .eq('id', assignmentId);
            
          if (assignmentError) {
            console.error('Failed to update assignment status:', assignmentError);
            // Continue anyway, as the order status has been updated
          } else {
            console.log(`Successfully updated assignment ${assignmentId} to accepted`);
          }
          
          // Also update other pending assignments for this order to 'cancelled'
          const { error: cancelError } = await supabase
            .from('restaurant_assignments')
            .update({ 
              status: 'cancelled',
              updated_at: new Date().toISOString()
            })
            .eq('order_id', orderId)
            .eq('status', 'pending')
            .neq('id', assignmentId);
            
          if (cancelError) {
            console.error('Failed to cancel other assignments:', cancelError);
          } else {
            console.log(`Successfully cancelled other pending assignments for order ${orderId}`);
          }
        }
      } else {
        // For rejection, just update status
        console.log(`Rejecting order ${orderId}`);
        
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
        
        // Update assignment status if assignment_id is provided in details
        if (details && details.assignment_id) {
          // Properly type cast the assignment_id to string
          const assignmentId = String(details.assignment_id);
          
          const { error: assignmentError } = await supabase
            .from('restaurant_assignments')
            .update({ 
              status: 'rejected',
              updated_at: new Date().toISOString()
            })
            .eq('id', assignmentId);
            
          if (assignmentError) {
            console.error('Failed to update assignment status:', assignmentError);
            // Continue anyway, as the order status has been updated
          } else {
            console.log(`Successfully updated assignment ${assignmentId} to rejected`);
          }
          
          // Check if there are still pending assignments for this order
          const { data: pendingAssignments, error: pendingError } = await supabase
            .from('restaurant_assignments')
            .select('id')
            .eq('order_id', orderId)
            .eq('status', 'pending');
            
          if (pendingError) {
            console.error('Failed to check pending assignments:', pendingError);
          } else if (!pendingAssignments || pendingAssignments.length === 0) {
            console.log(`No more pending assignments for order ${orderId}, updating to no_restaurant_accepted`);
            
            // If no pending assignments remain, update to no_restaurant_accepted
            const { error: noAcceptError } = await supabase
              .from('orders')
              .update({
                status: OrderStatus.NO_RESTAURANT_ACCEPTED,
                updated_at: new Date().toISOString()
              })
              .eq('id', orderId);
              
            if (noAcceptError) {
              console.error('Failed to update order to no_restaurant_accepted:', noAcceptError);
            } else {
              console.log(`Successfully updated order ${orderId} to no_restaurant_accepted`);
            }
          }
        }
      }
      
      // Get restaurant name for the order history
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', restaurantId)
        .single();
        
      const restaurantName = restaurant?.name || 'Unknown Restaurant';
      
      // Record to order history with the restaurant ID that accepted/rejected
      await recordOrderHistory(
        orderId,
        newStatus,
        restaurantId,
        restaurantName,
        details,
        undefined,
        undefined,
        'restaurant'  // Explicitly set changed_by_type
      );
      
      return true;
    }
    
    // For non-accept/reject actions or if order exists with restaurant id
    if (!order) {
      console.error(`Order not found with id ${orderId} and restaurant_id ${restaurantId}`);
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
    
    // Get restaurant name for the order history
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('name')
      .eq('id', restaurantId)
      .single();
      
    const restaurantName = restaurant?.name || 'Unknown Restaurant';
    
    // Record to order history
    await recordOrderHistory(
      orderId,
      newStatus,
      restaurantId,
      restaurantName,
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

// Update the signature of the recordOrderHistory function to include restaurant_name
export const recordOrderHistory = async (
  orderId: string,
  newStatus: OrderStatus,
  restaurantId: string,
  restaurantName: string,
  details?: Record<string, unknown>,
  expiredAt?: string,
  changedBy?: string,
  changedByType: 'system' | 'customer' | 'restaurant' | 'admin' = 'system'
): Promise<void> => {
  try {
    // Insert the record into order_history
    await supabase.from('order_history').insert({
      order_id: orderId,
      status: newStatus,
      previous_status: null, // This will be updated by a trigger or in the service
      restaurant_id: restaurantId,
      restaurant_name: restaurantName,
      details,
      expired_at: expiredAt,
      changed_by: changedBy,
      changed_by_type: changedByType
    });
  } catch (error) {
    console.error('Error recording order history:', error);
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
    console.log(`Fetching orders for restaurant ${restaurantId} with status filter:`, statusFilter);
    
    // First check restaurant_assignments table for assignments to this restaurant
    const { data: assignments, error: assignmentsError } = await supabase
      .from('restaurant_assignments')
      .select('order_id, status')
      .eq('restaurant_id', restaurantId);
      
    if (assignmentsError) {
      console.error('Error fetching restaurant assignments:', assignmentsError);
    }
    
    console.log('All assignments for this restaurant:', assignments);
    
    // Get assigned order IDs, include both 'pending' and 'accepted' assignments
    const assignedOrderIds = assignments
      ?.filter(a => ['pending', 'accepted'].includes(a.status))
      ?.map(a => a.order_id) || [];
      
    console.log('Filtered assigned order IDs:', assignedOrderIds);
    
    // Create a query for orders
    let query = supabase
      .from('orders')
      .select('*, order_items(*)');
      
    // If we have status filters, apply them
    if (statusFilter && statusFilter.length > 0) {
      query = query.in('status', statusFilter);
    }
    
    // Apply restaurant filter - either directly assigned or through assignments table
    if (assignedOrderIds.length > 0) {
      // Get orders either by restaurant_id OR by being in the assigned order IDs
      query = query.or(`restaurant_id.eq.${restaurantId},id.in.(${assignedOrderIds.join(',')})`);
    } else {
      // Just get by restaurant_id
      query = query.eq('restaurant_id', restaurantId);
    }
    
    // Complete the query
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching restaurant orders:', error);
      throw error;
    }
    
    console.log('Orders fetched:', data?.length, data);
    return data as unknown as RestaurantOrder[];
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
    // Pending state is used when initially creating an order - Allow direct acceptance from pending
    [OrderStatus.PENDING]: [OrderStatus.AWAITING_RESTAURANT, OrderStatus.RESTAURANT_ASSIGNED, OrderStatus.RESTAURANT_ACCEPTED, OrderStatus.RESTAURANT_REJECTED],
    // Terminal states
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.REFUNDED]: [],
    [OrderStatus.RESTAURANT_REJECTED]: []
  };
  
  // Handle all status alias variations
  let normalizedCurrent = currentStatus;
  let normalizedNew = newStatus;
  
  // Map friendly status names to their canonical forms
  if (currentStatus === 'accepted') normalizedCurrent = OrderStatus.RESTAURANT_ACCEPTED;
  if (newStatus === 'accepted') normalizedNew = OrderStatus.RESTAURANT_ACCEPTED;
  if (currentStatus === 'rejected') normalizedCurrent = OrderStatus.RESTAURANT_REJECTED;
  if (newStatus === 'rejected') normalizedNew = OrderStatus.RESTAURANT_REJECTED;
  if (currentStatus === 'ready') normalizedCurrent = OrderStatus.READY_FOR_PICKUP;
  if (newStatus === 'ready') normalizedNew = OrderStatus.READY_FOR_PICKUP;
  if (currentStatus === 'delivering') normalizedCurrent = OrderStatus.ON_THE_WAY;
  if (newStatus === 'delivering') normalizedNew = OrderStatus.ON_THE_WAY;
  if (currentStatus === 'completed') normalizedCurrent = OrderStatus.DELIVERED;
  if (newStatus === 'completed') normalizedNew = OrderStatus.DELIVERED;
  
  // Check if the transition is valid - Use string comparison instead of enum comparison
  const allowed = validTransitions[normalizedCurrent];
  return allowed ? allowed.includes(normalizedNew as OrderStatus) : false;
};
