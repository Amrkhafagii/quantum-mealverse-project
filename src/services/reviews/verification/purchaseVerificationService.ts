
import { supabase } from '@/integrations/supabase/client';

export const checkVerifiedPurchase = async (userId: string, mealId: string): Promise<boolean> => {
  const { count, error } = await supabase
    .from('order_items')
    .select('*', { count: 'exact', head: true })
    .eq('meal_id', mealId)
    .eq('user_id', userId);
    
  if (error) throw error;
  return Boolean(count && count > 0);
};
