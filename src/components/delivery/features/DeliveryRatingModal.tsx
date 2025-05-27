
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDeliveryRating } from '@/hooks/delivery/useDeliveryRating';
import { Star } from 'lucide-react';

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
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [categoryRatings, setCategoryRatings] = useState({
    timeliness: 0,
    communication: 0,
    professionalism: 0,
    care_handling: 0
  });

  const handleSubmit = async () => {
    if (rating === 0) return;

    const success = await submitRating(
      orderId,
      deliveryUserId,
      rating,
      comment || undefined,
      categoryRatings
    );

    if (success) {
      onClose();
      setRating(0);
      setComment('');
      setCategoryRatings({
        timeliness: 0,
        communication: 0,
        professionalism: 0,
        care_handling: 0
      });
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    size = 'h-6 w-6' 
  }: { 
    value: number; 
    onChange: (rating: number) => void;
    size?: string;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`${size} ${
            star <= value ? 'text-yellow-400' : 'text-gray-400'
          } hover:text-yellow-400 transition-colors`}
        >
          <Star className={`${size} fill-current`} />
        </button>
      ))}
    </div>
  );

  const categories = [
    { key: 'timeliness', label: 'Timeliness' },
    { key: 'communication', label: 'Communication' },
    { key: 'professionalism', label: 'Professionalism' },
    { key: 'care_handling', label: 'Care & Handling' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Delivery</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">
              How was your delivery experience with {deliveryUserName}?
            </p>
          </div>

          {/* Overall rating */}
          <div className="text-center space-y-2">
            <p className="font-medium">Overall Rating</p>
            <StarRating value={rating} onChange={setRating} size="h-8 w-8" />
          </div>

          {/* Category ratings */}
          <div className="space-y-3">
            <p className="font-medium text-sm">Rate specific aspects:</p>
            {categories.map((category) => (
              <div key={category.key} className="flex items-center justify-between">
                <span className="text-sm">{category.label}</span>
                <StarRating
                  value={categoryRatings[category.key as keyof typeof categoryRatings]}
                  onChange={(value) =>
                    setCategoryRatings(prev => ({
                      ...prev,
                      [category.key]: value
                    }))
                  }
                />
              </div>
            ))}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Comments (optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your feedback..."
              rows={3}
            />
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
              disabled={rating === 0 || loading}
              className="flex-1"
            >
              Submit Rating
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
