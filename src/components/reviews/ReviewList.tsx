
import React, { useEffect, useState } from 'react';
import { Review } from '@/types/review';
import { EnhancedReviewCard } from './EnhancedReviewCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReviewListProps {
  mealId: string;
  restaurantId: string;
  limit?: number;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  mealId,
  restaurantId,
  limit = 5
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  
  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Count total reviews
      const { count, error: countError } = await supabase
        .from('reviews')
        .select('id', { count: 'exact' })
        .eq('meal_id', mealId)
        .eq('restaurant_id', restaurantId)
        .eq('status', 'approved');
        
      if (countError) throw countError;
      
      setTotalCount(count || 0);
      
      // Get paginated reviews
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('meal_id', mealId)
        .eq('restaurant_id', restaurantId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
        
      if (error) throw error;
      
      setReviews(data as Review[]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReviews();
  }, [mealId, restaurantId, page, limit]);
  
  const handleFlag = async (reviewId: string) => {
    if (!user) {
      toast.error('You must be logged in to flag a review');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_flagged: true })
        .eq('id', reviewId);
        
      if (error) throw error;
      
      // Update local state
      setReviews(reviews.map(review => 
        review.id === reviewId ? { ...review, is_flagged: true } : review
      ));
    } catch (error) {
      console.error('Error flagging review:', error);
      toast.error('Failed to flag review');
    }
  };
  
  if (loading && page === 1) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-full">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-20 w-full mb-1" />
            <div className="flex gap-2">
              <Skeleton className="h-16 w-16" />
              <Skeleton className="h-16 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (reviews.length === 0 && !loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet for this meal. Be the first to leave a review!
      </div>
    );
  }
  
  return (
    <div>
      <div className="space-y-4">
        {reviews.map((review) => (
          <EnhancedReviewCard 
            key={review.id} 
            review={review} 
            onFlag={handleFlag}
          />
        ))}
      </div>
      
      {totalCount > limit && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 border rounded-md disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {page} of {Math.ceil(totalCount / limit)}
            </span>
            <button
              className="px-3 py-1 border rounded-md disabled:opacity-50"
              disabled={page >= Math.ceil(totalCount / limit)}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
