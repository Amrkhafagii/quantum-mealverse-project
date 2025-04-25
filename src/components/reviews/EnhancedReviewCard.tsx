
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { BadgeCheck, Flag, CalendarIcon, Clock, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { Review } from '@/types/review';
import { ReviewMetadata } from '@/types/reviewMetadata';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EnhancedReviewCardProps {
  review: Review;
  onFlag?: (reviewId: string) => void;
}

export const EnhancedReviewCard: React.FC<EnhancedReviewCardProps> = ({ 
  review,
  onFlag
}) => {
  const { user } = useAuth();
  const isAdmin = user?.email === 'admin@example.com'; // Replace with proper admin check
  const [metadata, setMetadata] = useState<ReviewMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState<number>(0);
  const [unhelpfulVotes, setUnhelpfulVotes] = useState<number>(0);
  const [userVote, setUserVote] = useState<'helpful' | 'unhelpful' | null>(null);
  
  // Fetch review metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!review.id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('review_metadata')
          .select('*')
          .eq('review_user_id', review.user_id)
          .eq('review_meal_id', review.meal_id)
          .maybeSingle();
          
        if (error) throw error;
        if (data) {
          setMetadata(data as ReviewMetadata);
          setHelpfulVotes(data.helpful_votes || 0);
          setUnhelpfulVotes(data.unhelpful_votes || 0);
        }
        
        // If user is logged in, check if they've already voted
        if (user) {
          const { data: voteData } = await supabase
            .from('review_votes')
            .select('vote_type')
            .eq('review_id', review.id)
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (voteData) {
            setUserVote(voteData.vote_type);
          }
        }
      } catch (err) {
        console.error('Error fetching review metadata:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetadata();
  }, [review.id, review.user_id, review.meal_id, user]);
  
  const handleFlag = () => {
    if (onFlag && review.id) {
      onFlag(review.id);
      toast.success('Review has been flagged for moderation');
    }
  };
  
  const handleVote = async (voteType: 'helpful' | 'unhelpful') => {
    if (!user || !review.id) {
      toast.error('You must be logged in to vote on reviews');
      return;
    }
    
    try {
      // Check if user has already voted
      if (userVote) {
        // Remove previous vote
        await supabase
          .from('review_votes')
          .delete()
          .eq('review_id', review.id)
          .eq('user_id', user.id);
          
        // Update counts based on previous vote
        if (userVote === 'helpful') {
          setHelpfulVotes(prev => prev - 1);
        } else {
          setUnhelpfulVotes(prev => prev - 1);
        }
        
        // If clicking the same button, just remove the vote
        if (userVote === voteType) {
          setUserVote(null);
          return;
        }
      }
      
      // Add new vote
      await supabase
        .from('review_votes')
        .insert({
          review_id: review.id,
          user_id: user.id,
          vote_type: voteType
        });
        
      // Update local state
      setUserVote(voteType);
      if (voteType === 'helpful') {
        setHelpfulVotes(prev => prev + 1);
      } else {
        setUnhelpfulVotes(prev => prev + 1);
      }
      
      // Also update the metadata table
      if (metadata) {
        await supabase
          .from('review_metadata')
          .update({
            helpful_votes: voteType === 'helpful' ? helpfulVotes + 1 : helpfulVotes,
            unhelpful_votes: voteType === 'unhelpful' ? unhelpfulVotes + 1 : unhelpfulVotes,
          })
          .eq('review_user_id', review.user_id)
          .eq('review_meal_id', review.meal_id);
      }
      
      toast.success(`You marked this review as ${voteType}`);
    } catch (err) {
      console.error('Error voting on review:', err);
      toast.error('Failed to register your vote');
    }
  };
  
  const isRushedReview = metadata?.experience_time && metadata.experience_time < 60;
  
  return (
    <Card className="w-full mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div className="w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-sm font-medium">
                {review.created_at && formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </span>
              
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <>
                  {review.is_verified_purchase && (
                    <div className="flex items-center text-green-600 text-xs">
                      <BadgeCheck className="w-3 h-3 mr-1" />
                      <span>Verified Purchase</span>
                    </div>
                  )}
                  
                  {metadata?.order_date && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center text-gray-500 text-xs">
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            <span>Order Timeline</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <p>Ordered: {format(new Date(metadata.order_date), 'PPP')}</p>
                            {metadata.delivery_date && (
                              <p>Delivered: {format(new Date(metadata.delivery_date), 'PPP')}</p>
                            )}
                            <p>Reviewed: {format(new Date(review.created_at!), 'PPP')}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {isRushedReview && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center text-amber-500 text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>Quick Review</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">This review was written very quickly</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </>
              )}
            </div>
            
            <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
            
            {review.images && review.images.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
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
            
            {/* Review helpfulness controls */}
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant={userVote === 'helpful' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleVote('helpful')}
                className="h-7 px-2 text-xs"
              >
                <ThumbsUp className="w-3 h-3 mr-1" />
                Helpful {helpfulVotes > 0 && `(${helpfulVotes})`}
              </Button>
              
              <Button
                variant={userVote === 'unhelpful' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleVote('unhelpful')}
                className="h-7 px-2 text-xs"
              >
                <ThumbsDown className="w-3 h-3 mr-1" />
                Not helpful {unhelpfulVotes > 0 && `(${unhelpfulVotes})`}
              </Button>
            </div>
          </div>
          
          <div>
            {!isAdmin && review.user_id !== user?.id && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleFlag}
                className="text-gray-500 hover:text-red-500"
              >
                <Flag className="w-4 h-4" />
              </Button>
            )}
            
            {isAdmin && review.is_flagged && (
              <div className="text-red-500 text-xs flex items-center">
                <Flag className="w-3 h-3 mr-1" />
                <span>Flagged</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
