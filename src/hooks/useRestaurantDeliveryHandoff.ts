
import { useState, useEffect, useCallback } from 'react';
import { restaurantDeliveryHandoffService } from '@/services/delivery/restaurantDeliveryHandoffService';
import {
  DeliveryAssignmentCriteria,
  AvailableDriver,
  AssignmentResult
} from '@/types/delivery-handoff';
import { toast } from '@/hooks/use-toast';

export function useRestaurantDeliveryHandoff(restaurantId?: string) {
  const [criteria, setCriteria] = useState<DeliveryAssignmentCriteria | null>(null);
  const [availableDrivers, setAvailableDrivers] = useState<AvailableDriver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load assignment criteria
  const loadCriteria = useCallback(async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      const criteriaData = await restaurantDeliveryHandoffService.getAssignmentCriteria(restaurantId);
      setCriteria(criteriaData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load criteria';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  // Load available drivers
  const loadAvailableDrivers = useCallback(async (
    restaurantLat: number,
    restaurantLng: number,
    maxDistance?: number
  ) => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      const drivers = await restaurantDeliveryHandoffService.getAvailableDrivers(
        restaurantId,
        restaurantLat,
        restaurantLng,
        maxDistance || criteria?.max_distance_km || 15.0
      );
      setAvailableDrivers(drivers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load drivers';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [restaurantId, criteria?.max_distance_km]);

  // Update criteria
  const updateCriteria = useCallback(async (
    newCriteria: Partial<DeliveryAssignmentCriteria>
  ): Promise<boolean> => {
    if (!restaurantId) return false;

    try {
      setLoading(true);
      const success = await restaurantDeliveryHandoffService.updateAssignmentCriteria(
        restaurantId,
        newCriteria
      );

      if (success) {
        toast({
          title: 'Success',
          description: 'Assignment criteria updated successfully'
        });
        await loadCriteria();
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update criteria';
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
  }, [restaurantId, loadCriteria]);

  // Manually assign delivery
  const assignDelivery = useCallback(async (
    orderId: string,
    deliveryUserId: string,
    assignmentTimeMinutes?: number
  ): Promise<AssignmentResult> => {
    if (!restaurantId) {
      return { success: false, reason: 'Restaurant ID not available' };
    }

    try {
      setLoading(true);
      const result = await restaurantDeliveryHandoffService.manuallyAssignDelivery(
        orderId,
        restaurantId,
        deliveryUserId,
        assignmentTimeMinutes || criteria?.max_assignment_time_minutes || 30
      );

      if (result.success) {
        toast({
          title: 'Assignment Successful',
          description: `Delivery assigned to ${result.driver_name}`
        });
      } else {
        toast({
          title: 'Assignment Failed',
          description: result.reason || 'Failed to assign delivery',
          variant: 'destructive'
        });
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign delivery';
      setError(errorMessage);
      return { success: false, reason: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [restaurantId, criteria?.max_assignment_time_minutes]);

  // Process expired assignments
  const processExpiredAssignments = useCallback(async (): Promise<number> => {
    try {
      const count = await restaurantDeliveryHandoffService.processExpiredAssignments();
      if (count > 0) {
        toast({
          title: 'Assignments Processed',
          description: `${count} expired assignments were reassigned`
        });
      }
      return count;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process expired assignments';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return 0;
    }
  }, []);

  // Load initial data
  useEffect(() => {
    if (restaurantId) {
      loadCriteria();
    }
  }, [restaurantId, loadCriteria]);

  return {
    criteria,
    availableDrivers,
    loading,
    error,
    loadAvailableDrivers,
    updateCriteria,
    assignDelivery,
    processExpiredAssignments,
    refreshCriteria: loadCriteria
  };
}
