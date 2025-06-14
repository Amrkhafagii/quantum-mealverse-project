
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus } from '@/types/webhook';

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
  const { error } = await supabase
    .from('order_history')
    .insert({
      order_id: orderId,
      status,
      restaurant_id: restaurantId,
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
  const { error } = await supabase
    .from('order_history')
    .insert({
      order_id: orderId,
      status,
      restaurant_id: restaurantId,
      details: metadata || {},
      created_at: new Date().toISOString()
    });

  if (error) {
    throw error;
  }
};
