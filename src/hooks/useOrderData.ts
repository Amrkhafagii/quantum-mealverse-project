import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { storeActiveOrder, getActiveOrder } from '@/utils/offlineStorage';
import { toast } from '@/components/ui/use-toast';
import { unifiedOrderStatusService } from '@/services/orders/unifiedOrderStatusService';

export const useOrderData = (orderId: string) => {
  const { isOnline } = useConnectionStatus();

  return useQuery({
    queryKey: ['order-details', orderId],
    queryFn: async () => {
      try {
        // If offline, try to get from cache first
        if (!isOnline) {
          const cachedData = getActiveOrder(orderId);
          if (cachedData) {
            return cachedData;
          }
          throw new Error('You are offline and this order is not cached');
        }

        // Use unified order status service for consistent data
        const unifiedData = await unifiedOrderStatusService.getOrderStatusWithTracking(orderId);
        if (unifiedData) {
          // Transform to match Order interface - provide default values for missing properties
          const formattedData: Order = {
            id: unifiedData.id,
            customer_id: unifiedData.customer_id || '',
            customer_name: unifiedData.customer_name,
            customer_email: unifiedData.customer_email || '',
            customer_phone: unifiedData.customer_phone || '',
            delivery_address: unifiedData.delivery_address,
            city: unifiedData.city || '',
            notes: unifiedData.notes,
            delivery_method: unifiedData.delivery_method || 'delivery',
            payment_method: unifiedData.payment_method || 'cash',
            delivery_fee: unifiedData.delivery_fee || 0,
            subtotal: unifiedData.subtotal || 0,
            total: unifiedData.total,
            status: unifiedData.status,
            latitude: unifiedData.latitude,
            longitude: unifiedData.longitude,
            formatted_order_id: unifiedData.formatted_order_id,
            created_at: unifiedData.created_at,
            updated_at: unifiedData.updated_at,
            restaurant_id: unifiedData.restaurant_id,
            assignment_source: unifiedData.assignment_source,
            restaurant: unifiedData.restaurant ? {
              id: unifiedData.restaurant.id,
              name: unifiedData.restaurant.name,
              latitude: unifiedData.restaurant.latitude,
              longitude: unifiedData.restaurant.longitude
            } : unifiedData.restaurant_id ? {
              id: unifiedData.restaurant_id,
              name: '',
              latitude: null,
              longitude: null
            } : undefined
          };

          // Store for offline access
          storeActiveOrder(formattedData);
          return formattedData;
        }

        // Fallback to original implementation for backwards compatibility
        // Ensure all ID queries use "customer_id" not "user_id"
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            *, 
            order_items(*),
            order_history(*)
          `)
          .eq('id', orderId)
          .maybeSingle();

        if (orderError) throw orderError;

        // Check restaurant assignments for unified status handling
        if (['pending', 'awaiting_restaurant', 'restaurant_assigned'].includes(orderData.status)) {
          // Check for any assignment status that should update order status
          const { data: assignments } = await supabase
            .from('restaurant_assignments')
            .select('*')
            .eq('order_id', orderId)
            .in('status', ['accepted', 'preparing', 'ready_for_pickup'])
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (assignments && assignments.length > 0) {
            const latestAssignment = assignments[0];
            console.log('Found assignment with status:', latestAssignment.status);
            
            // Map assignment status to order status
            const statusMap: Record<string, string> = {
              'accepted': 'restaurant_accepted',
              'preparing': 'preparing',
              'ready_for_pickup': 'ready_for_pickup'
            };
            
            const mappedStatus = statusMap[latestAssignment.status];
            if (mappedStatus && orderData.status !== mappedStatus) {
              orderData.status = mappedStatus;
              orderData.restaurant_id = latestAssignment.restaurant_id;
            }
          }
        }
        
        // Get restaurant data if needed
        let restaurantData = null;
        if (orderData.restaurant_id) {
          const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id, name, latitude, longitude')
            .eq('id', orderData.restaurant_id)
            .maybeSingle();
            
          if (restaurant) {
            restaurantData = restaurant;
          }
        }
        
        // Format data consistently
        const formattedData: Order = {
          ...orderData,
          restaurant: restaurantData || (orderData.restaurant_id ? { 
            id: orderData.restaurant_id, 
            name: '' 
          } : undefined)
        };

        // Store for offline access
        storeActiveOrder(formattedData);

        return formattedData;
      } catch (error) {
        console.error('Error fetching order data:', error);
        
        // If we're offline, try to get from cache
        if (!isOnline) {
          const cachedData = getActiveOrder(orderId);
          if (cachedData) {
            toast({
              title: "Using cached data",
              description: "You're offline. Showing locally saved order information.",
              variant: "destructive"
            });
            return cachedData;
          }
        }
        
        throw error;
      }
    },
    enabled: !!orderId,
    staleTime: 0,
    refetchInterval: (query) => {
      // Get the data from the query object
      const data = query.state.data as Order | undefined;
      if (!data) return false;
      
      // Don't refetch if offline
      if (!isOnline) return false;
      
      // Refetch for active statuses regardless of assignment source
      return ['pending', 'awaiting_restaurant', 'restaurant_assigned', 'preparing', 'restaurant_accepted', 'ready_for_pickup'].includes(data.status) ? 5000 : false;
    },
  });
};
