import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Flag, Reply } from 'lucide-react';
import { reviewService } from '@/services/reviews/reviewService';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { useToast } from '@/components/ui/use-toast';

export const ReviewsManagement: React.FC = () => {
  const { restaurant } = useRestaurantAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<RestaurantReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    if (!restaurant?.id) return;
    loadReviews();
    loadAverageRating();
  }, [restaurant?.id]);

  const loadReviews = async () => {
    if (!restaurant?.id) return;
    
    try {
      const data = await reviewService.getRestaurantReviews(restaurant.id);
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAverageRating = async () => {
    if (!restaurant?.id) return;
    
    try {
      const ratingData = await reviewService.getRestaurantAverageRating(restaurant.id);
      setAverageRating(ratingData.averageRating);
      setTotalReviews(ratingData.totalReviews);
    } catch (error) {
      console.error('Error loading average rating:', error);
    }
  };

  const handleFlagReview = async (reviewId: string) => {
    try {
      await reviewService.flagReview(reviewId, 'Inappropriate content');
      toast({
        title: 'Success',
        description: 'Review has been flagged for moderation'
      });
      loadReviews();
    } catch (error) {
      console.error('Error flagging review:', error);
      toast({
        title: 'Error',
        description: 'Failed to flag review',
        variant: 'destructive'
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="flex">{renderStars(Math.round(averageRating))}</div>
              <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
            </div>
            <p className="text-sm text-gray-600">Average Rating</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-sm text-gray-600">Total Reviews</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {reviews.filter(r => r.rating >= 4).length}
            </div>
            <p className="text-sm text-gray-600">Positive Reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No reviews yet</p>
              <p className="text-sm">Your customers' reviews will appear here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {review.user_id.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <Badge variant={review.status === 'approved' ? 'default' : 'secondary'}>
                            {review.status}
                          </Badge>
                          {review.is_verified_purchase && (
                            <Badge variant="outline">Verified Purchase</Badge>
                          )}
                          {review.is_flagged && (
                            <Badge variant="destructive">Flagged</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFlagReview(review.id)}
                        disabled={review.is_flagged}
                      >
                        <Flag className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Reply className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {review.comment && (
                    <div className="mb-3">
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  )}

                  {review.images && review.images.length > 0 && (
                    <div className="flex space-x-2 mb-3">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
