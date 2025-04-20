
import { supabase } from '@/integrations/supabase/client';
import { PostgrestResponse } from '@supabase/supabase-js';

// Define explicit interface for the query result
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
    // Assert the type early in the query chain
    const result = await supabase
      .from('order_items')
      .select('id')
      .eq('meal_id', mealId)
      .eq('user_id', userId)
      .limit(1) as PostgrestResponse<OrderItemResult[]>;
      
    if (result.error) {
      console.error('Error checking verified purchase:', result.error);
      throw result.error;
    }
    
    return Array.isArray(result.data) && result.data.length > 0;
  } catch (err) {
    console.error('Unexpected error in checkVerifiedPurchase:', err);
    throw err;
  }
};
