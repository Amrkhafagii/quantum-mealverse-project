
import { supabase } from '@/integrations/supabase/client';

/**
 * Records an entry in the order history table
 */
export const recordOrderHistory = async (
  orderId: string,
  status: string,
  restaurantId?: string | null,
  details?: any,
  expiredAt?: string
): Promise<void> => {
  try {
    let restaurantName = null;
    if (restaurantId) {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', restaurantId)
        .single();
      
      restaurantName = restaurant?.name;
    }
    
    console.log('Recording order history:', {
      order_id: orderId,
      status,
      restaurant_id: restaurantId,
      restaurant_name: restaurantName,
      details,
      expired_at: expiredAt
    });
    
    const { error } = await supabase
      .from('order_history')
      .insert({
        order_id: orderId,
        status,
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        details,
        expired_at: expiredAt
      });
      
    if (error) {
      console.error('Error recording order history:', error);
      return;
    }
      
    console.log(`Order history recorded for ${orderId}, status: ${status}`);
  } catch (error) {
    console.error('Error recording order history:', error);
  }
};
