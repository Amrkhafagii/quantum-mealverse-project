
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
    console.log('Starting order submission with flexible schema:', data);

    try {
      // Create the order with new flexible fields
      const orderData = {
        user_id: userId || null,
        customer_name: data.fullName,
        customer_phone: data.phone,
        customer_email: data.email || '',
        delivery_address: data.address,
        city: data.city || '',
        total: totalAmount,
        subtotal: totalAmount * 0.9,
        delivery_fee: totalAmount * 0.1,
        status: 'pending',
        payment_method: data.paymentMethod || 'cash',
        delivery_method: data.deliveryMethod || 'delivery',
        special_instructions: data.specialInstructions || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        assignment_source: 'nutrition_generation', // New field for flexible ordering
        is_mixed_order: false // Will be updated if we have mixed items
      };

      console.log('Creating flexible order with schema updates:', orderData);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      console.log('Order created successfully with flexible schema:', order);

      // Create order items with new flexible schema
      const orderItems = items.map(item => ({
        order_id: order.id,
        meal_id: item.id, // Now nullable and flexible
        menu_item_id: null, // For traditional restaurant items (future use)
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        source_type: 'meal_plan' // New field to track item origin
      }));

      console.log('Creating flexible order items:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items error:', itemsError);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      console.log('Flexible order items created successfully');

      // Simplified restaurant assignment with flexible constraints
      await assignNearbyRestaurants(order.id, data.latitude, data.longitude);

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.formatted_order_id} has been placed with flexible ordering support.`,
        variant: "default"
      });

      clearCart();
      
      // Redirect to thank you page
      window.location.href = `/order-confirmation/${order.id}`;

    } catch (error) {
      console.error('Flexible order submission error:', error);
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
    console.log('Starting flexible restaurant assignment for order:', orderId);
    
    try {
      let nearbyRestaurants = [];

      if (latitude && longitude) {
        console.log('Finding nearby restaurants for flexible ordering:', { latitude, longitude });
        
        // Find nearby restaurants using the database function
        const { data, error: findError } = await supabase.rpc('find_nearest_restaurant', {
          order_lat: latitude,
          order_lng: longitude,
          max_distance_km: 50
        });

        if (!findError && data && data.length > 0) {
          nearbyRestaurants = data;
          console.log('Found nearby restaurants for flexible ordering:', nearbyRestaurants.length);
        }
      }

      // Fallback: get any available restaurant if no nearby restaurants found
      if (nearbyRestaurants.length === 0) {
        console.log('No nearby restaurants found, using fallback for flexible ordering');
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
        console.log('No restaurants available for flexible ordering - order will proceed without assignment');
        return;
      }

      // Create flexible restaurant assignments
      const assignments = nearbyRestaurants.map((restaurantData: any) => {
        const restaurantId = restaurantData.restaurant_id || restaurantData.id;
        return {
          order_id: orderId,
          restaurant_id: restaurantId,
          status: 'pending',
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
        };
      });

      console.log('Creating flexible restaurant assignments:', assignments.length);

      const { error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .insert(assignments);

      if (assignmentError) {
        console.error('Flexible restaurant assignment error:', assignmentError);
        console.log('Assignment failed but order was created successfully with flexible schema');
      } else {
        console.log(`Successfully created ${assignments.length} flexible restaurant assignments`);
      }

    } catch (error) {
      console.error('Error in flexible restaurant assignment:', error);
      console.log('Restaurant assignment failed but order was created successfully with flexible schema');
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
