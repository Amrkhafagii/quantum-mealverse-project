
import { useState, useEffect } from 'react';
import { deliveryRatingService } from '@/services/delivery/deliveryRatingService';
import type { DeliveryRating } from '@/types/delivery-features';
import { useToast } from '@/hooks/use-toast';

export const useDeliveryRating = (assignmentId?: string, customerId?: string) => {
  const [rating, setRating] = useState<DeliveryRating | null>(null);
  const [canRate, setCanRate] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (assignmentId && customerId) {
      checkRatingEligibility();
      loadExistingRating();
    }
  }, [assignmentId, customerId]);

  const checkRatingEligibility = async () => {
    if (!assignmentId || !customerId) return;

    const eligible = await deliveryRatingService.canRateDelivery(assignmentId, customerId);
    setCanRate(eligible);
  };

  const loadExistingRating = async () => {
    if (!assignmentId) return;

    const existingRating = await deliveryRatingService.getRating(assignmentId);
    setRating(existingRating);
  };

  const submitRating = async (
    orderId: string,
    deliveryUserId: string,
    ratingValue: number,
    comment?: string,
    ratingCategories?: Record<string, number>
  ): Promise<boolean> => {
    if (!assignmentId || !customerId) return false;

    setLoading(true);
    try {
      const newRating = await deliveryRatingService.createRating(
        assignmentId,
        orderId,
        customerId,
        deliveryUserId,
        ratingValue,
        comment,
        ratingCategories
      );

      if (newRating) {
        setRating(newRating);
        setCanRate(false);
        toast({
          title: 'Rating submitted',
          description: 'Thank you for your feedback!',
        });
        return true;
      } else {
        toast({
          title: 'Rating failed',
          description: 'Failed to submit rating',
          variant: 'destructive'
        });
        return false;
      }
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryUserRatings = async (deliveryUserId: string): Promise<DeliveryRating[]> => {
    return deliveryRatingService.getDeliveryUserRatings(deliveryUserId);
  };

  return {
    rating,
    canRate,
    loading,
    submitRating,
    getDeliveryUserRatings,
    checkRatingEligibility
  };
};
