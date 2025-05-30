import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { OrderStatus } from '@/types/restaurant';

type OrderHistoryInsert = Database['public']['Tables']['order_history']['Insert'];
type OrderHistoryRow = Database['public']['Tables']['order_history']['Row'];

/**
 * Records an entry in the order history table with standardized UTC timestamps
 */
export const recordOrderHistory = async (
  orderId: string,
  status: string,
  restaurantId?: string | null,
  details?: Record<string, unknown>,
  expiredAt?: string,
  changedBy?: string,
  changedByType: 'system' | 'customer' | 'restaurant' | 'admin' = 'system',
  visibility: boolean = true
): Promise<void> => {
  try {
    console.log(`Recording order history for order ${orderId} with status ${status}, restaurant ${restaurantId || 'null'}`);
    
    // For certain status types, we must have a restaurant_id
    // Due to NOT NULL constraint
    if (!restaurantId || restaurantId === 'unknown') {
      console.log(`Restaurant ID is missing or unknown, attempting to find it from order data`);
      
      // Try to fetch the restaurant_id from the order
      const { data: orderData } = await supabase
        .from('orders')
        .select('restaurant_id, status')
        .eq('id', orderId)
        .single();
      
      if (orderData?.restaurant_id) {
        restaurantId = orderData.restaurant_id;
        console.log(`Successfully retrieved restaurant_id ${restaurantId} from orders table`);
      } else {
        console.warn('Could not retrieve restaurant_id from orders table');
        // Default to null to satisfy the constraint
        restaurantId = null;
      }
    }
    
    // Get restaurant name if restaurantId is provided
    let restaurantName = 'Unknown Restaurant';
    if (restaurantId) {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', restaurantId)
        .single();
      
      restaurantName = restaurant?.name || 'Unknown Restaurant';
      console.log(`Retrieved restaurant name: ${restaurantName || 'null'}`);
    }

    // Get previous status directly from the order table
    const { data: orderData } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();
    
    const previousStatus = orderData?.status;
    console.log(`Previous status from order table: ${previousStatus || 'null'}`);

    // Get the latest status from order_history as a fallback
    let fallbackPreviousStatus = null;
    if (!previousStatus) {
      const { data: lastStatus } = await supabase
        .from('order_history')
        .select('status')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      fallbackPreviousStatus = lastStatus?.status;
      console.log(`Fallback previous status from order_history: ${fallbackPreviousStatus || 'null'}`);
    }
    
    // Ensure timestamps are in UTC
    const now = new Date().toISOString();
    const expiredAtUTC = expiredAt ? new Date(expiredAt).toISOString() : undefined;
    
    // Normalize status for order_history based on both OrderStatus enum and string aliases
    let normalizedStatus = status;
    
    // Map any simplified status names to their canonical form for order_history
    if (status === 'accepted') {
      normalizedStatus = OrderStatus.RESTAURANT_ACCEPTED;
      console.log(`Mapped status 'accepted' to '${OrderStatus.RESTAURANT_ACCEPTED}' for order_history`);
    } else if (status === 'rejected') {
      normalizedStatus = OrderStatus.RESTAURANT_REJECTED;
      console.log(`Mapped status 'rejected' to '${OrderStatus.RESTAURANT_REJECTED}' for order_history`);
    } else if (status === 'ready') {
      normalizedStatus = OrderStatus.READY_FOR_PICKUP;
      console.log(`Mapped status 'ready' to '${OrderStatus.READY_FOR_PICKUP}' for order_history`);
    } else if (status === 'delivering') {
      normalizedStatus = OrderStatus.ON_THE_WAY;
      console.log(`Mapped status 'delivering' to '${OrderStatus.ON_THE_WAY}' for order_history`);
    } else if (status === 'completed') {
      normalizedStatus = OrderStatus.DELIVERED;
      console.log(`Mapped status 'completed' to '${OrderStatus.DELIVERED}' for order_history`);
    }
    
    // Create history entry with conditional restaurant data
    const historyEntry: OrderHistoryInsert = {
      order_id: orderId,
      status: normalizedStatus,
      previous_status: previousStatus || fallbackPreviousStatus || null,
      restaurant_id: restaurantId,
      restaurant_name: restaurantName,
      details: details as any, // Type cast since we can't guarantee the shape
      expired_at: expiredAtUTC,
      changed_by: changedBy,
      changed_by_type: changedByType,
      visibility
    };
    
    console.log('Adding history entry:', historyEntry);
    
    // Insert record into order_history table
    const { data, error } = await supabase
      .from('order_history')
      .insert(historyEntry);
      
    if (error) {
      console.error('Error recording order history:', error);
      // Don't throw here, but log the error to prevent the restaurant operation from failing
    } else {
      console.log(`Successfully recorded order history for order ${orderId}`);
    }

    // Log to console for debugging
    console.log(`Order ${orderId} status updated to ${status} by restaurant ${restaurantId || 'unknown'}`);
  } catch (error) {
    console.error('Error recording order history:', error);
    // Don't throw here, but log the error to prevent the restaurant operation from failing
  }
};

/**
 * Gets the complete order history for an order
 */
export const getOrderHistory = async (orderId: string, visibleOnly = false) => {
  try {
    let query = supabase
      .from('order_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
      
    if (visibleOnly) {
      query = query.eq('visibility', true);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching order history:', error);
    return [];
  }
};

/**
 * Adds an idempotent entry to order history to prevent duplicate status updates
 */
export const addIdempotentOrderHistory = async (
  orderId: string,
  status: string,
  idempotencyKey: string,
  restaurantId?: string | null,
  details?: Record<string, unknown>,
  changedByType: 'system' | 'customer' | 'restaurant' | 'admin' = 'system'
): Promise<boolean> => {
  try {
    // Check if an entry with this idempotency key already exists
    const { data: existingEntry } = await supabase
      .from('order_history')
      .select('id')
      .eq('order_id', orderId)
      .eq('status', status)
      .eq('details->>idempotencyKey', idempotencyKey) // Changed from -> to ->>
      .maybeSingle();
      
    // If entry exists, don't create a duplicate
    if (existingEntry) {
      return false;
    }
    
    // Add idempotency key to details
    const detailsWithKey = {
      ...(details || {}),
      idempotencyKey
    };
    
    // Record the history with the idempotency key
    await recordOrderHistory(
      orderId,
      status,
      restaurantId,
      detailsWithKey,
      undefined,
      undefined,
      changedByType
    );
    
    return true;
  } catch (error) {
    console.error('Error in idempotent order history:', error);
    return false;
  }
};
