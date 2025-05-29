
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
      console.log('=== ORDER SUBMISSION STARTED ===');
      console.log('User ID:', userId);
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
        console.error('❌ Order creation error:', orderError);
        throw new Error(`Failed to create order: ${orderError?.message || 'Unknown error'}`);
      }

      console.log('✅ Order created successfully:', order);

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
        console.error('❌ Order items creation error:', orderItemsError);
        throw new Error(`Failed to create order items: ${orderItemsError.message}`);
      }

      console.log('✅ Order items created successfully:', createdOrderItems);

      // Step 3: Restaurant Assignment Process
      if (formData.latitude && formData.longitude) {
        console.log('=== RESTAURANT ASSIGNMENT STARTED ===');
        console.log('Customer location:', { lat: formData.latitude, lng: formData.longitude });
        
        // Find nearby restaurants using the database function
        console.log('Calling find_nearest_restaurant function...');
        const { data: nearbyRestaurants, error: restaurantsError } = await supabase.rpc('find_nearest_restaurant', {
          order_lat: parseFloat(formData.latitude.toString()),
          order_lng: parseFloat(formData.longitude.toString()),
          max_distance_km: 5.0
        });

        if (restaurantsError) {
          console.error('❌ Error finding nearby restaurants:', restaurantsError);
          console.error('Restaurant search error details:', {
            code: restaurantsError.code,
            message: restaurantsError.message,
            details: restaurantsError.details,
            hint: restaurantsError.hint
          });
          
          // Update order status to indicate no restaurant search capability
          await supabase
            .from('orders')
            .update({ status: 'pending' })
            .eq('id', order.id);

          toast({
            title: "Order Placed",
            description: `Order #${order.id?.slice(0, 8)} created but restaurant search failed.`,
            variant: "destructive"
          });
        } else if (nearbyRestaurants && nearbyRestaurants.length > 0) {
          console.log(`✅ Found ${nearbyRestaurants.length} restaurants within 5km:`, nearbyRestaurants);

          // Validate restaurant data structure
          const validRestaurants = nearbyRestaurants.filter(restaurant => {
            const isValid = restaurant && 
                           restaurant.restaurant_id && 
                           typeof restaurant.restaurant_id === 'string';
            
            if (!isValid) {
              console.warn('⚠️ Invalid restaurant data:', restaurant);
            }
            
            return isValid;
          });

          console.log(`✅ Valid restaurants for assignment: ${validRestaurants.length}`);

          if (validRestaurants.length > 0) {
            // Create assignments for all valid nearby restaurants
            const assignments = validRestaurants.map(restaurant => ({
              order_id: order.id,
              restaurant_id: restaurant.restaurant_id, // Use the correct field name
              status: 'pending',
              expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes expiry
            }));

            console.log('Creating restaurant assignments:', assignments);

            const { data: createdAssignments, error: assignmentError } = await supabase
              .from('restaurant_assignments')
              .insert(assignments)
              .select();

            if (assignmentError) {
              console.error('❌ Restaurant assignment error:', assignmentError);
              console.error('Assignment error details:', {
                code: assignmentError.code,
                message: assignmentError.message,
                details: assignmentError.details,
                hint: assignmentError.hint,
                assignments: assignments
              });
              
              // Try to get more details about what went wrong
              if (assignmentError.code === '23503') {
                console.error('Foreign key constraint violation - checking restaurant IDs...');
                
                // Verify restaurant IDs exist
                for (const assignment of assignments) {
                  const { data: restaurantCheck } = await supabase
                    .from('restaurants')
                    .select('id, name')
                    .eq('id', assignment.restaurant_id)
                    .single();
                  
                  console.log(`Restaurant ${assignment.restaurant_id} exists:`, !!restaurantCheck);
                }
              }

              toast({
                title: "Assignment Failed",
                description: `Order created but restaurant assignment failed: ${assignmentError.message}`,
                variant: "destructive"
              });
            } else {
              console.log(`✅ Successfully assigned order to ${createdAssignments?.length || 0} restaurants`);
              console.log('Created assignments:', createdAssignments);
              
              // Update order status to indicate it's been assigned to restaurants
              const { error: statusUpdateError } = await supabase
                .from('orders')
                .update({ status: 'awaiting_restaurant' })
                .eq('id', order.id);

              if (statusUpdateError) {
                console.error('❌ Error updating order status:', statusUpdateError);
              } else {
                console.log('✅ Order status updated to awaiting_restaurant');
              }

              toast({
                title: "Order Placed Successfully!",
                description: `Your order #${order.id?.slice(0, 8)} has been assigned to ${createdAssignments?.length || 0} nearby restaurants.`,
                variant: "default"
              });
            }
          } else {
            console.log('❌ No valid restaurants found for assignment');
            await supabase
              .from('orders')
              .update({ status: 'no_restaurant_available' })
              .eq('id', order.id);

            toast({
              title: "No Valid Restaurants",
              description: `Order #${order.id?.slice(0, 8)} created but no valid restaurants found for assignment.`,
              variant: "destructive"
            });
          }
        } else {
          console.log('❌ No restaurants found within 5km radius');
          await supabase
            .from('orders')
            .update({ status: 'no_restaurant_available' })
            .eq('id', order.id);

          toast({
            title: "No Nearby Restaurants",
            description: `Order #${order.id?.slice(0, 8)} created but no restaurants available in your area.`,
            variant: "destructive"
          });
        }
      } else {
        console.log('❌ No customer location provided, skipping restaurant assignment');
        toast({
          title: "Location Required",
          description: `Order #${order.id?.slice(0, 8)} created. Location required for restaurant assignment.`,
          variant: "destructive"
        });
      }

      console.log('=== ORDER SUBMISSION COMPLETED ===');

      // Success - clear cart
      clearCart();

      // Redirect to thank you page
      window.location.href = `/thank-you?orderId=${order.id}`;

    } catch (error) {
      console.error('❌ Order submission error:', error);
      console.error('Error stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      
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
