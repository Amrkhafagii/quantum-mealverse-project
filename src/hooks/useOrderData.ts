
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
        
        // Check restaurant assignments if the order is in pending or awaiting status
        if (['pending', 'awaiting_restaurant'].includes(orderData.status)) {
          // Check if there's an accepted restaurant assignment for this order
          const { data: acceptedAssignment, error: assignmentError } = await supabase
            .from('restaurant_assignments')
            .select('*')
            .eq('order_id', orderId)
            .eq('status', 'accepted')
            .maybeSingle();
            
          if (!assignmentError && acceptedAssignment) {
            console.log('Found accepted restaurant assignment but order status is pending or awaiting');
            // Get restaurant data for the accepted assignment
            const { data: restaurant } = await supabase
              .from('restaurants')
              .select('id, name')
              .eq('id', acceptedAssignment.restaurant_id)
              .maybeSingle();
              
            if (restaurant) {
              // Override the order status and restaurant_id to match the assignment
              orderData.status = 'restaurant_accepted';
              orderData.restaurant_id = acceptedAssignment.restaurant_id;
              orderData.restaurant = restaurant;
            }
          }
        }
        
        // Then, if there's a restaurant_id, fetch restaurant data separately
        let restaurantData = null;
        if (orderData.restaurant_id && !orderData.restaurant) {
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
          restaurant: orderData.restaurant || restaurantData || { id: '', name: '' }
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
      return ['pending', 'awaiting_restaurant', 'restaurant_assigned'].includes(data.status) ? 5000 : false;
    },
  });
};
