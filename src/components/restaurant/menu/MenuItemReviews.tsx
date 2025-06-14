import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import { EnhancedReviewCard } from '@/components/reviews/EnhancedReviewCard';
import { RatingsSummary } from '@/components/reviews/RatingsSummary';
import { Skeleton } from "@/components/ui/skeleton";

interface MenuItemReviewsProps {
  mealId: string;
  restaurantId: string;
}

export const MenuItemReviews: React.FC<MenuItemReviewsProps> = ({ 
  mealId, 
  restaurantId 
}) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch reviews for this specific menu item
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            profiles:user_id (
              username,
              avatar_url
            )
          `)
          .eq('meal_id', mealId)
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setReviews(data || []);
      } catch (err: any) {
        console.error('Error fetching reviews:', err);
        setError(err.message || 'Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (mealId && restaurantId) {
      fetchReviews();
    }
  }, [mealId, restaurantId]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Reviews</CardTitle>
        <CardDescription>
          See what customers are saying about this menu item
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
          </div>
        ) : error ? (
          <div className="text-center p-4 text-red-500">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            <RatingsSummary 
              mealId={mealId} 
              restaurantId={restaurantId} 
              showGlobalRating={true}
            />
            
            {reviews.length === 0 ? (
              <div className="text-center p-4 text-gray-500">
                No reviews yet for this menu item
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <EnhancedReviewCard 
                      key={review.id} 
                      review={{
                        ...review,
                        user: {
                          name: review.profiles?.username || 'Anonymous',
                          avatar: review.profiles?.avatar_url,
                        },
                        created_at: format(new Date(review.created_at), 'PPP'),
                      }}
                      
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
