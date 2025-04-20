
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RatingStats } from '@/types/review';

export const useRatingSummary = (mealId: string, restaurantId: string, showGlobalRating = true) => {
  const [localStats, setLocalStats] = useState<RatingStats | null>(null);
  const [globalStats, setGlobalStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const { data: localData, error: localError } = await supabase
        .from('meal_ratings')
        .select('*')
        .eq('meal_id', mealId)
        .eq('restaurant_id', restaurantId)
        .single();
      
      if (localData) {
        // Proper type casting for rating_distribution
        const distribution = localData.rating_distribution as Record<string, number> || {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        
        // Convert string keys to numbers for RatingStats interface
        const typedDistribution: Record<number, number> = {};
        Object.entries(distribution).forEach(([key, value]) => {
          typedDistribution[Number(key)] = value;
        });
        
        setLocalStats({
          avg_rating: localData.avg_rating,
          review_count: localData.review_count,
          rating_distribution: typedDistribution
        });
      }

      if (showGlobalRating) {
        const { data: globalData } = await supabase
          .from('global_meal_ratings')
          .select('*')
          .eq('meal_id', mealId)
          .single();
          
        if (globalData) {
          // Proper type casting for rating_distribution
          const globalDistribution = globalData.rating_distribution as Record<string, number> || {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
          
          // Convert string keys to numbers for RatingStats interface
          const typedGlobalDistribution: Record<number, number> = {};
          Object.entries(globalDistribution).forEach(([key, value]) => {
            typedGlobalDistribution[Number(key)] = value;
          });
          
          setGlobalStats({
            avg_rating: globalData.avg_rating,
            review_count: globalData.review_count,
            rating_distribution: typedGlobalDistribution
          });
        }
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [mealId, restaurantId, showGlobalRating]);

  return {
    localStats,
    globalStats,
    loading
  };
};
