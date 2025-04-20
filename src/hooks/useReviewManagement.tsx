
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/types/review';
import { toast } from 'sonner';

export const useReviewManagement = () => {
  const [loading, setLoading] = useState(false);

  const handleApproveReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ 
          status: 'approved',
          is_flagged: false 
        })
        .eq('id', reviewId);
        
      if (error) throw error;
      
      await updateRatingCache(reviewId);
      toast.success('Review approved');
      return true;
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve review');
      return false;
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'rejected' })
        .eq('id', reviewId);
        
      if (error) throw error;
      
      toast.success('Review rejected');
      return true;
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('Failed to reject review');
      return false;
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);
        
      if (error) throw error;
      
      toast.success('Review deleted');
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
      return false;
    }
  };

  const updateRatingCache = async (reviewId: string) => {
    try {
      const { data: review } = await supabase
        .from('reviews')
        .select('meal_id, restaurant_id')
        .eq('id', reviewId)
        .single();

      if (!review) return;

      await supabase.rpc('update_meal_rating_cache', {
        p_meal_id: review.meal_id,
        p_restaurant_id: review.restaurant_id
      });
      
      await supabase.rpc('update_global_meal_rating_cache', {
        p_meal_id: review.meal_id
      });
    } catch (error) {
      console.error('Error updating rating cache:', error);
    }
  };

  return {
    loading,
    handleApproveReview,
    handleRejectReview,
    handleDeleteReview
  };
};
