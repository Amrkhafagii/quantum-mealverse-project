
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
  // Use type assertion to help TypeScript understand the response type
  const result = await supabase
    .from('order_items')
    .select('id, meal_id, user_id')
    .eq('meal_id', mealId)
    .eq('user_id', userId)
    .limit(1) as Promise<OrderItemResponse>;
    
  const response = await result;
  if (response.error) throw response.error;
  return response.data !== null && response.data.length > 0;
};

