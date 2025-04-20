
import { supabase } from '@/integrations/supabase/client';

/**
 * Simplified version that avoids complex type inference
 */
export const checkVerifiedPurchase = async (userId: string, mealId: string): Promise<boolean> => {
  try {
    // Use a raw query approach with explicit typing
    const { data, error } = await supabase.rpc('check_verified_purchase', {
      user_id: userId,
      meal_id: mealId
    });

    if (error) {
      console.error('Error checking verified purchase:', error);
      throw error;
    }
    
    return Boolean(data);
  } catch (err) {
    console.error('Unexpected error in checkVerifiedPurchase:', err);
    throw err;
  }
};
