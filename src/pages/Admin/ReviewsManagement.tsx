
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Review } from '@/types/review';
import { StarRating } from '@/components/reviews/StarRating';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Flag, Clock, MessageSquare, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ReviewsManagement: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'pending'>('all');
  
  useEffect(() => {
    // Check if user is admin
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
          // Redirect to home
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        toast.error('Error checking permissions');
      }
    };
    
    checkAdminAccess();
  }, [user]);
  
  useEffect(() => {
    fetchReviews();
  }, [filter]);
  
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
      
      setReviews(data as any[]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };
  
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
      
      // Update the local state
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, status: 'approved', is_flagged: false } 
          : review
      ));
      
      // Trigger rating recalculation
      await updateRatingCache(reviews.find(r => r.id === reviewId));
      
      toast.success('Review approved');
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve review');
    }
  };
  
  const handleRejectReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'rejected' })
        .eq('id', reviewId);
        
      if (error) throw error;
      
      // Update the local state
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, status: 'rejected' } 
          : review
      ));
      
      toast.success('Review rejected');
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('Failed to reject review');
    }
  };
  
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);
        
      if (error) throw error;
      
      // Update the local state
      setReviews(reviews.filter(review => review.id !== reviewId));
      
      toast.success('Review deleted');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };
  
  const updateRatingCache = async (review?: Review) => {
    if (!review) return;
    
    try {
      // Update restaurant-specific ratings
      await supabase.rpc('update_meal_rating_cache', {
        p_meal_id: review.meal_id,
        p_restaurant_id: review.restaurant_id
      });
      
      // Update global ratings
      await supabase.rpc('update_global_meal_rating_cache', {
        p_meal_id: review.meal_id
      });
    } catch (error) {
      console.error('Error updating rating cache:', error);
    }
  };
  
  const getStatusBadge = (status: string, isFlagged: boolean) => {
    if (isFlagged) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Flag className="w-3 h-3" />
          Flagged
        </Badge>
      );
    }
    
    switch (status) {
      case 'approved':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <Check className="w-3 h-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <X className="w-3 h-3" />
            Rejected
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
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
            onValueChange={(value: any) => setFilter(value)}
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
            <Card key={review.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">
                          {(review as any).meals?.name || 'Unknown Meal'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          at {(review as any).restaurants?.name || 'Unknown Restaurant'}
                        </p>
                      </div>
                      <div>
                        {getStatusBadge(review.status, review.is_flagged || false)}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <StarRating rating={review.rating} size="sm" />
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {review.comment || 'No comment provided'}
                      </div>
                    </div>
                    
                    {review.images && review.images.length > 0 && (
                      <div className="mt-4 flex gap-2 overflow-x-auto">
                        {review.images.map((img, index) => (
                          <img 
                            key={index} 
                            src={img} 
                            alt={`Review image ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4 text-xs text-gray-500">
                      <span>
                        Posted {review.created_at ? formatDistanceToNow(new Date(review.created_at), { addSuffix: true }) : 'recently'}
                      </span>
                      {review.is_verified_purchase && (
                        <span className="ml-2 text-green-600">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col gap-2 justify-end">
                    {review.status !== 'approved' && (
                      <Button
                        size="sm"
                        variant="default"
                        className="w-full"
                        onClick={() => handleApproveReview(review.id || '')}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    
                    {review.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full"
                        onClick={() => handleRejectReview(review.id || '')}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleDeleteReview(review.id || '')}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsManagement;
