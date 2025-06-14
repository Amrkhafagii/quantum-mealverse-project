
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
 * Record order history entry in the database
 */
export const recordOrderHistory = async (
  orderId: string,
  status: OrderStatus,
  restaurantId?: string,
  metadata?: Record<string, any>,
  customTimestamp?: string
): Promise<void> => {
  const restaurantName = restaurantId ? await getRestaurantName(restaurantId) : '';
  
  const { error } = await supabase
    .from('order_history')
    .insert({
      order_id: orderId,
      status,
      restaurant_id: restaurantId || '',
      restaurant_name: restaurantName,
      details: metadata || {},
      created_at: customTimestamp || new Date().toISOString()
    });

  if (error) {
    throw error;
  }
};

/**
 * Record restaurant-specific order history entry
 */
export const recordRestaurantOrderHistory = async (
  orderId: string,
  status: string,
  restaurantId: string,
  metadata?: Record<string, any>
): Promise<void> => {
  const restaurantName = await getRestaurantName(restaurantId);
  
  const { error } = await supabase
    .from('order_history')
    .insert({
      order_id: orderId,
      status,
      restaurant_id: restaurantId,
      restaurant_name: restaurantName,
      details: metadata || {},
      created_at: new Date().toISOString()
    });

  if (error) {
    throw error;
  }
};
