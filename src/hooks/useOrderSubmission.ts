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
      // Create the order first
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

      // Create order items - transform id to meal_id
      const orderItems = items.map(item => ({
        order_id: order.id,
        meal_id: item.id, // Transform id to meal_id for database
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items error:', itemsError);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      console.log('Order items created successfully');

      // Assign restaurants to the order
      await assignRestaurantsToOrder(order.id, data.latitude, data.longitude);

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

  const assignRestaurantsToOrder = async (
    orderId: string, 
    latitude?: number, 
    longitude?: number
  ) => {
    try {
      console.log('Starting restaurant assignment for order:', orderId);
      
      if (!latitude || !longitude) {
        console.log('No location provided, using default assignment strategy');
        // Fallback: assign to first available restaurant
        const { data: restaurants } = await supabase
          .from('restaurants')
          .select('id')
          .limit(1);

        if (restaurants && restaurants.length > 0) {
          await createSingleRestaurantAssignment(orderId, restaurants[0].id);
        }
        return;
      }

      // Find nearby restaurants using the database function
      console.log('Finding nearby restaurants for coordinates:', { latitude, longitude });
      
      const { data: nearbyRestaurants, error: findError } = await supabase.rpc('find_nearest_restaurant', {
        order_lat: latitude,
        order_lng: longitude,
        max_distance_km: 50
      });

      if (findError) {
        console.error('Error finding nearby restaurants:', findError);
        throw findError;
      }

      console.log('Raw response from find_nearest_restaurant:', nearbyRestaurants);

      if (!nearbyRestaurants || nearbyRestaurants.length === 0) {
        console.log('No nearby restaurants found, using fallback');
        // Fallback to any active restaurant
        const { data: fallbackRestaurants } = await supabase
          .from('restaurants')
          .select('id')
          .limit(1);

        if (fallbackRestaurants && fallbackRestaurants.length > 0) {
          await createSingleRestaurantAssignment(orderId, fallbackRestaurants[0].id);
        }
        return;
      }

      // Parse the restaurant data properly
      const assignments = nearbyRestaurants.map((restaurantData: any) => {
        console.log('Processing restaurant data:', restaurantData);
        
        let restaurantId: string;
        
        // Handle different response formats from the database function
        if (Array.isArray(restaurantData)) {
          // Tuple format: [restaurant_id, restaurant_name, distance_km, ...]
          restaurantId = restaurantData[0];
        } else if (restaurantData && typeof restaurantData === 'object') {
          // Object format: {restaurant_id: "...", restaurant_name: "...", ...}
          restaurantId = restaurantData.restaurant_id || restaurantData.id;
        } else {
          console.error('Unexpected restaurant data format:', restaurantData);
          return null;
        }

        if (!restaurantId) {
          console.error('Could not extract restaurant ID from:', restaurantData);
          return null;
        }

        console.log('Extracted restaurant ID:', restaurantId);

        return {
          order_id: orderId,
          restaurant_id: restaurantId,
          status: 'pending',
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
        };
      }).filter(Boolean); // Remove null entries

      if (assignments.length === 0) {
        console.error('No valid restaurant assignments could be created');
        throw new Error('No restaurants available for assignment');
      }

      console.log('Creating restaurant assignments:', assignments);

      const { error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .insert(assignments);

      if (assignmentError) {
        console.error('Restaurant assignment error:', assignmentError);
        throw assignmentError;
      }

      console.log(`Successfully created ${assignments.length} restaurant assignments`);

    } catch (error) {
      console.error('Error in assignRestaurantsToOrder:', error);
      // Don't throw here - order was already created successfully
      toast({
        title: "Assignment Warning",
        description: "Order created but restaurant assignment may be delayed.",
        variant: "default"
      });
    }
  };

  const createSingleRestaurantAssignment = async (orderId: string, restaurantId: string) => {
    const assignment = {
      order_id: orderId,
      restaurant_id: restaurantId,
      status: 'pending',
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };

    console.log('Creating single restaurant assignment:', assignment);

    const { error } = await supabase
      .from('restaurant_assignments')
      .insert([assignment]);

    if (error) {
      console.error('Single restaurant assignment error:', error);
      throw error;
    }

    console.log('Single restaurant assignment created successfully');
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
