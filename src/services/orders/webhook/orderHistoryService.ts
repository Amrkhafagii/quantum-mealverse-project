
import { supabase } from '@/integrations/supabase/client';

/**
 * Records an entry in the order history table
 */
export const recordOrderHistory = async (
  orderId: string,
  status: string,
  restaurantId?: string | null,
  details?: any,
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
        expired_at: expiredAt,
        changed_by: changedBy,
        changed_by_type: changedByType,
        visibility
      });
      
    if (error) {
      console.error('Error recording order history:', error);
      return;
    }
  } catch (error) {
    console.error('Error recording order history:', error);
  }
};
