
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { BadgeCheck, Flag } from 'lucide-react';
import { Review } from '@/types/review';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface ReviewCardProps {
  review: Review;
  onFlag?: (reviewId: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ 
  review,
  onFlag
}) => {
  const { user } = useAuth();
  const isAdmin = user?.email === 'admin@example.com'; // Replace with proper admin check
  
  const handleFlag = () => {
    if (onFlag && review.id) {
      onFlag(review.id);
      toast.success('Review has been flagged for moderation');
    }
  };
  
  return (
    <Card className="w-full mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-sm font-medium">
                {review.created_at && formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </span>
              {review.is_verified_purchase && (
                <div className="flex items-center text-green-600 text-xs">
                  <BadgeCheck className="w-3 h-3 mr-1" />
                  <span>Verified Purchase</span>
                </div>
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
