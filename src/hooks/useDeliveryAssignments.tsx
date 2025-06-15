import { useState, useEffect, useCallback } from 'react';
import { DeliveryAssignment } from '@/types/delivery-assignment';
import { getActiveDeliveryAssignments, getPastDeliveryAssignments } from '@/services/delivery/deliveryAssignmentService';
import { pickupDelivery, startDeliveryToCustomer, completeDelivery, rejectAssignment } from '@/services/delivery/deliveryOrderAssignmentService';
import { updateDeliveryLocation } from '@/services/delivery/deliveryLocationService';
import { toast } from '@/hooks/use-toast';

export const useDeliveryAssignments = (deliveryUserId?: string) => {
  const [activeAssignments, setActiveAssignments] = useState<DeliveryAssignment[]>([]);
  const [pastAssignments, setPastAssignments] = useState<DeliveryAssignment[]>([]);
  const [totalPastAssignments, setTotalPastAssignments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationUpdateInterval, setLocationUpdateInterval] = useState<number | null>(null);
  
  const fetchActiveAssignments = useCallback(async () => {
    if (!deliveryUserId) return;
    
    try {
      setLoading(true);
      setError(null);
      const assignments = await getActiveDeliveryAssignments(deliveryUserId);
      setActiveAssignments(assignments);
    } catch (err) {
      console.error("Error fetching active assignments:", err);
      setError("Failed to load active assignments");
    } finally {
      setLoading(false);
    }
  }, [deliveryUserId]);
  
  const loadPage = useCallback(async (page: number) => {
    if (!deliveryUserId) return;
    
    try {
      setLoading(true);
      setError(null);
      const { assignments, count } = await getPastDeliveryAssignments(deliveryUserId, page);
      setPastAssignments(assignments);
      setTotalPastAssignments(count);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching past assignments:", err);
      setError("Failed to load delivery history");
    } finally {
      setLoading(false);
    }
  }, [deliveryUserId]);
  
  useEffect(() => {
    if (deliveryUserId) {
      fetchActiveAssignments();
      loadPage(1);
    }
  }, [deliveryUserId, fetchActiveAssignments, loadPage]);
  
  const markAsPickedUp = useCallback(async (assignmentId: string) => {
    if (!deliveryUserId) return;
    
    try {
      await pickupDelivery(assignmentId, deliveryUserId);
      toast({
        title: "Order picked up",
        description: "Order marked as picked up from restaurant",
      });
      fetchActiveAssignments();
    } catch (err) {
      console.error("Error marking as picked up:", err);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  }, [deliveryUserId, fetchActiveAssignments]);
  
  const markAsOnTheWay = useCallback(async (assignmentId: string) => {
    if (!deliveryUserId) return;
    
    try {
      await startDeliveryToCustomer(assignmentId, deliveryUserId);
      toast({
        title: "On the way",
        description: "Order marked as on the way to customer",
      });
      fetchActiveAssignments();
      
      // Set up periodic location updates
      if (locationUpdateInterval) {
        clearInterval(locationUpdateInterval);
      }
      
      // We'll rely on the useLocationTracker hook for this now
    } catch (err) {
      console.error("Error marking as on the way:", err);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  }, [deliveryUserId, fetchActiveAssignments, locationUpdateInterval]);
  
  const markAsDelivered = useCallback(async (assignmentId: string) => {
    if (!deliveryUserId) return;
    
    try {
      await completeDelivery(assignmentId, deliveryUserId);
      toast({
        title: "Delivered",
        description: "Order marked as delivered to customer",
      });
      fetchActiveAssignments();
      loadPage(1); // Refresh history
      
      // Clear any location update interval
      if (locationUpdateInterval) {
        clearInterval(locationUpdateInterval);
        setLocationUpdateInterval(null);
      }
    } catch (err) {
      console.error("Error marking as delivered:", err);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  }, [deliveryUserId, fetchActiveAssignments, loadPage, locationUpdateInterval]);
  
  const updateLocation = useCallback(async (assignmentId: string, latitude: number, longitude: number) => {
    if (!deliveryUserId) return;
    
    try {
      await updateDeliveryLocation(assignmentId, latitude, longitude);
      // Silent success - we don't want to show toasts for every location update
    } catch (err) {
      console.error("Error updating location:", err);
      // Silent fail for location updates to avoid too many toasts
    }
  }, [deliveryUserId]);
  
  const refreshData = useCallback(() => {
    fetchActiveAssignments();
    loadPage(currentPage);
  }, [fetchActiveAssignments, loadPage, currentPage]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (locationUpdateInterval) {
        clearInterval(locationUpdateInterval);
      }
    };
  }, [locationUpdateInterval]);
  
  return {
    activeAssignments,
    pastAssignments,
    totalPastAssignments,
    currentPage,
    loading,
    error,
    markAsPickedUp,
    markAsOnTheWay,
    markAsDelivered,
    updateLocation,
    refreshData,
    loadPage
  };
};
