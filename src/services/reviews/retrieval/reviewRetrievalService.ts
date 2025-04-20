
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/types/review';

// Get a specific meal's reviews for a specific restaurant
export const getMealReviews = async (mealId: string, restaurantId: string, page = 1, limit = 10) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .match({
      meal_id: mealId,
      restaurant_id: restaurantId,
      status: 'approved'
    })
    .order('created_at', { ascending: false })
    .range(from, to);
    
  if (error) throw error;
  
  return { 
    reviews: data as Review[], 
    total: count || 0,
    page,
    pages: count ? Math.ceil(count / limit) : 0
  };
};

