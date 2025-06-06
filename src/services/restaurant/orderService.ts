
import { supabase } from '@/integrations/supabase/client';
import { recordOrderHistory } from '@/services/orders/webhook/orderHistoryService';
import { OrderStatus } from '@/types/webhook';

export interface RestaurantOrder {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  delivery_address: string;
  city?: string;
  notes?: string;
  delivery_method?: string;
  payment_method?: string;
  delivery_fee?: number;
  subtotal?: number;
  total: number;
  status: string;
  latitude?: number;
  longitude?: number;
  assignment_source: string;
  created_at: string;
  updated_at: string;
  formatted_order_id?: string;
  restaurant_id?: string;
  user_id?: string;
  order_items?: Array<{
    id: string;
    meal_id: string;
    quantity: number;
    price: number;
    customizations?: any;
    special_instructions?: string;
    meal?: {
      name: string;
      description?: string;
      image_url?: string;
    };
  }>;
}

/**
 * Fetch orders assigned to a specific restaurant
 */
export const fetchRestaurantOrders = async (restaurantId: string): Promise<RestaurantOrder[]> => {
  try {
    console.log('Fetching orders for restaurant:', restaurantId);
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          meal_id,
          quantity,
          price,
          customizations,
          special_instructions
        )
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching restaurant orders:', error);
      throw error;
    }

    console.log('Successfully fetched restaurant orders:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in fetchRestaurantOrders:', error);
    throw error;
  }
};

// Export alias for backward compatibility
export const getRestaurantOrders = fetchRestaurantOrders;

/**
 * Fetch pending restaurant assignments
 */
export const fetchPendingAssignments = async (restaurantId: string) => {
  try {
    console.log('Fetching pending assignments for restaurant:', restaurantId);
    
    const { data, error } = await supabase
      .from('restaurant_assignments')
      .select(`
        *,
        order:orders!restaurant_assignments_order_id_fkey (
          *,
          order_items (
            id,
            meal_id,
            quantity,
            price,
            customizations,
            special_instructions
          )
        )
      `)
      .eq('restaurant_id', restaurantId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending assignments:', error);
      throw error;
    }

    console.log('Successfully fetched pending assignments:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in fetchPendingAssignments:', error);
    throw error;
  }
};

/**
 * Accept a restaurant assignment
 */
export const acceptRestaurantAssignment = async (
  orderId: string,
  restaurantId: string,
  notes?: string
): Promise<boolean> => {
  try {
    console.log('Accepting restaurant assignment:', { orderId, restaurantId, notes });

    // Update the order with restaurant_id and status
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        restaurant_id: restaurantId,
        status: OrderStatus.RESTAURANT_ACCEPTED,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (orderError) {
      console.error('Error updating order for acceptance:', orderError);
      throw orderError;
    }

    // Update the assignment status
    const { error: assignmentError } = await supabase
      .from('restaurant_assignments')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString(),
        response_notes: notes
      })
      .eq('order_id', orderId)
      .eq('restaurant_id', restaurantId)
      .eq('status', 'pending');

    if (assignmentError) {
      console.error('Error updating assignment status:', assignmentError);
      throw assignmentError;
    }

    // Cancel other pending assignments for this order
    const { error: cancelError } = await supabase
      .from('restaurant_assignments')
      .update({ status: 'cancelled' })
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .neq('restaurant_id', restaurantId);

    if (cancelError) {
      console.warn('Error cancelling other assignments:', cancelError);
    }

    // Record the acceptance in order history
    await recordOrderHistory(
      orderId,
      OrderStatus.RESTAURANT_ACCEPTED,
      restaurantId,
      {
        notes: notes || 'Order accepted by restaurant',
        source: 'restaurant_dashboard'
      }
    );

    console.log('Successfully accepted restaurant assignment');
    return true;
  } catch (error) {
    console.error('Error in acceptRestaurantAssignment:', error);
    return false;
  }
};

/**
 * Reject a restaurant assignment
 */
export const rejectRestaurantAssignment = async (
  orderId: string,
  restaurantId: string,
  reason?: string
): Promise<boolean> => {
  try {
    console.log('Rejecting restaurant assignment:', { orderId, restaurantId, reason });

    // Update the assignment status to rejected
    const { error: assignmentError } = await supabase
      .from('restaurant_assignments')
      .update({
        status: 'rejected',
        responded_at: new Date().toISOString(),
        response_notes: reason
      })
      .eq('order_id', orderId)
      .eq('restaurant_id', restaurantId)
      .eq('status', 'pending');

    if (assignmentError) {
      console.error('Error updating assignment status:', assignmentError);
      throw assignmentError;
    }

    // Check if any assignments are still pending
    const { data: pendingAssignments } = await supabase
      .from('restaurant_assignments')
      .select('id')
      .eq('order_id', orderId)
      .eq('status', 'pending');

    // If no more pending assignments, update order status
    if (!pendingAssignments?.length) {
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: OrderStatus.NO_RESTAURANT_AVAILABLE,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order status after rejection:', orderError);
      }

      // Record the rejection in order history
      await recordOrderHistory(
        orderId,
        OrderStatus.NO_RESTAURANT_AVAILABLE,
        restaurantId,
        {
          rejection_reason: reason || 'Order rejected by restaurant',
          source: 'restaurant_dashboard'
        }
      );
    }

    console.log('Successfully rejected restaurant assignment');
    return true;
  } catch (error) {
    console.error('Error in rejectRestaurantAssignment:', error);
    return false;
  }
};

/**
 * Update restaurant order status
 */
export const updateRestaurantOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  restaurantId: string,
  notes?: string
): Promise<boolean> => {
  try {
    console.log('Updating restaurant order status:', { orderId, newStatus, restaurantId, notes });

    // Update the order status
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('restaurant_id', restaurantId);

    if (orderError) {
      console.error('Error updating restaurant order status:', orderError);
      throw orderError;
    }

    // Record the status change in history
    await recordOrderHistory(
      orderId,
      newStatus,
      restaurantId,
      {
        notes: notes || `Status updated to ${newStatus}`,
        source: 'restaurant_dashboard'
      }
    );

    console.log('Successfully updated restaurant order status');
    return true;
  } catch (error) {
    console.error('Error in updateRestaurantOrderStatus:', error);
    return false;
  }
};

// Export alias for backward compatibility
export const updateOrderStatus = updateRestaurantOrderStatus;

/**
 * Get restaurant order by ID
 */
export const getRestaurantOrderById = async (
  orderId: string,
  restaurantId: string
): Promise<RestaurantOrder | null> => {
  try {
    console.log('Fetching restaurant order by ID:', { orderId, restaurantId });
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          meal_id,
          quantity,
          price,
          customizations,
          special_instructions
        )
      `)
      .eq('id', orderId)
      .eq('restaurant_id', restaurantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('Restaurant order not found:', { orderId, restaurantId });
        return null;
      }
      console.error('Error fetching restaurant order:', error);
      throw error;
    }

    console.log('Successfully fetched restaurant order');
    return data;
  } catch (error) {
    console.error('Error in getRestaurantOrderById:', error);
    throw error;
  }
};
