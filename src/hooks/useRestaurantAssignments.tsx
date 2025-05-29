
import { useState, useEffect } from 'react';
import { assignmentService } from '@/services/assignments/assignmentService';
import type { RestaurantAssignment } from '@/types/notifications';
import { useRestaurantAuth } from './useRestaurantAuth';

export const useRestaurantAssignments = () => {
  const { restaurant } = useRestaurantAuth();
  const [pendingAssignments, setPendingAssignments] = useState<RestaurantAssignment[]>([]);
  const [assignmentHistory, setAssignmentHistory] = useState<RestaurantAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurant?.id) return;

    const loadAssignments = async () => {
      try {
        console.log('Loading assignments for restaurant:', restaurant.id);
        
        const [pending, history] = await Promise.all([
          assignmentService.getPendingAssignments(restaurant.id),
          assignmentService.getAssignmentHistory(restaurant.id)
        ]);
        
        console.log('Loaded assignments:', {
          pendingCount: pending.length,
          historyCount: history.length,
          pending: pending.map(p => ({
            id: p.id,
            order_id: p.order_id,
            status: p.status,
            assigned_at: p.assigned_at
          }))
        });
        
        setPendingAssignments(pending);
        setAssignmentHistory(history);
      } catch (error) {
        console.error('Error loading assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();

    // Subscribe to real-time assignments for both traditional and nutrition-generated orders
    const subscription = assignmentService.subscribeToAssignments(
      restaurant.id,
      (newAssignment) => {
        console.log('Received new assignment:', newAssignment);
        setPendingAssignments(prev => [newAssignment, ...prev]);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [restaurant?.id]);

  const acceptAssignment = async (assignmentId: string, notes?: string) => {
    try {
      console.log('Accepting assignment:', assignmentId);
      await assignmentService.acceptAssignment(assignmentId, notes);
      setPendingAssignments(prev => 
        prev.filter(assignment => assignment.id !== assignmentId)
      );
      // Refresh history to show the accepted assignment
      if (restaurant?.id) {
        const history = await assignmentService.getAssignmentHistory(restaurant.id);
        setAssignmentHistory(history);
      }
    } catch (error) {
      console.error('Error accepting assignment:', error);
      throw error;
    }
  };

  const rejectAssignment = async (assignmentId: string, reason?: string) => {
    try {
      console.log('Rejecting assignment:', assignmentId);
      await assignmentService.rejectAssignment(assignmentId, reason);
      setPendingAssignments(prev => 
        prev.filter(assignment => assignment.id !== assignmentId)
      );
      // Refresh history to show the rejected assignment
      if (restaurant?.id) {
        const history = await assignmentService.getAssignmentHistory(restaurant.id);
        setAssignmentHistory(history);
      }
    } catch (error) {
      console.error('Error rejecting assignment:', error);
      throw error;
    }
  };

  return {
    pendingAssignments,
    assignmentHistory,
    loading,
    acceptAssignment,
    rejectAssignment
  };
};
