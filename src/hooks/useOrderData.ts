
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order';

export const useOrderData = (orderId: string) => {
  return useQuery({
    queryKey: ['order-details', orderId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *, 
            order_items(*),
            restaurant:restaurants(id, name)
          `)
          .eq('id', orderId)
          .maybeSingle();
          
        if (error) throw error;
        
        if (!data) {
          throw new Error('Order not found');
        }
        
        // Ensure the restaurant property has the correct shape
        const formattedData = {
          ...data,
          restaurant: data.restaurant || { id: '', name: '' }
        };
        
        return formattedData as Order;
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
