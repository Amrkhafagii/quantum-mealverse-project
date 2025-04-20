
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Review } from '@/types/review';
import { AdminReviewCard } from '@/components/reviews/AdminReviewCard';
import { Button } from '@/components/ui/button';
import { useReviewManagement } from '@/hooks/useReviewManagement';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ReviewFilter = 'all' | 'flagged' | 'pending';

export const ReviewsManagement = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const { handleApproveReview, handleRejectReview, handleDeleteReview } = useReviewManagement();
  
  useEffect(() => {
    checkAdminAccess();
    fetchReviews();
  }, [filter]);
  
  const checkAdminAccess = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error || !data) {
        toast.error('You do not have access to this page');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      toast.error('Error checking permissions');
    }
  };
  
  const fetchReviews = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          meals (name),
          restaurants (name)
        `)
        .order('created_at', { ascending: false });
      
      if (filter === 'flagged') {
        query = query.eq('is_flagged', true);
      } else if (filter === 'pending') {
        query = query.eq('status', 'pending');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Properly cast the status before setting
      const typedReviews = data?.map(review => ({
        ...review,
        status: review.status as 'pending' | 'approved' | 'rejected' // Ensure status is typed correctly
      })) as Review[];
      
      setReviews(typedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const onApprove = async (id: string) => {
    const success = await handleApproveReview(id);
    if (success) {
      setReviews(reviews.map(review => 
        review.id === id 
          ? { ...review, status: 'approved' as const, is_flagged: false } 
          : review
      ));
    }
  };

  const onReject = async (id: string) => {
    const success = await handleRejectReview(id);
    if (success) {
      setReviews(reviews.map(review => 
        review.id === id 
          ? { ...review, status: 'rejected' as const } 
          : review
      ));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    const success = await handleDeleteReview(id);
    if (success) {
      setReviews(reviews.filter(review => review.id !== id));
    }
  };
  
  if (loading) {
    return <div className="text-center p-8">Loading reviews...</div>;
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reviews Management</h1>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <Select 
            value={filter} 
            onValueChange={(value: ReviewFilter) => setFilter(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            No reviews found
          </div>
        ) : (
          reviews.map((review) => (
            <AdminReviewCard
              key={review.id}
              review={review as any}
              onApprove={onApprove}
              onReject={onReject}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsManagement;
