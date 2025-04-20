
import { supabase } from '@/integrations/supabase/client';

export const checkVerifiedPurchase = async (userId: string, mealId: string): Promise<boolean> => {
  // Use a more specific query with explicit typing to avoid excessive type instantiation
  const { count, error } = await supabase
    .from('order_items')
    .select('id', { count: 'exact', head: true })
    .eq('meal_id', mealId)
    .eq('user_id', userId);
    
  if (error) throw error;
  return Boolean(count && count > 0);
};
