
import { useState, useEffect, useCallback } from 'react';
import { restaurantDeliveryHandoffService } from '@/services/delivery/restaurantDeliveryHandoffService';
import { DeliveryDriverAvailability } from '@/types/delivery-handoff';
import { toast } from '@/hooks/use-toast';

export function useDriverAvailability(deliveryUserId?: string) {
  const [availability, setAvailability] = useState<DeliveryDriverAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load driver availability
  const loadAvailability = useCallback(async () => {
    if (!deliveryUserId) return;

    try {
      setLoading(true);
      // GET -- should use proper delivery_user_id column
      const data = await restaurantDeliveryHandoffService.getDriverAvailability(deliveryUserId);
      setAvailability(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load availability';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [deliveryUserId]);

  // Update availability
  const updateAvailability = useCallback(async (
    updates: Partial<DeliveryDriverAvailability>
  ): Promise<boolean> => {
    if (!deliveryUserId) return false;

    try {
      setLoading(true);
      const success = await restaurantDeliveryHandoffService.updateDriverAvailability(
        deliveryUserId,
        updates
      );

      if (success) {
        await loadAvailability();
        toast({
          title: 'Availability Updated',
          description: 'Your availability status has been updated'
        });
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update availability';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [deliveryUserId, loadAvailability]);

  // Update location
  const updateLocation = useCallback(async (
    latitude: number,
    longitude: number
  ): Promise<boolean> => {
    return updateAvailability({
      current_latitude: latitude,
      current_longitude: longitude
    });
  }, [updateAvailability]);

  // Toggle availability
  const toggleAvailability = useCallback(async (): Promise<boolean> => {
    if (!availability) return false;
    
    return updateAvailability({
      is_available: !availability.is_available
    });
  }, [availability, updateAvailability]);

  // Load initial data
  useEffect(() => {
    if (deliveryUserId) {
      loadAvailability();
    }
  }, [deliveryUserId, loadAvailability]);

  return {
    availability,
    loading,
    error,
    updateAvailability,
    updateLocation,
    toggleAvailability,
    refreshAvailability: loadAvailability
  };
}
