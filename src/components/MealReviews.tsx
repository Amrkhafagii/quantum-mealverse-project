
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RatingsSummary } from '@/components/reviews/RatingsSummary';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface MealReviewsProps {
  mealId: string;
  restaurantId: string;
}

export const MealReviews: React.FC<MealReviewsProps> = ({
  mealId,
  restaurantId
}) => {
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    // Refresh could be added here if needed
  };
  
  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      
      <Tabs defaultValue="ratings">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          {user && !showReviewForm && (
            <Button onClick={() => setShowReviewForm(true)}>
              Write a Review
            </Button>
          )}
        </div>
        
        {showReviewForm && (
          <div className="mb-8">
            <ReviewForm 
              mealId={mealId} 
              restaurantId={restaurantId} 
              onSuccess={handleReviewSuccess} 
            />
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        <TabsContent value="ratings">
          <RatingsSummary 
            mealId={mealId} 
            restaurantId={restaurantId} 
            showGlobalRating={true} 
          />
        </TabsContent>
        
        <TabsContent value="reviews">
          <ReviewList 
            mealId={mealId} 
            restaurantId={restaurantId} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
