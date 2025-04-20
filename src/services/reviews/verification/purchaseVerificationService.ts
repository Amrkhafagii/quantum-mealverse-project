
import { supabase } from '@/integrations/supabase/client';

export const checkVerifiedPurchase = async (userId: string, mealId: string): Promise<boolean> => {
  // Use a more direct approach without complex type inference
  const result = await supabase
    .from('order_items')
    .select('*')  // Use a simpler select statement
    .eq('meal_id', mealId)
    .eq('user_id', userId)
    .limit(1);
    
  if (result.error) throw result.error;
  return result.data !== null && result.data.length > 0;
};
