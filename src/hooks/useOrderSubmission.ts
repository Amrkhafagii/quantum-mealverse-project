
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/contexts/CartContext';

export const useOrderSubmission = (
  userId: string | undefined,
  cartItems: CartItem[],
  totalAmount: number,
  hasDeliveryInfo: boolean,
  clearCart: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (formData: any) => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place an order.",
        variant: "destructive"
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Starting order submission with restaurant assignment for user:', userId);
      console.log('Cart items:', cartItems);
      console.log('Form data:', formData);

      // Step 1: Create order record
      const orderData = {
        user_id: userId,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        delivery_address: formData.address,
        city: formData.city,
        notes: formData.notes || '',
        delivery_method: formData.deliveryMethod || 'delivery',
        payment_method: formData.paymentMethod || 'cash',
        delivery_fee: 5.00,
        subtotal: totalAmount,
        total: totalAmount + 5.00,
        status: 'pending',
        latitude: formData.latitude || null,
        longitude: formData.longitude || null
      };

      console.log('Creating order with data:', orderData);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError || !order) {
        console.error('Order creation error:', orderError);
        throw new Error(`Failed to create order: ${orderError?.message || 'Unknown error'}`);
      }

      console.log('Order created successfully:', order);

      // Step 2: Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        meal_id: null,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      console.log('Creating order items:', orderItems);

      const { data: createdOrderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();

      if (orderItemsError) {
        console.error('Order items creation error:', orderItemsError);
        throw new Error(`Failed to create order items: ${orderItemsError.message}`);
      }

      console.log('Order items created successfully:', createdOrderItems);

      // Step 3: Find restaurants within 5km radius and assign order
      if (formData.latitude && formData.longitude) {
        console.log('Finding nearby restaurants within 5km radius...');
        
        const { data: nearbyRestaurants, error: restaurantsError } = await supabase.rpc('find_nearest_restaurant', {
          order_lat: formData.latitude,
          order_lng: formData.longitude,
          max_distance_km: 5.0
        });

        if (restaurantsError) {
          console.error('Error finding nearby restaurants:', restaurantsError);
          // Continue without restaurant assignment rather than failing the order
        } else if (nearbyRestaurants && nearbyRestaurants.length > 0) {
          console.log(`Found ${nearbyRestaurants.length} restaurants within 5km:`, nearbyRestaurants);

          // Create assignments for all nearby restaurants
          const assignments = nearbyRestaurants.map(restaurant => ({
            order_id: order.id,
            restaurant_id: restaurant.restaurant_id,
            status: 'pending',
            expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes expiry
          }));

          const { data: createdAssignments, error: assignmentError } = await supabase
            .from('restaurant_assignments')
            .insert(assignments)
            .select();

          if (assignmentError) {
            console.error('Restaurant assignment error:', assignmentError);
            // Log but don't fail the order
          } else {
            console.log(`Successfully assigned order to ${createdAssignments?.length || 0} restaurants`);
            
            // Update order status to indicate it's been assigned to restaurants
            await supabase
              .from('orders')
              .update({ status: 'awaiting_restaurant' })
              .eq('id', order.id);
          }
        } else {
          console.log('No restaurants found within 5km radius');
          // Update order status to indicate no restaurants available
          await supabase
            .from('orders')
            .update({ status: 'no_restaurant_available' })
            .eq('id', order.id);
        }
      } else {
        console.log('No customer location provided, skipping restaurant assignment');
      }

      // Success - clear cart and show success message
      clearCart();
      
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.id?.slice(0, 8)} has been placed and assigned to nearby restaurants.`,
        variant: "default"
      });

      // Redirect to thank you page
      window.location.href = `/thank-you?orderId=${order.id}`;

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

  return {
    isSubmitting,
    handleSubmit
  };
};
