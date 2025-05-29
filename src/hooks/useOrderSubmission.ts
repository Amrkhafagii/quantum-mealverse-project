
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
    console.log('Phase 6: Starting integrated order submission:', data);

    try {
      // Phase 6: Create order with integrated flexible schema
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
        assignment_source: 'nutrition_generation',
        is_mixed_order: hasMixedOrderTypes(items)
      };

      console.log('Phase 6: Creating integrated order:', orderData);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Phase 6: Order creation error:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      console.log('Phase 6: Order created successfully:', order);

      // Phase 6: Create order items with integrated flexible schema
      const orderItems = items.map(item => ({
        order_id: order.id,
        meal_id: item.id, // Flexible: can be meal plan ID or null
        menu_item_id: null, // For future traditional restaurant items
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        source_type: determineSourceType(item)
      }));

      console.log('Phase 6: Creating integrated order items:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Phase 6: Order items error:', itemsError);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      console.log('Phase 6: Order items created successfully');

      // Phase 6: Integrated restaurant assignment
      await assignRestaurantsIntegrated(order.id, data.latitude, data.longitude);

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.formatted_order_id} has been placed using our integrated flexible ordering system.`,
        variant: "default"
      });

      clearCart();
      
      // Redirect to confirmation page
      window.location.href = `/order-confirmation/${order.id}`;

    } catch (error) {
      console.error('Phase 6: Integrated order submission error:', error);
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Phase 6: Determine source type for flexible ordering
  const determineSourceType = (item: CartItem): string => {
    if (item.assignment_source === 'nutrition_generation') {
      return 'meal_plan';
    }
    if (item.assignment_source === 'traditional_ordering') {
      return 'menu_item';
    }
    return 'meal_plan'; // Default for backward compatibility
  };

  // Phase 6: Check if order has mixed item types
  const hasMixedOrderTypes = (items: CartItem[]): boolean => {
    const sourceTypes = new Set(items.map(item => determineSourceType(item)));
    return sourceTypes.size > 1;
  };

  // Phase 6: Integrated restaurant assignment
  const assignRestaurantsIntegrated = async (
    orderId: string, 
    latitude?: number, 
    longitude?: number
  ) => {
    console.log('Phase 6: Starting integrated restaurant assignment:', orderId);
    
    try {
      let nearbyRestaurants = [];

      if (latitude && longitude) {
        console.log('Phase 6: Finding restaurants with integrated location:', { latitude, longitude });
        
        const { data, error: findError } = await supabase.rpc('find_nearest_restaurant', {
          order_lat: latitude,
          order_lng: longitude,
          max_distance_km: 50
        });

        if (!findError && data && data.length > 0) {
          nearbyRestaurants = data;
          console.log('Phase 6: Found nearby restaurants:', nearbyRestaurants.length);
        }
      }

      // Phase 6: Integrated fallback strategy
      if (nearbyRestaurants.length === 0) {
        console.log('Phase 6: Using integrated fallback restaurant selection');
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
        console.log('Phase 6: No restaurants available - order will proceed without assignment');
        return;
      }

      // Phase 6: Create integrated restaurant assignments
      const assignments = nearbyRestaurants.map((restaurantData: any) => {
        const restaurantId = restaurantData.restaurant_id || restaurantData.id;
        return {
          order_id: orderId,
          restaurant_id: restaurantId,
          status: 'pending',
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        };
      });

      console.log('Phase 6: Creating integrated restaurant assignments:', assignments.length);

      const { error: assignmentError } = await supabase
        .from('restaurant_assignments')
        .insert(assignments);

      if (assignmentError) {
        console.error('Phase 6: Integrated assignment error:', assignmentError);
        console.log('Assignment failed but order created successfully with integrated system');
      } else {
        console.log(`Phase 6: Successfully created ${assignments.length} integrated assignments`);
      }

    } catch (error) {
      console.error('Phase 6: Error in integrated restaurant assignment:', error);
      console.log('Restaurant assignment failed but order created successfully');
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
