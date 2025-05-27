
import { useState } from 'react';
import { deliveryConfirmationService } from '@/services/delivery/deliveryConfirmationService';
import type { DeliveryConfirmation } from '@/types/delivery-features';
import { useToast } from '@/hooks/use-toast';

export const useDeliveryConfirmation = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const uploadPhoto = async (
    file: File,
    assignmentId: string,
    type: 'pickup' | 'delivery'
  ): Promise<string | null> => {
    setLoading(true);
    try {
      const url = await deliveryConfirmationService.uploadConfirmationPhoto(
        file,
        assignmentId,
        type
      );
      
      if (!url) {
        toast({
          title: 'Upload failed',
          description: 'Failed to upload confirmation photo',
          variant: 'destructive'
        });
      }

      return url;
    } finally {
      setLoading(false);
    }
  };

  const createConfirmation = async (
    assignmentId: string,
    type: 'pickup' | 'delivery',
    photoUrls: string[],
    confirmedBy: string,
    notes?: string,
    includeLocation = true
  ): Promise<DeliveryConfirmation | null> => {
    setLoading(true);
    try {
      let latitude, longitude;

      if (includeLocation) {
        const location = await deliveryConfirmationService.getCurrentLocation();
        latitude = location?.latitude;
        longitude = location?.longitude;
      }

      const confirmation = await deliveryConfirmationService.createConfirmation(
        assignmentId,
        type,
        photoUrls,
        confirmedBy,
        latitude,
        longitude,
        notes
      );

      if (confirmation) {
        toast({
          title: 'Confirmation created',
          description: `${type === 'pickup' ? 'Pickup' : 'Delivery'} confirmed successfully`,
        });
      } else {
        toast({
          title: 'Confirmation failed',
          description: 'Failed to create delivery confirmation',
          variant: 'destructive'
        });
      }

      return confirmation;
    } finally {
      setLoading(false);
    }
  };

  const getConfirmations = async (assignmentId: string): Promise<DeliveryConfirmation[]> => {
    return deliveryConfirmationService.getConfirmations(assignmentId);
  };

  return {
    loading,
    uploadPhoto,
    createConfirmation,
    getConfirmations
  };
};
