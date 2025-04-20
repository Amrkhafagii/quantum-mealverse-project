
import React from 'react';
import { StarRating } from './StarRating';
import { RatingDistribution } from './RatingDistribution';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRatingSummary } from '@/hooks/useRatingSummary';

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
  const { localStats, globalStats, loading } = useRatingSummary(mealId, restaurantId, showGlobalRating);
  
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
            
            <RatingDistribution 
              distribution={localStats.rating_distribution}
              totalReviews={localStats.review_count}
            />
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
            
            <RatingDistribution 
              distribution={globalStats.rating_distribution}
              totalReviews={globalStats.review_count}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
