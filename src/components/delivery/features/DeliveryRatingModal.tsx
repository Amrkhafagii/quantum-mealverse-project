
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDeliveryRating } from '@/hooks/delivery/useDeliveryRating';
import { useToast } from '@/hooks/use-toast';
import { Star, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DeliveryRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  orderId: string;
  deliveryUserId: string;
  customerId: string;
  deliveryUserName: string;
}

export const DeliveryRatingModal: React.FC<DeliveryRatingModalProps> = ({
  isOpen,
  onClose,
  assignmentId,
  orderId,
  deliveryUserId,
  customerId,
  deliveryUserName
}) => {
  const { loading, submitRating } = useDeliveryRating(assignmentId, customerId);
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [categoryRatings, setCategoryRatings] = useState({
    timeliness: 0,
    communication: 0,
    professionalism: 0,
    care_handling: 0
  });

  const categories = [
    { key: 'timeliness', label: 'Timeliness', description: 'How punctual was the delivery?' },
    { key: 'communication', label: 'Communication', description: 'How well did they communicate?' },
    { key: 'professionalism', label: 'Professionalism', description: 'How professional was their behavior?' },
    { key: 'care_handling', label: 'Care & Handling', description: 'How carefully did they handle your order?' }
  ];

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    const totalCategories = categories.length;
    const completedCategories = Object.values(categoryRatings).filter(r => r > 0).length;
    const overallRatingWeight = rating > 0 ? 1 : 0;
    
    return Math.round(((completedCategories + overallRatingWeight) / (totalCategories + 1)) * 100);
  };

  // Check if minimum requirements are met
  const isMinimumComplete = () => {
    return rating > 0; // Only overall rating is required
  };

  // Get rating quality description
  const getRatingDescription = (ratingValue: number) => {
    if (ratingValue === 0) return 'Not rated';
    if (ratingValue <= 2) return 'Poor';
    if (ratingValue <= 3) return 'Fair';
    if (ratingValue <= 4) return 'Good';
    return 'Excellent';
  };

  // Get completion status
  const getCompletionStatus = () => {
    const percentage = getCompletionPercentage();
    if (percentage === 100) return { label: 'Complete', color: 'bg-green-500' };
    if (percentage >= 20) return { label: 'In Progress', color: 'bg-blue-500' };
    return { label: 'Just Started', color: 'bg-gray-400' };
  };

  const handleSubmit = async () => {
    if (!isMinimumComplete()) {
      toast({
        title: 'Rating required',
        description: 'Please provide an overall rating before submitting.',
        variant: 'destructive'
      });
      return;
    }

    // Check if any category ratings are provided but incomplete
    const providedCategoryRatings = Object.values(categoryRatings).filter(r => r > 0);
    const totalCategories = Object.keys(categoryRatings).length;
    
    if (providedCategoryRatings.length > 0 && providedCategoryRatings.length < totalCategories) {
      // Show warning but allow submission
      toast({
        title: 'Partial category ratings',
        description: 'You can submit with partial category ratings, or complete all for better feedback.',
      });
    }

    const success = await submitRating(
      orderId,
      deliveryUserId,
      rating,
      comment || undefined,
      categoryRatings
    );

    if (success) {
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setRating(0);
    setComment('');
    setCategoryRatings({
      timeliness: 0,
      communication: 0,
      professionalism: 0,
      care_handling: 0
    });
  };

  const StarRating = ({ 
    value, 
    onChange, 
    size = 'h-6 w-6',
    isRequired = false,
    description = ''
  }: { 
    value: number; 
    onChange: (rating: number) => void;
    size?: string;
    isRequired?: boolean;
    description?: string;
  }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onChange(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`${size} transition-all duration-200 ${
                  star <= (hoverRating || value) 
                    ? 'text-yellow-400 scale-110' 
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              >
                <Star className={`${size} ${star <= (hoverRating || value) ? 'fill-current' : ''}`} />
              </button>
            ))}
          </div>
          {isRequired && value === 0 && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          {value > 0 && (
            <Badge variant="outline" className="text-xs">
              {getRatingDescription(hoverRating || value)}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
    );
  };

  const completionStatus = getCompletionStatus();
  const completionPercentage = getCompletionPercentage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="space-y-3">
            <DialogTitle>Rate Your Delivery</DialogTitle>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Progress</span>
                <Badge className={`${completionStatus.color} text-white text-xs`}>
                  {completionStatus.label}
                </Badge>
              </div>
              <Progress value={completionPercentage} className="h-2" />
              <p className="text-xs text-gray-500">
                {completionPercentage}% complete • Overall rating required
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              How was your delivery experience with <span className="font-medium">{deliveryUserName}</span>?
            </p>
          </div>

          {/* Overall rating */}
          <div className="space-y-3 p-4 border rounded-lg bg-yellow-50">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Overall Rating</h3>
              <Badge variant="destructive" className="text-xs">Required</Badge>
            </div>
            <StarRating 
              value={rating} 
              onChange={setRating} 
              size="h-8 w-8" 
              isRequired={true}
              description="Rate your overall experience"
            />
          </div>

          {/* Category ratings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Detailed Ratings</h3>
              <Badge variant="outline" className="text-xs">Optional</Badge>
            </div>
            <p className="text-sm text-gray-600">Help us improve by rating specific aspects:</p>
            
            {categories.map((category) => (
              <div key={category.key} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">{category.label}</span>
                    {categoryRatings[category.key as keyof typeof categoryRatings] > 0 && (
                      <CheckCircle2 className="inline h-4 w-4 text-green-500 ml-2" />
                    )}
                  </div>
                </div>
                <StarRating
                  value={categoryRatings[category.key as keyof typeof categoryRatings]}
                  onChange={(value) =>
                    setCategoryRatings(prev => ({
                      ...prev,
                      [category.key]: value
                    }))
                  }
                  description={category.description}
                />
              </div>
            ))}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              Additional Comments
              <Badge variant="outline" className="text-xs">Optional</Badge>
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your feedback to help us improve our service..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isMinimumComplete() || loading}
              className="flex-1"
            >
              {loading ? 'Submitting...' : `Submit Rating`}
            </Button>
          </div>

          {/* Help text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Your feedback helps improve our delivery service
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
