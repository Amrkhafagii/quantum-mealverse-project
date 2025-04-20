
import React from 'react';
import { Review } from '@/types/review';
import { formatDistanceToNow } from 'date-fns';
import { Check, X, Flag } from 'lucide-react';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdminReviewCardProps {
  review: Review & { meals?: { name: string }, restaurants?: { name: string } };
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}

export const AdminReviewCard = ({ 
  review, 
  onApprove, 
  onReject, 
  onDelete 
}: AdminReviewCardProps) => {
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
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            Pending
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">
                  {review.meals?.name || 'Unknown Meal'}
                </h3>
                <p className="text-sm text-gray-500">
                  at {review.restaurants?.name || 'Unknown Restaurant'}
                </p>
              </div>
              {getStatusBadge(review.status, review.is_flagged || false)}
            </div>
            
            <div className="mt-2">
              <StarRating rating={review.rating} size="sm" />
              <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
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
              Posted {review.created_at && formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
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
                onClick={() => onApprove(review.id || '')}
              >
                <Check className="w-4 h-4 mr-1" />
                Approve
              </Button>
            )}
            
            {review.status !== 'rejected' && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onReject(review.id || '')}
              >
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
            )}
            
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(review.id || '')}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
