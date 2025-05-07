
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fixOrderStatus } from '@/utils/orderStatusFix';
import { toast } from './use-toast';
import { useSupabaseChannel } from './useSupabaseChannel';
import { useConnectionStatus } from './useConnectionStatus';

/**
 * Hook to keep delivery status and order status in sync
 * @param orderId The order ID to monitor
 */
export function useDeliveryStatusSync(orderId: string) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const { isOnline } = useConnectionStatus();

  // Use the optimized Supabase channel hook
  useSupabaseChannel({
    channelName: `delivery_sync_${orderId}`,
    event: 'UPDATE',
    table: 'delivery_assignments',
    schema: 'public',
    filter: `order_id=eq.${orderId}`,
    enabled: !!orderId && isOnline,
    onMessage: async (payload) => {
      console.log('Delivery assignment updated:', payload);
      
      // Get the latest delivery status
      const newDeliveryStatus = payload.new.status;
      setDeliveryStatus(newDeliveryStatus);
      
      // Fetch current order status
      const { data: order } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();
      
      if (order) {
        setOrderStatus(order.status);
        
        // Check if the statuses are out of sync
        const statusMap: Record<string, string> = {
          'picked_up': 'picked_up',
          'on_the_way': 'on_the_way',
          'delivered': 'delivered'
        };
        
        if (statusMap[newDeliveryStatus] && order.status !== statusMap[newDeliveryStatus]) {
          setIsSyncing(true);
          try {
            await fixOrderStatus(orderId);
            setLastSyncedAt(new Date());
            toast({
              title: "Status synchronized",
              description: `Order status updated to match delivery status: ${statusMap[newDeliveryStatus]}`,
              variant: "default"
            });
          } catch (error) {
            console.error('Error syncing status:', error);
            toast({
              title: "Failed to sync status",
              description: "There was a problem synchronizing the order status",
              variant: "destructive"
            });
          } finally {
            setIsSyncing(false);
          }
        }
      }
    },
  });

  // Attempt to sync the status on mount
  useEffect(() => {
    if (!orderId || !isOnline) return;

    const initialSync = async () => {
      setIsSyncing(true);
      try {
        await fixOrderStatus(orderId);
        setLastSyncedAt(new Date());
      } catch (error) {
        console.error('Initial sync error:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    initialSync();
  }, [orderId, isOnline]);

  return {
    isSyncing,
    lastSyncedAt,
    deliveryStatus,
    orderStatus,
    sync: async () => {
      if (!isOnline) {
        toast({
          title: "You're offline",
          description: "Can't synchronize status while offline",
          variant: "destructive"
        });
        return false;
      }
      
      setIsSyncing(true);
      try {
        await fixOrderStatus(orderId);
        setLastSyncedAt(new Date());
        return true;
      } catch (error) {
        console.error('Manual sync error:', error);
        return false;
      } finally {
        setIsSyncing(false);
      }
    }
  };
}
