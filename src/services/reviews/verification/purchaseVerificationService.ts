
import { supabase } from '@/integrations/supabase/client';

export const checkVerifiedPurchase = async (userId: string, mealId: string): Promise<boolean> => {
  // Use count() function directly to avoid excessive type instantiation
  const { data, error } = await supabase
    .from('order_items')
    .select('*', { count: 'exact' })
    .eq('meal_id', mealId)
    .eq('user_id', userId)
    .limit(1);
    
  if (error) throw error;
  return data !== null && data.length > 0;
};
