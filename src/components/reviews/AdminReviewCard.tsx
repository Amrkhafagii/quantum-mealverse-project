
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Review } from '@/types/review';
import { StarRating } from './StarRating';
import { format } from 'date-fns';

interface AdminReviewCardProps {
  review: Review;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete?: (id: string) => void; // Added this missing prop
  isProcessing?: boolean;
}

export const AdminReviewCard: React.FC<AdminReviewCardProps> = ({
  review,
  onApprove,
  onReject,
  onDelete,
  isProcessing = false
}) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'outline'; // Using valid variant
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Review by User ID: {review.user_id}</h3>
          <Badge variant={getStatusBadgeVariant(review.status)}>
            {review.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-sm text-gray-500">
            {format(new Date(review.created_at), 'PPP')}
          </span>
        </div>
        
        <p className="text-sm">{review.comment}</p>
        
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 mt-2">
            {review.images.map((image, index) => (
              <img 
                key={index} 
                src={image} 
                alt={`Review Image ${index + 1}`} 
                className="w-20 h-20 object-cover rounded" 
              />
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        {review.status === 'pending' && (
          <>
            <Button 
              variant="secondary" 
              onClick={() => onReject(review.id)}
              disabled={isProcessing}
            >
              Reject
            </Button>
            <Button 
              onClick={() => onApprove(review.id)}
              disabled={isProcessing}
            >
              Approve
            </Button>
          </>
        )}
        
        {/* Add delete button if onDelete prop is provided */}
        {onDelete && (
          <Button 
            variant="destructive" 
            onClick={() => onDelete(review.id)}
            disabled={isProcessing}
          >
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
