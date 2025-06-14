import { useState, useEffect, useCallback } from 'react';
import { orderAssignmentService } from '@/services/orders/orderAssignmentService';
import { orderNotificationService } from '@/services/notifications/orderNotificationService';
import { useToast } from '@/components/ui/use-toast';

export const useOrderIntegration = (restaurantId?: string, userId?: string) => {
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadPendingAssignments = useCallback(async () => {
    if (!restaurantId) return;

    try {
      const assignments = await orderAssignmentService.getRestaurantPendingAssignments(restaurantId);
      setPendingAssignments(assignments);
    } catch (error) {
      console.error('Error loading pending assignments:', error);
    }
  }, [restaurantId]);

  const loadNotifications = useCallback(async () => {
    if (!userId && !restaurantId) return;

    try {
      let notifications;
      if (restaurantId) {
        notifications = await orderNotificationService.getRestaurantNotifications(restaurantId);
      } else if (userId) {
        notifications = await orderNotificationService.getUserNotifications(userId);
      }
      setNotifications(notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [userId, restaurantId]);

  const handleAssignmentResponse = async (
    assignmentId: string,
    action: 'accept' | 'reject',
    notes?: string
  ) => {
    if (!restaurantId) return false;

    try {
      const success = await orderAssignmentService.handleRestaurantResponse(
        assignmentId,
        restaurantId,
        action,
        notes
      );

      if (success) {
        await loadPendingAssignments();
        toast({
          title: action === 'accept' ? 'Order Accepted' : 'Order Declined',
          description: `Assignment has been ${action}ed successfully`,
        });
      }

      return success;
    } catch (error) {
      console.error('Error handling assignment response:', error);
      return false;
    }
  };

  const assignOrderToRestaurants = async (orderId: string, restaurantIds: string[]) => {
    try {
      const success = await orderAssignmentService.assignOrderToRestaurants(orderId, restaurantIds);
      
      if (success) {
        toast({
          title: 'Order Assigned',
          description: 'Order has been assigned to restaurants',
        });
      } else {
        toast({
          title: 'Assignment Failed',
          description: 'Failed to assign order to restaurants',
          variant: 'destructive'
        });
      }

      return success;
    } catch (error) {
      console.error('Error assigning order:', error);
      return false;
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const success = await orderNotificationService.markAsRead(notificationId);
      if (success) {
        await loadNotifications();
      }
      return success;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadPendingAssignments(),
        loadNotifications()
      ]);
      setLoading(false);
    };

    loadData();
  }, [loadPendingAssignments, loadNotifications]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (restaurantId) {
      unsubscribe = orderNotificationService.subscribeToRestaurantNotifications(
        restaurantId,
        (notification) => {
          setNotifications(prev => [notification, ...prev]);
          toast({
            title: notification.title,
            description: notification.message,
          });
        },
        () => {
          loadPendingAssignments();
        }
      );
    } else if (userId) {
      // Use userId (should correspond to the {table}_user_id column in order_notificationService internally)
      unsubscribe = orderNotificationService.subscribeToUserNotifications(
        userId,
        (notification) => {
          setNotifications(prev => [notification, ...prev]);
          toast({
            title: notification.title,
            description: notification.message,
          });
        }
      );
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [restaurantId, userId, loadPendingAssignments, toast]);

  return {
    pendingAssignments,
    notifications,
    loading,
    handleAssignmentResponse,
    assignOrderToRestaurants,
    markNotificationAsRead,
    refreshData: () => {
      loadPendingAssignments();
      loadNotifications();
    }
  };
};
