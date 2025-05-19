
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { getActiveOrders } from '@/utils/offlineStorage';

export const useOrdersData = (userId?: string) => {
  const { isOnline } = useConnectionStatus();
  
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['active-orders', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      if (!isOnline) {
        // When offline, use cached orders
        try {
          const cachedOrders = await getActiveOrders();
          return cachedOrders.filter(order => 
            !['delivered', 'cancelled', 'rejected'].includes(order.status)
          );
        } catch (error) {
          console.error("Error filtering cached orders:", error);
          return [];
        }
      }
      
      try {
        // Fix the "not.in" syntax issue by using "not" with individual "eq" filters
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', userId)
          .not('status', 'eq', 'delivered')
          .not('status', 'eq', 'cancelled')
          .not('status', 'eq', 'rejected')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching active orders:', error);
          throw error;
        }
        
        // Store active orders for offline access
        if (data && data.length > 0) {
          data.forEach(order => {
            import('@/utils/offlineStorage').then(({ storeActiveOrder }) => {
              storeActiveOrder(order);
            });
          });
        }
        
        return data || [];
      } catch (error) {
        console.error('Error in active orders query:', error);
        
        // If online fetch failed, try to use cached data
        try {
          const cachedOrders = await getActiveOrders();
          return cachedOrders.filter(order => 
            !['delivered', 'cancelled', 'rejected'].includes(order.status)
          );
        } catch (cacheError) {
          console.error("Error retrieving from cache:", cacheError);
          return [];
        }
      }
    },
    enabled: !!userId,
    refetchInterval: isOnline ? 10000 : false, // Only refresh every 10 seconds when online
    staleTime: 5000, // Prevent unnecessary refetches
  });
  
  const { data: pastOrders } = useQuery({
    queryKey: ['past-orders', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      if (!isOnline) {
        // When offline, use cached orders for past orders
        try {
          const cachedOrders = await getActiveOrders();
          return cachedOrders.filter(order => 
            ['delivered', 'cancelled', 'rejected'].includes(order.status)
          ).slice(0, 5);
        } catch (error) {
          console.error("Error filtering past orders from cache:", error);
          return [];
        }
      }
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .in('status', ['delivered', 'cancelled', 'rejected'])
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        // Store past orders for offline access too
        if (data && data.length > 0) {
          data.forEach(order => {
            import('@/utils/offlineStorage').then(({ storeActiveOrder }) => {
              storeActiveOrder(order);
            });
          });
        }
        
        return data || [];
      } catch (error) {
        console.error('Error fetching past orders:', error);
        
        // If online fetch failed, use cached data
        try {
          const cachedOrders = await getActiveOrders();
          return cachedOrders.filter(order => 
            ['delivered', 'cancelled', 'rejected'].includes(order.status)
          ).slice(0, 5);
        } catch (cacheError) {
          console.error("Error retrieving past orders from cache:", cacheError);
          return [];
        }
      }
    },
    enabled: !!userId,
    staleTime: 30000, // Past orders don't change as frequently
  });
  
  return { orders, pastOrders, isLoading, isOnline, refetch };
};
