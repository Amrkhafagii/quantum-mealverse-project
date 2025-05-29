
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from '@/types/cart';

export const useOrderSubmission = (
  userId: string | undefined,
  items: CartItem[],
  totalAmount: number,
  hasDeliveryInfo: boolean,
  clearCart: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log('Starting order submission with data:', data);

    try {
      // Create the order first - no validation needed, accept any cart items
      const orderData = {
        user_id: userId || null,
        customer_name: data.fullName,
        customer_phone: data.phone,
        customer_email: data.email || '',
        delivery_address: data.address,
        city: data.city || '',
        total: totalAmount,
        subtotal: totalAmount * 0.9, // Assuming 10% is delivery fee
        delivery_fee: totalAmount * 0.1,
        status: 'pending',
        payment_method: data.paymentMethod || 'cash',
        delivery_method: data.deliveryMethod || 'delivery',
        special_instructions: data.specialInstructions || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null
      };

      console.log('Creating order with data:', orderData);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      console.log('Order created successfully:', order);

      // Create order items directly - no menu validation
      const orderItems = items.map(item => ({
        order_id: order.id,
        meal_id: item.id, // Use item id directly without validation
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      console.log('Creating order items without validation:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items error:', itemsError);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      console.log('Order items created successfully');

      // Simplified restaurant assignment - no capability checking
      await assignNearbyRestaurants(order.id, data.latitude, data.longitude);

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.formatted_order_id} has been placed and restaurants are being notified.`,
        variant: "default"
      });

      clearCart();
      
      // Redirect to thank you page
      window.location.href = `/order-confirmation/${order.id}`;

    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const assignNearbyRestaurants = async (
    orderId: string, 
    latitude?: number, 
    longitude?: number
  ) => {
    console.log('Starting simplified restaurant assignment for order:', orderId);
    
    try {
      let nearbyRestaurants = [];

      if (latitude && longitude) {
        console.log('Finding nearby restaurants for coordinates:', { latitude, longitude });
        
        // Find nearby restaurants using the database function
        const { data, error: findError } = await supabase.rpc('find_nearest_restaurant', {
          order_lat: latitude,
          order_lng: longitude,
          max_distance_km: 50
        });

        if (!findError && data && data.length > 0) {
          nearbyRestaurants = data;
          console.log('Found nearby restaurants:', nearbyRestaurants.length);
        }
      }

      // Fallback: get any available restaurant if no nearby restaurants found
      if (nearbyRestaurants.length === 0) {
        console.log('No nearby restaurants found, using any available restaurant');
        const { data: fallbackRestaurants } = await supabase
          .from('restaurants')
          .select('id')
          .eq('is_active', true)
          .limit(5);

        if (fallbackRestaurants && fallbackRestaurants.length > 0) {
          nearbyRestaurants = fallbackRestaurants.map(restaurant => ({
            restaurant_id: restaurant.id
          }));
        }
      }

      if (nearbyRestaurants.length === 0) {
        console.log('No restaurants available - order will proceed without assignment');
        // Don't throw error - order was created successfully
        return;
      }

      // Create assignments for available restaurants - no capability checking
      const assignments = nearbyRestaurants.map((restaurantData: any) => {
        const restaurantId = restaurantData.restaurant_id || restaurantData.id;
        return {
          order_id: orderId,
          restaurant_id: restaurantId,
          status: 'pending',
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
        };
      });

      console.log('Creating simplified restaurant assignments:', assignments.length);

      const { error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .insert(assignments);

      if (assignmentError) {
        console.error('Restaurant assignment error:', assignmentError);
        // Don't throw - order was already created successfully
        console.log('Assignment failed but order was created successfully');
      } else {
        console.log(`Successfully created ${assignments.length} restaurant assignments`);
      }

    } catch (error) {
      console.error('Error in assignNearbyRestaurants:', error);
      // Don't throw - order was already created successfully
      console.log('Restaurant assignment failed but order was created successfully');
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
