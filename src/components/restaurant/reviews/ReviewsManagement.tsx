
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Flag, MessageCircle } from 'lucide-react';
import { reviewService } from '@/services/reviews/reviewService';
import type { RestaurantReview, MealRating } from '@/types/notifications';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';

export const ReviewsManagement: React.FC = () => {
  const { restaurant } = useRestaurantAuth();
  const [reviews, setReviews] = useState<RestaurantReview[]>([]);
  const [mealRatings, setMealRatings] = useState<MealRating[]>([]);
  const [averageRating, setAverageRating] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurant?.id) return;

    const loadReviewsData = async () => {
      try {
        const [reviewsData, ratingsData, avgData] = await Promise.all([
          reviewService.getRestaurantReviews(restaurant.id),
          reviewService.getMealRatings(restaurant.id),
          reviewService.getRestaurantAverageRating(restaurant.id)
        ]);

        setReviews(reviewsData);
        setMealRatings(ratingsData);
        setAverageRating(avgData);
      } catch (error) {
        console.error('Error loading reviews data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReviewsData();
  }, [restaurant?.id]);

  const handleFlagReview = async (reviewId: string) => {
    try {
      await reviewService.flagReview(reviewId, 'Inappropriate content');
      setReviews(prev =>
        prev.map(review =>
          review.id === reviewId
            ? { ...review, is_flagged: true, status: 'pending' }
            : review
        )
      );
    } catch (error) {
      console.error('Error flagging review:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">
                {averageRating?.averageRating || '0.0'}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(averageRating?.averageRating || 0))}
              </div>
              <p className="text-sm text-gray-600">
                {averageRating?.totalReviews || 0} reviews
              </p>
            </div>
            
            <div className="col-span-2">
              <h4 className="font-medium mb-3">Rating Distribution</h4>
              {Object.entries(averageRating?.ratingDistribution || {})
                .reverse()
                .map(([star, count]) => (
                  <div key={star} className="flex items-center mb-2">
                    <span className="w-8 text-sm">{star}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${
                            averageRating?.totalReviews > 0
                              ? ((count as number) / averageRating.totalReviews) * 100
                              : 0
                          }%`
                        }}
                      ></div>
                    </div>
                    <span className="w-8 text-sm text-gray-600">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No reviews yet</p>
              <p className="text-sm">Reviews from customers will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <Badge variant={review.is_verified_purchase ? 'default' : 'secondary'}>
                        {review.is_verified_purchase ? 'Verified Purchase' : 'Unverified'}
                      </Badge>
                      {review.is_flagged && (
                        <Badge variant="destructive">Flagged</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFlagReview(review.id)}
                        disabled={review.is_flagged}
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {review.comment && (
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    {(review as any).orders?.customer_name && (
                      <span>by {(review as any).orders.customer_name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meal Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Item Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          {mealRatings.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No meal ratings available yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mealRatings.map((rating) => (
                <div key={rating.meal_id} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">
                    {(rating as any).menu_items?.name || 'Unknown Item'}
                  </h4>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex">{renderStars(Math.round(rating.avg_rating))}</div>
                    <span className="text-sm font-medium">{rating.avg_rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">
                      ({rating.review_count} reviews)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
