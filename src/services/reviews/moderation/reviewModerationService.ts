
import { supabase } from '@/integrations/supabase/client';

interface ReviewFlagCheck {
  id: string;
}

// Flag a review for moderation
export const flagReview = async (reviewId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('reviews')
    .update({ is_flagged: true })
    .eq('id', reviewId);
    
  if (error) throw error;
  return true;
};

// Check if user has already reviewed
export const hasUserReviewed = async (userId: string, mealId: string, restaurantId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('reviews')
    .select<'reviews', ReviewFlagCheck>('id')
    .match({
      user_id: userId,
      meal_id: mealId,
      restaurant_id: restaurantId
    })
    .limit(1);
    
  if (error) throw error;
  return data !== null && data.length > 0;
};
