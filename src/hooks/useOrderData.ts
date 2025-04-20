
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order';

export const useOrderData = (orderId: string) => {
  return useQuery({
    queryKey: ['order-details', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *, 
          order_items(*),
          restaurant:restaurants(id, name)
        `)
        .eq('id', orderId)
        .single();
        
      if (error) throw error;
      return data as Order;
    },
    enabled: !!orderId,
    staleTime: 0,
    refetchInterval: (data) => {
      if (!data) return false;
      return ['pending', 'awaiting_restaurant'].includes(data.status) ? 5000 : false;
    },
  });
};
