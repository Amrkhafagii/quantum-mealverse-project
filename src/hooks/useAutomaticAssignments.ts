
import { useState, useEffect, useCallback } from 'react';
import { automaticAssignmentService } from '@/services/delivery/automaticAssignmentService';
import type { DeliveryAssignment } from '@/types/delivery-assignment';
import { toast } from '@/hooks/use-toast';

export function useAutomaticAssignments(deliveryUserId?: string) {
  const [pendingAssignments, setPendingAssignments] = useState<DeliveryAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load pending assignments
  const loadPendingAssignments = useCallback(async () => {
    if (!deliveryUserId) return;

    try {
      setLoading(true);
      const assignments = await automaticAssignmentService.getPendingAssignments(deliveryUserId);
      setPendingAssignments(assignments);
    } catch (error) {
      console.error('Error loading pending assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending assignments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [deliveryUserId]);

  // Accept assignment
  const acceptAssignment = useCallback(async (assignmentId: string) => {
    try {
      setIsProcessing(true);
      await automaticAssignmentService.acceptAssignment(assignmentId);
      
      // Remove from pending assignments
      setPendingAssignments(prev => 
        prev.filter(assignment => assignment.id !== assignmentId)
      );

      toast({
        title: 'Assignment Accepted',
        description: 'You have successfully accepted the delivery assignment'
      });

      return true;
    } catch (error) {
      console.error('Error accepting assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept assignment',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Reject assignment
  const rejectAssignment = useCallback(async (assignmentId: string, reason?: string) => {
    try {
      setIsProcessing(true);
      await automaticAssignmentService.rejectAssignment(assignmentId, reason);
      
      // Remove from pending assignments
      setPendingAssignments(prev => 
        prev.filter(assignment => assignment.id !== assignmentId)
      );

      toast({
        title: 'Assignment Rejected',
        description: 'The assignment has been rejected and will be reassigned'
      });

      return true;
    } catch (error) {
      console.error('Error rejecting assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject assignment',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    if (!deliveryUserId) return;

    const unsubscribe = automaticAssignmentService.subscribeToAssignments(
      deliveryUserId,
      (newAssignment) => {
        // Add new assignment to pending list
        setPendingAssignments(prev => [newAssignment as DeliveryAssignment, ...prev]);
        
        // Show notification
        toast({
          title: 'New Delivery Assignment',
          description: 'You have received a new delivery assignment',
        });
      }
    );

    return unsubscribe;
  }, [deliveryUserId]);

  // Load initial data
  useEffect(() => {
    loadPendingAssignments();
  }, [loadPendingAssignments]);

  return {
    pendingAssignments,
    loading,
    isProcessing,
    acceptAssignment,
    rejectAssignment,
    loadPendingAssignments
  };
}
