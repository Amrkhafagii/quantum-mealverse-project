
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrderAssignmentStatus {
  status: 'pending' | 'awaiting_restaurant' | 'restaurant_accepted' | 'no_restaurant_accepted' | 'no_restaurant_available';
  restaurantName?: string;
  restaurantId?: string;
  assignmentCount: number;
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
}

export const useOrderAssignmentStatus = (orderId: string) => {
  const [assignmentStatus, setAssignmentStatus] = useState<OrderAssignmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchAssignmentStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get order details
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('status, restaurant_id')
          .eq('id', orderId)
          .maybeSingle();

        if (orderError) {
          throw orderError;
        }

        if (!order) {
          throw new Error('Order not found');
        }

        // Get assignment details
        const { data: assignments, error: assignmentsError } = await supabase
          .from('restaurant_assignments')
          .select(`
            status,
            restaurant_id,
            restaurants!restaurant_assignments_restaurant_id_fkey(name)
          `)
          .eq('order_id', orderId);

        if (assignmentsError) {
          throw assignmentsError;
        }

        const assignmentCounts = {
          total: assignments?.length || 0,
          pending: assignments?.filter(a => a.status === 'pending').length || 0,
          accepted: assignments?.filter(a => a.status === 'accepted').length || 0,
          rejected: assignments?.filter(a => a.status === 'rejected').length || 0
        };

        const acceptedAssignment = assignments?.find(a => a.status === 'accepted');

        const status: OrderAssignmentStatus = {
          status: order.status as any,
          restaurantName: acceptedAssignment?.restaurants?.name,
          restaurantId: acceptedAssignment?.restaurant_id,
          assignmentCount: assignmentCounts.total,
          pendingCount: assignmentCounts.pending,
          acceptedCount: assignmentCounts.accepted,
          rejectedCount: assignmentCounts.rejected
        };

        setAssignmentStatus(status);
      } catch (err) {
        console.error('Error fetching assignment status:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch assignment status');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentStatus();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`order-assignments-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'restaurant_assignments',
          filter: `order_id=eq.${orderId}`
        },
        () => {
          fetchAssignmentStatus();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        () => {
          fetchAssignmentStatus();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [orderId]);

  return {
    assignmentStatus,
    loading,
    error,
    isWaitingForRestaurant: assignmentStatus?.status === 'awaiting_restaurant' && assignmentStatus.pendingCount > 0,
    hasAcceptedRestaurant: assignmentStatus?.status === 'restaurant_accepted' && !!assignmentStatus.restaurantName
  };
};
