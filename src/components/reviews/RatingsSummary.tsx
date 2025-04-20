
import React, { useEffect, useState } from 'react';
import { StarRating } from './StarRating';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RatingStats {
  avg_rating: number;
  review_count: number;
  rating_distribution: Record<number, number>;
}

interface RatingsSummaryProps {
  mealId: string;
  restaurantId: string;
  showGlobalRating?: boolean;
}

export const RatingsSummary: React.FC<RatingsSummaryProps> = ({
  mealId,
  restaurantId,
  showGlobalRating = true
}) => {
  const [localStats, setLocalStats] = useState<RatingStats | null>(null);
  const [globalStats, setGlobalStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRatings = async () => {
      setLoading(true);
      try {
        // Get restaurant-specific rating stats
        const { data: localData, error: localError } = await supabase
          .from('meal_ratings')
          .select('*')
          .eq('meal_id', mealId)
          .eq('restaurant_id', restaurantId)
          .single();
          
        if (localError && localError.code !== 'PGRST116') { // Not found error
          throw localError;
        }
        
        // If no cached ratings exist yet, calculate from reviews
        if (!localData) {
          const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews')
            .select('rating')
            .eq('meal_id', mealId)
            .eq('restaurant_id', restaurantId)
            .eq('status', 'approved');
            
          if (reviewsError) throw reviewsError;
          
          if (reviewsData && reviewsData.length > 0) {
            const distribution: Record<number, number> = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
            let sum = 0;
            
            reviewsData.forEach(review => {
              const rating = review.rating;
              sum += rating;
              distribution[rating] = (distribution[rating] || 0) + 1;
            });
            
            setLocalStats({
              avg_rating: sum / reviewsData.length,
              review_count: reviewsData.length,
              rating_distribution: distribution
            });
          } else {
            setLocalStats({
              avg_rating: 0,
              review_count: 0,
              rating_distribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
            });
          }
        } else {
          // Parse the distribution from the cache
          setLocalStats({
            avg_rating: localData.avg_rating,
            review_count: localData.review_count,
            rating_distribution: localData.rating_distribution || {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
          });
        }
        
        // Get global meal rating stats if enabled
        if (showGlobalRating) {
          const { data: globalData, error: globalError } = await supabase
            .from('global_meal_ratings')
            .select('*')
            .eq('meal_id', mealId)
            .single();
            
          if (globalError && globalError.code !== 'PGRST116') { // Not found error
            throw globalError;
          }
          
          if (!globalData) {
            const { data: allReviewsData, error: allReviewsError } = await supabase
              .from('reviews')
              .select('rating')
              .eq('meal_id', mealId)
              .eq('status', 'approved');
              
            if (allReviewsError) throw allReviewsError;
            
            if (allReviewsData && allReviewsData.length > 0) {
              const distribution: Record<number, number> = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
              let sum = 0;
              
              allReviewsData.forEach(review => {
                const rating = review.rating;
                sum += rating;
                distribution[rating] = (distribution[rating] || 0) + 1;
              });
              
              setGlobalStats({
                avg_rating: sum / allReviewsData.length,
                review_count: allReviewsData.length,
                rating_distribution: distribution
              });
            } else {
              setGlobalStats({
                avg_rating: 0,
                review_count: 0,
                rating_distribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
              });
            }
          } else {
            setGlobalStats({
              avg_rating: globalData.avg_rating,
              review_count: globalData.review_count,
              rating_distribution: globalData.rating_distribution || {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
            });
          }
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
        toast.error('Failed to load rating information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRatings();
  }, [mealId, restaurantId, showGlobalRating]);
  
  const renderDistribution = (stats: RatingStats) => {
    return [5, 4, 3, 2, 1].map(star => {
      const count = stats.rating_distribution[star] || 0;
      const percentage = stats.review_count > 0 
        ? (count / stats.review_count) * 100 
        : 0;
        
      return (
        <div key={star} className="flex items-center mb-1">
          <div className="w-8 text-sm text-gray-600">{star} ★</div>
          <div className="flex-1 mx-2">
            <Progress value={percentage} className="h-2" />
          </div>
          <div className="w-12 text-xs text-gray-500 text-right">
            {count} ({percentage.toFixed(0)}%)
          </div>
        </div>
      );
    });
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {localStats && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ratings at this Restaurant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="text-3xl font-bold mr-2">
                {localStats.avg_rating.toFixed(1)}
              </div>
              <div>
                <StarRating rating={localStats.avg_rating} size="md" />
                <div className="text-sm text-gray-500 mt-1">
                  Based on {localStats.review_count} {localStats.review_count === 1 ? 'review' : 'reviews'}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              {renderDistribution(localStats)}
            </div>
          </CardContent>
        </Card>
      )}
      
      {showGlobalRating && globalStats && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Global Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="text-3xl font-bold mr-2">
                {globalStats.avg_rating.toFixed(1)}
              </div>
              <div>
                <StarRating rating={globalStats.avg_rating} size="md" />
                <div className="text-sm text-gray-500 mt-1">
                  Based on {globalStats.review_count} {globalStats.review_count === 1 ? 'review' : 'reviews'} across all restaurants
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              {renderDistribution(globalStats)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
