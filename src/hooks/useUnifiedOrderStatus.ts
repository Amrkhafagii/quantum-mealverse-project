
import { useState, useEffect } from 'react';
import { unifiedOrderStatusService } from '@/services/orders/unifiedOrderStatusService';
import { useConnectionStatus } from './useConnectionStatus';
import { supabase } from '@/integrations/supabase/client';

export const useUnifiedOrderStatus = (orderId: string) => {
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline } = useConnectionStatus();

  // Load order status data
  useEffect(() => {
    if (!orderId) return;

    const loadOrderStatus = async () => {
      try {
        setLoading(true);
        const data = await unifiedOrderStatusService.getOrderStatusWithTracking(orderId);
        
        if (data) {
          setOrderData(data);
          setError(null);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error loading order status:', err);
        setError('Failed to load order status');
      } finally {
        setLoading(false);
      }
    };

    loadOrderStatus();
  }, [orderId]);

  // Real-time status updates for both order types
  useEffect(() => {
    if (!orderId || !isOnline) return;

    const channel = supabase
      .channel(`unified_order_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          console.log('Real-time order update:', payload);
          setOrderData((prev: any) => ({
            ...prev,
            ...payload.new,
            isUnifiedTracking: true
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_history',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          console.log('New order history entry:', payload);
          setOrderData((prev: any) => ({
            ...prev,
            statusHistory: [...(prev?.statusHistory || []), payload.new]
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, isOnline]);

  const updateStatus = async (
    newStatus: string,
    restaurantId?: string,
    metadata?: Record<string, any>
  ) => {
    if (!orderData) return false;

    const success = await unifiedOrderStatusService.updateOrderStatus({
      orderId,
      newStatus: newStatus as any,
      restaurantId,
      assignmentSource: orderData.assignment_source,
      metadata,
      changedByType: 'customer'
    });

    if (success) {
      // Refresh data
      const updatedData = await unifiedOrderStatusService.getOrderStatusWithTracking(orderId);
      if (updatedData) {
        setOrderData(updatedData);
      }
    }

    return success;
  };

  return {
    orderData,
    loading,
    error,
    updateStatus,
    refresh: async () => {
      const data = await unifiedOrderStatusService.getOrderStatusWithTracking(orderId);
      if (data) setOrderData(data);
    }
  };
};
