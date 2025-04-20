
import React from 'react';
import { Review } from '@/types/review';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from './StarRating';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Trash } from 'lucide-react';

interface AdminReviewCardProps {
  review: Review & {
    meals?: { name: string };
    restaurants?: { name: string };
  };
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}

export const AdminReviewCard: React.FC<AdminReviewCardProps> = ({ 
  review, 
  onApprove, 
  onReject, 
  onDelete 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle>Review for {review.meals?.name || 'Unknown Meal'}</CardTitle>
            <p className="text-sm text-gray-500">
              At {review.restaurants?.name || 'Unknown Restaurant'}
            </p>
          </div>
          <div className="space-x-2">
            {review.is_flagged && (
              <Badge variant="outline" className="bg-red-100 text-red-800">
                Flagged
              </Badge>
            )}
            <Badge variant={
              review.status === 'approved' ? 'default' : 
              review.status === 'pending' ? 'secondary' : 
              'destructive'
            }>
              {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <StarRating rating={review.rating} size="sm" showNumber />
        </div>
        
        {review.comment && (
          <p className="text-gray-600 mb-4">{review.comment}</p>
        )}
        
        {review.images && review.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {review.images.map((image, index) => (
              <img 
                key={index} 
                src={image} 
                alt={`Review ${index + 1}`} 
                className="w-20 h-20 object-cover rounded" 
              />
            ))}
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          {review.is_verified_purchase && (
            <span className="mr-3">✓ Verified Purchase</span>
          )}
          <span>
            Submitted on {new Date(review.created_at || '').toLocaleDateString()}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-500 border-red-500"
          onClick={() => onDelete(review.id || '')}
        >
          <Trash className="w-4 h-4 mr-1" /> Delete
        </Button>
        
        <div className="space-x-2">
          {review.status !== 'rejected' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-500 border-red-500"
              onClick={() => onReject(review.id || '')}
            >
              <X className="w-4 h-4 mr-1" /> Reject
            </Button>
          )}
          
          {review.status !== 'approved' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-green-500 border-green-500"
              onClick={() => onApprove(review.id || '')}
            >
              <Check className="w-4 h-4 mr-1" /> Approve
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
