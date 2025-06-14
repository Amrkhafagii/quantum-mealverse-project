
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus } from '@/types/webhook';

/**
 * Get restaurant name by ID
 */
const getRestaurantName = async (restaurantId: string): Promise<string> => {
  if (!restaurantId) return '';
  
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('name')
      .eq('id', restaurantId)
      .single();
    
    if (error || !data) return '';
    return data.name || '';
  } catch (error) {
    console.error('Error fetching restaurant name:', error);
    return '';
  }
};

/**
 * Record order status change in history
 */
export const recordStatusChange = async (
  orderId: string,
  newStatus: OrderStatus,
  restaurantId?: string,
  metadata?: Record<string, any>
): Promise<boolean> => {
  try {
    const restaurantName = restaurantId ? await getRestaurantName(restaurantId) : '';
    
    const { error } = await supabase
      .from('order_history')
      .insert({
        order_id: orderId,
        status: newStatus,
        restaurant_id: restaurantId || '',
        restaurant_name: restaurantName,
        details: metadata || {},
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error recording status change:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in recordStatusChange:', error);
    return false;
  }
};

/**
 * Record order cancellation in history
 */
export const recordCancellation = async (
  orderId: string,
  reason?: string,
  restaurantId?: string
): Promise<boolean> => {
  try {
    const restaurantName = restaurantId ? await getRestaurantName(restaurantId) : '';
    
    const { error } = await supabase
      .from('order_history')
      .insert({
        order_id: orderId,
        status: OrderStatus.CANCELLED,
        restaurant_id: restaurantId || '',
        restaurant_name: restaurantName,
        details: {
          cancellation_reason: reason || 'No reason provided',
          cancelled_at: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error recording cancellation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in recordCancellation:', error);
    return false;
  }
};
