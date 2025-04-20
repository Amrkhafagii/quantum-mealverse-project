
import { supabase } from '@/integrations/supabase/client';

interface OrderItemResult {
  id: string;
}

/**
 * Checks if a user has purchased a specific meal by querying the order_items table
 * 
 * @param userId The ID of the user
 * @param mealId The ID of the meal
 * @returns A boolean indicating whether the user has purchased the meal
 */
export const checkVerifiedPurchase = async (userId: string, mealId: string): Promise<boolean> => {
  try {
    // Break up the query chain to avoid deep type instantiation
    const query = supabase.from('order_items');
    const selection = query.select('id');
    
    // Apply filters separately
    const result = await selection
      .eq('meal_id', mealId)
      .eq('user_id', userId)
      .limit(1);
      
    if (result.error) {
      console.error('Error checking verified purchase:', result.error);
      throw result.error;
    }
    
    // Check if we found any records
    return (result.data?.length ?? 0) > 0;
  } catch (err) {
    console.error('Unexpected error in checkVerifiedPurchase:', err);
    throw err;
  }
};
