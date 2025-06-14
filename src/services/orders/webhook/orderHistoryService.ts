
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus } from '@/types/webhook';

/**
 * Record order history entry in the database
 */
export const recordOrderHistory = async (
  orderId: string,
  status: OrderStatus,
  restaurantId?: string,
  metadata?: Record<string, any>
): Promise<void> => {
  const { error } = await supabase
    .from('order_history')
    .insert({
      order_id: orderId,
      status,
      restaurant_id: restaurantId,
      metadata: metadata || {},
      created_at: new Date().toISOString()
    });

  if (error) {
    throw error;
  }
};
