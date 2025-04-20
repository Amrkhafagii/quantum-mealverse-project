
import { supabase } from '@/integrations/supabase/client';

interface QueryResult {
  exists: boolean;
}

/**
 * Helper function to encapsulate the Supabase query logic with proper typing
 */
const runPurchaseQuery = async (userId: string, mealId: string): Promise<QueryResult> => {
  const { data, error } = await supabase
    .rpc('check_verified_purchase', {
      user_id: userId,
      meal_id: mealId
    });

  if (error) {
    console.error('Error checking verified purchase:', error);
    throw error;
  }

  return { exists: !!data };
};

/**
 * Checks if a user has purchased a specific meal by querying the order_items table
 * 
 * @param userId The ID of the user
 * @param mealId The ID of the meal
 * @returns A boolean indicating whether the user has purchased the meal
 */
export const checkVerifiedPurchase = async (userId: string, mealId: string): Promise<boolean> => {
  try {
    const result = await runPurchaseQuery(userId, mealId);
    return result.exists;
  } catch (err) {
    console.error('Unexpected error in checkVerifiedPurchase:', err);
    throw err;
  }
};
