
import { useState, useEffect } from 'react';
import { unifiedOrderStatusService } from '@/services/orders/unifiedOrderStatusService';
import { useConnectionStatus } from './useConnectionStatus';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LoadingState {
  initial: boolean;
  updating: boolean;
  refreshing: boolean;
}

interface ErrorState {
  type: 'network' | 'permission' | 'validation' | 'server' | 'unknown';
  message: string;
  recoverable: boolean;
  timestamp: Date;
}

export const useUnifiedOrderStatus = (orderId: string) => {
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState<LoadingState>({
    initial: true,
    updating: false,
    refreshing: false
  });
  const [error, setError] = useState<ErrorState | null>(null);
  const { isOnline } = useConnectionStatus();

  // Enhanced error handling with categorization
  const handleError = (err: any, context: string): ErrorState => {
    console.error(`❌ Error in ${context}:`, err);
    
    let errorState: ErrorState;

    if (!isOnline) {
      errorState = {
        type: 'network',
        message: 'You are offline. Please check your connection.',
        recoverable: true,
        timestamp: new Date()
      };
    } else if (err?.code === '42501' || err?.message?.includes('permission')) {
      errorState = {
        type: 'permission',
        message: 'You do not have permission to access this order.',
        recoverable: false,
        timestamp: new Date()
      };
    } else if (err?.code === '23514' || err?.message?.includes('validation')) {
      errorState = {
        type: 'validation',
        message: 'Invalid data provided for order update.',
        recoverable: true,
        timestamp: new Date()
      };
    } else if (err?.code?.startsWith('5') || err?.status >= 500) {
      errorState = {
        type: 'server',
        message: 'Server error occurred. Please try again later.',
        recoverable: true,
        timestamp: new Date()
      };
    } else {
      errorState = {
        type: 'unknown',
        message: err?.message || 'An unexpected error occurred.',
        recoverable: true,
        timestamp: new Date()
      };
    }

    return errorState;
  };

  // Load order status data with enhanced error handling
  const loadOrderStatus = async (isRefresh = false) => {
    if (!orderId) return;

    try {
      setLoading(prev => ({ 
        ...prev, 
        initial: !isRefresh && !orderData,
        refreshing: isRefresh 
      }));
      
      setError(null);

      console.log(`🔄 ${isRefresh ? 'Refreshing' : 'Loading'} order status for:`, orderId);

      const data = await unifiedOrderStatusService.getOrderStatusWithTracking(orderId);
        
      if (data) {
        setOrderData(data);
        console.log('✅ Order data loaded successfully');
      } else {
        const errorState = handleError({ message: 'Order not found' }, 'loadOrderStatus');
        setError(errorState);
        
        toast({
          title: "Order Not Found",
          description: "The requested order could not be found.",
          variant: "destructive"
        });
      }
    } catch (err) {
      const errorState = handleError(err, 'loadOrderStatus');
      setError(errorState);
      
      toast({
        title: `Failed to ${isRefresh ? 'refresh' : 'load'} order`,
        description: errorState.message,
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ 
        ...prev, 
        initial: false,
        refreshing: false 
      }));
    }
  };

  // Enhanced order status update with granular loading states
  const updateStatus = async (
    newStatus: string,
    restaurantId?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> => {
    if (!orderData) {
      console.error('❌ Cannot update status: No order data available');
      return false;
    }

    try {
      setLoading(prev => ({ ...prev, updating: true }));
      setError(null);

      console.log('🔄 Updating order status:', {
        orderId,
        newStatus,
        restaurantId,
        currentStatus: orderData.status
      });

      const success = await unifiedOrderStatusService.updateOrderStatus({
        orderId,
        newStatus: newStatus as any,
        restaurantId,
        assignmentSource: orderData.assignment_source,
        metadata,
        changedByType: 'customer'
      });

      if (success) {
        console.log('✅ Order status updated successfully');
        
        // Refresh data to get latest state
        await loadOrderStatus(true);
        
        toast({
          title: "Order Updated",
          description: `Order status changed to ${newStatus.replace('_', ' ')}`,
        });
        
        return true;
      } else {
        const errorState = handleError(
          { message: 'Failed to update order status' }, 
          'updateStatus'
        );
        setError(errorState);
        
        toast({
          title: "Update Failed",
          description: "Could not update order status. Please try again.",
          variant: "destructive"
        });
        
        return false;
      }
    } catch (err) {
      const errorState = handleError(err, 'updateStatus');
      setError(errorState);
      
      toast({
        title: "Update Error",
        description: errorState.message,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  // Retry function for recoverable errors
  const retry = async () => {
    if (!error?.recoverable) {
      console.warn('⚠️ Cannot retry: Error is not recoverable');
      return;
    }

    console.log('🔄 Retrying after error:', error.type);
    await loadOrderStatus(true);
  };

  // Initial load
  useEffect(() => {
    loadOrderStatus();
  }, [orderId]);

  // Real-time status updates with enhanced error handling
  useEffect(() => {
    if (!orderId || !isOnline) return;

    console.log('🔌 Setting up real-time subscriptions for order:', orderId);

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
          console.log('📡 Real-time order update received:', payload);
          
          setOrderData((prev: any) => {
            if (!prev) return null;
            
            return {
              ...prev,
              ...payload.new,
              isUnifiedTracking: true
            };
          });
          
          // Show user-friendly notification for important status changes
          const newStatus = payload.new.status;
          const statusMessages: Record<string, string> = {
            'restaurant_accepted': 'Your order has been accepted by the restaurant!',
            'preparing': 'Your order is now being prepared',
            'ready_for_pickup': 'Your order is ready for pickup',
            'on_the_way': 'Your order is on the way!',
            'delivered': 'Your order has been delivered'
          };
          
          if (statusMessages[newStatus]) {
            toast({
              title: "Order Update",
              description: statusMessages[newStatus],
            });
          }
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
          console.log('📡 New order history entry:', payload);
          
          setOrderData((prev: any) => {
            if (!prev) return null;
            
            return {
              ...prev,
              statusHistory: [...(prev?.statusHistory || []), payload.new]
            };
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscriptions active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription error');
          
          const errorState = handleError(
            { message: 'Real-time updates unavailable' },
            'real-time subscription'
          );
          setError(errorState);
        }
      });

    return () => {
      console.log('🔌 Cleaning up real-time subscriptions');
      supabase.removeChannel(channel);
    };
  }, [orderId, isOnline]);

  return {
    orderData,
    loading,
    error,
    updateStatus,
    retry,
    refresh: () => loadOrderStatus(true),
    // Additional helper properties
    isLoading: loading.initial,
    isUpdating: loading.updating,
    isRefreshing: loading.refreshing,
    hasError: !!error,
    canRetry: error?.recoverable || false
  };
};
