
import { supabase } from '@/integrations/supabase/client';

export const checkVerifiedPurchase = async (userId: string, mealId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('order_items')
    .select('id')
    .eq('meal_id', mealId)
    .eq('user_id', userId)
    .limit(1);
    
  if (error) throw error;
  return data !== null && data.length > 0;
};
