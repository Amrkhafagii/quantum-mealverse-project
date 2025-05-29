
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { storeActiveOrder, getActiveOrder } from '@/utils/offlineStorage';
import { toast } from '@/components/ui/use-toast';

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

        // Otherwise fetch from server
        // Instead of trying to join with restaurants directly, we'll fetch the order first
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            *, 
            order_items(*)
          `)
          .eq('id', orderId)
          .maybeSingle();
          
        if (orderError) throw orderError;
        
        if (!orderData) {
          throw new Error('Order not found');
        }
        
        // Check restaurant assignments if the order is in pending, awaiting, or assigned status
        if (['pending', 'awaiting_restaurant', 'restaurant_assigned'].includes(orderData.status)) {
          // First check for accepted assignment
          const { data: acceptedAssignment, error: acceptedError } = await supabase
            .from('restaurant_assignments')
            .select('*')
            .eq('order_id', orderId)
            .eq('status', 'accepted')
            .maybeSingle();
            
          if (!acceptedError && acceptedAssignment) {
            console.log('Found accepted restaurant assignment but order status is not synced');
            // Get restaurant data for the accepted assignment
            const { data: restaurant } = await supabase
              .from('restaurants')
              .select('id, name, latitude, longitude')
              .eq('id', acceptedAssignment.restaurant_id)
              .maybeSingle();
              
            if (restaurant) {
              // Override the order status and restaurant_id to match the assignment
              orderData.status = 'restaurant_accepted';
              orderData.restaurant_id = acceptedAssignment.restaurant_id;
            }
          }
          
          // Now check for ready_for_pickup assignment which should take precedence
          const { data: readyAssignment, error: readyError } = await supabase
            .from('restaurant_assignments')
            .select('*')
            .eq('order_id', orderId)
            .eq('status', 'ready_for_pickup')
            .maybeSingle();
            
          if (!readyError && readyAssignment) {
            console.log('Found ready_for_pickup restaurant assignment but order status is not synced');
            // Override to ready_for_pickup status
            orderData.status = 'ready_for_pickup';
            orderData.restaurant_id = readyAssignment.restaurant_id;
          }
          
          // Also check for preparing status
          const { data: preparingAssignment, error: preparingError } = await supabase
            .from('restaurant_assignments')
            .select('*')
            .eq('order_id', orderId)
            .eq('status', 'preparing')
            .maybeSingle();
            
          if (!preparingError && preparingAssignment) {
            console.log('Found preparing restaurant assignment but order status is not synced');
            // Override to preparing status
            orderData.status = 'preparing';
            orderData.restaurant_id = preparingAssignment.restaurant_id;
          }
        }
        
        // Then, if there's a restaurant_id, fetch restaurant data separately
        let restaurantData = null;
        if (orderData.restaurant_id) {
          const { data: restaurant, error: restaurantError } = await supabase
            .from('restaurants')
            .select('id, name, latitude, longitude')
            .eq('id', orderData.restaurant_id)
            .maybeSingle();
            
          if (!restaurantError && restaurant) {
            restaurantData = restaurant;
          }
        }
        
        // Combine the order with restaurant data
        const formattedData: Order = {
          ...orderData,
          restaurant: restaurantData || { id: orderData.restaurant_id || '', name: '' }
        };
        
        // Store the order data for offline access
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
      
      // Add 'ready_for_pickup' to the list of statuses that should trigger refetching
      return ['pending', 'awaiting_restaurant', 'restaurant_assigned', 'preparing', 'restaurant_accepted', 'ready_for_pickup'].includes(data.status) ? 5000 : false;
    },
  });
};
