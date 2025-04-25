
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
        // Use the proper table name that exists in our database.ts types
        const { data, error } = await supabase
          .from('reviews') // Changed from 'review_metadata'
          .select('*')
          .eq('user_id', review.user_id)
          .eq('meal_id', review.meal_id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          // Since we don't have actual metadata in the reviews table,
          // we'll create a simplified version from the review data
          const simplifiedMetadata: ReviewMetadata = {
            review_user_id: data.user_id,
            review_meal_id: data.meal_id,
            verification_hash: "simplified-hash", // placeholder
            order_id: "order-placeholder", // placeholder
            order_date: data.created_at,
            helpful_votes: 0, // placeholder
            unhelpful_votes: 0 // placeholder
          };
          
          setMetadata(simplifiedMetadata);
          setHelpfulVotes(0); // Default value since we don't have this data yet
          setUnhelpfulVotes(0); // Default value since we don't have this data yet
        }
        
        // We'll simulate the vote checking since we don't have the real table yet
        if (user) {
          // This is a placeholder and would normally query the real review_votes table
          setUserVote(null); // Default no vote
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
      // Simulate vote tracking until our tables are properly set up
      if (userVote === voteType) {
        // Remove vote if clicking the same button
        setUserVote(null);
        if (voteType === 'helpful') {
          setHelpfulVotes(prev => Math.max(0, prev - 1));
        } else {
          setUnhelpfulVotes(prev => Math.max(0, prev - 1));
        }
        toast.success(`Vote removed`);
      } else {
        // Remove previous vote if any
        if (userVote === 'helpful') {
          setHelpfulVotes(prev => Math.max(0, prev - 1));
        } else if (userVote === 'unhelpful') {
          setUnhelpfulVotes(prev => Math.max(0, prev - 1));
        }
        
        // Add new vote
        setUserVote(voteType);
        if (voteType === 'helpful') {
          setHelpfulVotes(prev => prev + 1);
        } else {
          setUnhelpfulVotes(prev => prev + 1);
        }
        
        toast.success(`You marked this review as ${voteType}`);
      }
      
      // In a real implementation, we would update the database:
      // await supabase.from('review_votes').upsert({...})
      // await supabase.from('review_metadata').update({...})
    } catch (err) {
      console.error('Error voting on review:', err);
      toast.error('Failed to register your vote');
    }
  };
  
  // For the rushed review detection, let's simplify until we have real data
  const isRushedReview = false; // Placeholder
  
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
