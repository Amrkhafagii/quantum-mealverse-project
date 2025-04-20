
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order';

export const useOrderData = (orderId: string) => {
  return useQuery({
    queryKey: ['order-details', orderId],
    queryFn: async () => {
      try {
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
        
        // Then, if there's a restaurant_id, fetch restaurant data separately
        let restaurantData = null;
        if (orderData.restaurant_id) {
          const { data: restaurant, error: restaurantError } = await supabase
            .from('restaurants')
            .select('id, name')
            .eq('id', orderData.restaurant_id)
            .maybeSingle();
            
          if (!restaurantError && restaurant) {
            restaurantData = restaurant;
          }
        }

        // Parse restaurant_attempts if it exists
        const formattedData: Order = {
          ...orderData,
          restaurant: restaurantData || { id: '', name: '' },
          restaurant_attempts: orderData.restaurant_attempts ? 
            orderData.restaurant_attempts as Order['restaurant_attempts'] : 
            undefined
        };
        
        return formattedData;
      } catch (error) {
        console.error('Error fetching order data:', error);
        throw error;
      }
    },
    enabled: !!orderId,
    staleTime: 0,
    refetchInterval: (query) => {
      // Get the data from the query object
      const data = query.state.data as Order | undefined;
      if (!data) return false;
      return ['pending', 'awaiting_restaurant'].includes(data.status) ? 5000 : false;
    },
  });
};
