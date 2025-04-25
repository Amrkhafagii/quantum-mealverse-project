
import { supabase } from '@/integrations/supabase/client';

/**
 * Records an entry in the order history table with standardized UTC timestamps
 */
export const recordOrderHistory = async (
  orderId: string,
  status: string,
  restaurantId?: string | null,
  details?: Record<string, unknown>, // Changed to unknown to avoid deep instantiation
  expiredAt?: string,
  changedBy?: string,
  changedByType: 'system' | 'customer' | 'restaurant' | 'admin' = 'system',
  visibility: boolean = true
): Promise<void> => {
  try {
    // Get restaurant name if restaurantId is provided
    let restaurantName = null;
    if (restaurantId) {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', restaurantId)
        .single();
      
      restaurantName = restaurant?.name;
    }

    // Get previous status for this order
    const { data: lastStatus } = await supabase
      .from('order_history')
      .select('status')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    // Ensure timestamps are in UTC
    const now = new Date().toISOString();
    const expiredAtUTC = expiredAt ? new Date(expiredAt).toISOString() : undefined;
    
    // Insert record into order_history table
    const { error } = await supabase
      .from('order_history')
      .insert({
        order_id: orderId,
        status,
        previous_status: lastStatus?.status,
        restaurant_id: restaurantId,
        restaurant_name: restaurantName || 'Pending Assignment',
        details,
        expired_at: expiredAtUTC,
        changed_by: changedBy,
        changed_by_type: changedByType,
        visibility
      });
      
    if (error) {
      console.error('Error recording order history:', error);
      return;
    }

    // Log to console for debugging
    console.log(`Order ${orderId} status updated to ${status}${restaurantId ? ` by restaurant ${restaurantId}` : ''}`);
  } catch (error) {
    console.error('Error recording order history:', error);
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
  details?: Record<string, unknown>, // Simple type to avoid deep instantiation
  changedByType: 'system' | 'customer' | 'restaurant' | 'admin' = 'system'
): Promise<boolean> => {
  try {
    // Check if an entry with this idempotency key already exists
    const { data: existingEntry } = await supabase
      .from('order_history')
      .select('id')
      .eq('order_id', orderId)
      .eq('status', status)
      .eq('details->idempotencyKey', idempotencyKey)
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
