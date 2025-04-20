
import { supabase } from '@/integrations/supabase/client';

// Simple interface to type the query result
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
    // Use a simpler approach with explicit type assertion to avoid deep type instantiation
    const { data, error } = await supabase
      .from('order_items')
      .select('id')
      .eq('meal_id', mealId)
      .eq('user_id', userId)
      .limit(1) as { data: OrderItemResult[] | null, error: any };
      
    if (error) {
      console.error('Error checking verified purchase:', error);
      throw error;
    }
    
    // Check if we found any records
    return Array.isArray(data) && data.length > 0;
  } catch (err) {
    console.error('Unexpected error in checkVerifiedPurchase:', err);
    throw err;
  }
};
