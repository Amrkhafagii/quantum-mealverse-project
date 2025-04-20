
import { supabase } from '@/integrations/supabase/client';

// Define explicit interfaces for the query results
interface OrderItem {
  id: string;
  meal_id: string;
  user_id: string;
  order_id: string;
}

interface OrderItemResponse {
  data: OrderItem[] | null;
  error: any;
}

export const checkVerifiedPurchase = async (userId: string, mealId: string): Promise<boolean> => {
  // Query order_items table to see if the user has purchased this meal
  const result = await supabase
    .from('order_items')
    .select('id, meal_id, user_id, order_id')
    .eq('meal_id', mealId)
    .eq('user_id', userId)
    .limit(1);
    
  if (result.error) throw result.error;
  return result.data !== null && result.data.length > 0;
};
