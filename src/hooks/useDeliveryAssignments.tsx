
import { useState, useEffect } from 'react';
import { DeliveryAssignment } from '@/types/delivery';
import { 
  getActiveDeliveryAssignments, 
  getPastDeliveryAssignments 
} from '@/services/delivery/deliveryAssignmentService';
import { 
  acceptDeliveryAssignment,
  rejectDeliveryAssignment,
  pickupDelivery,
  startDeliveryToCustomer,
  completeDelivery
} from '@/services/delivery/deliveryOrderAssignmentService';
import { useToast } from '@/hooks/use-toast';

export const useDeliveryAssignments = (deliveryUserId: string | undefined) => {
  const [activeAssignments, setActiveAssignments] = useState<DeliveryAssignment[]>([]);
  const [pastAssignments, setPastAssignments] = useState<DeliveryAssignment[]>([]);
  const [totalPastAssignments, setTotalPastAssignments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  const fetchActiveAssignments = async () => {
    if (!deliveryUserId) return;
    
    try {
      setLoading(true);
      const assignments = await getActiveDeliveryAssignments(deliveryUserId);
      setActiveAssignments(assignments);
      setError(null);
    } catch (err) {
      console.error('Error fetching active assignments:', err);
      setError(err as Error);
      toast({
        title: "Error",
        description: "Failed to load active deliveries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPastAssignments = async (page: number = 1) => {
    if (!deliveryUserId) return;
    
    try {
      setLoading(true);
      const { assignments, count } = await getPastDeliveryAssignments(deliveryUserId, page);
      setPastAssignments(assignments);
      setTotalPastAssignments(count);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      console.error('Error fetching past assignments:', err);
      setError(err as Error);
      toast({
        title: "Error",
        description: "Failed to load delivery history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (deliveryUserId) {
      fetchActiveAssignments();
      fetchPastAssignments();
    }
  }, [deliveryUserId]);
  
  const acceptAssignment = async (assignmentId: string) => {
    if (!deliveryUserId) return;
    
    try {
      const assignment = await acceptDeliveryAssignment(assignmentId, deliveryUserId);
      toast({
        title: "Delivery Accepted",
        description: "You've successfully accepted the delivery",
      });
      fetchActiveAssignments();
      return assignment;
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to accept delivery",
        variant: "destructive"
      });
      throw err;
    }
  };
  
  const rejectAssignment = async (assignmentId: string, reason?: string) => {
    try {
      await rejectDeliveryAssignment(assignmentId, reason);
      toast({
        title: "Delivery Rejected",
        description: "You've declined this delivery",
      });
      return true;
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to reject delivery",
        variant: "destructive"
      });
      throw err;
    }
  };
  
  const markAsPickedUp = async (assignmentId: string) => {
    try {
      await pickupDelivery(assignmentId);
      toast({
        title: "Order Picked Up",
        description: "You've picked up the order from the restaurant",
      });
      fetchActiveAssignments();
      return true;
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update pickup status",
        variant: "destructive"
      });
      throw err;
    }
  };
  
  const markAsOnTheWay = async (assignmentId: string) => {
    try {
      await startDeliveryToCustomer(assignmentId);
      toast({
        title: "On The Way",
        description: "You're now on the way to the customer",
      });
      fetchActiveAssignments();
      return true;
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update delivery status",
        variant: "destructive"
      });
      throw err;
    }
  };
  
  const markAsDelivered = async (assignmentId: string) => {
    if (!deliveryUserId) return;
    
    try {
      await completeDelivery(assignmentId, deliveryUserId);
      toast({
        title: "Delivery Complete",
        description: "Great job! You've completed this delivery",
      });
      fetchActiveAssignments();
      fetchPastAssignments();
      return true;
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to complete delivery",
        variant: "destructive"
      });
      throw err;
    }
  };
  
  const refreshData = () => {
    fetchActiveAssignments();
    fetchPastAssignments(currentPage);
  };
  
  return {
    activeAssignments,
    pastAssignments,
    totalPastAssignments,
    currentPage,
    loading,
    error,
    acceptAssignment,
    rejectAssignment,
    markAsPickedUp,
    markAsOnTheWay,
    markAsDelivered,
    refreshData,
    loadPage: fetchPastAssignments
  };
};
