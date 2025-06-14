
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus } from '@/types/webhook';

/**
 * Order history tracking utilities
 */

export const recordStatusChange = async (
  orderId: string,
  newStatus: OrderStatus,
  restaurantId?: string,
  metadata?: Record<string, any>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('order_history')
      .insert({
        order_id: orderId,
        status: newStatus,
        restaurant_id: restaurantId,
        metadata,
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

export const recordCancellation = async (
  orderId: string,
  reason?: string,
  restaurantId?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('order_history')
      .insert({
        order_id: orderId,
        status: OrderStatus.CANCELLED,
        restaurant_id: restaurantId,
        metadata: {
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
