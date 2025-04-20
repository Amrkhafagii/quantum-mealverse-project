
import { supabase } from '@/integrations/supabase/client';

// Flag a review for moderation
export const flagReview = async (reviewId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('reviews')
    .update({ is_flagged: true })
    .eq('id', reviewId);
    
  if (error) throw error;
  return true;
};

// Verify user's purchase status
export const hasUserPurchased = async (userId: string, mealId: string, restaurantId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('order_items')
    .select('id')
    .match({
      user_id: userId,
      meal_id: mealId,
      restaurant_id: restaurantId
    })
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
};

// Check if user has already reviewed
export const hasUserReviewed = async (userId: string, mealId: string, restaurantId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('id')
    .match({
      user_id: userId,
      meal_id: mealId,
      restaurant_id: restaurantId
    })
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
};

