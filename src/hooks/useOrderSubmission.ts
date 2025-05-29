
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { MealResolutionService } from '@/services/meal/mealResolutionService';

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
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your order",
        variant: "destructive"
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting order with data:', data);

      // Create the order with correct field mapping to match database schema
      const orderData = {
        user_id: userId,
        customer_name: data.fullName,
        customer_email: data.email,
        customer_phone: data.phone,
        delivery_address: data.address,
        city: data.city || 'Unknown',
        notes: data.instructions || null,
        delivery_method: data.deliveryMethod || 'delivery',
        payment_method: data.paymentMethod || 'cash',
        delivery_fee: 0,
        subtotal: totalAmount,
        total: totalAmount,
        status: 'pending'
      };

      // Add location data if available
      if (data.latitude && data.longitude) {
        (orderData as any).latitude = data.latitude;
        (orderData as any).longitude = data.longitude;
      }

      console.log('Creating order with data:', orderData);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      console.log('Order created successfully:', order);

      // Get the first restaurant_id from items or use a default
      const defaultRestaurantId = items.find(item => item.restaurant_id)?.restaurant_id;
      
      if (!defaultRestaurantId) {
        // If no restaurant is assigned, we'll need to assign one
        // For now, we'll get the first available restaurant
        const { data: firstRestaurant } = await supabase
          .from('restaurants')
          .select('id')
          .eq('is_active', true)
          .limit(1)
          .single();
          
        if (!firstRestaurant) {
          throw new Error('No active restaurants available');
        }
        
        // Update order with restaurant assignment
        const { error: updateError } = await supabase
          .from('orders')
          .update({ restaurant_id: firstRestaurant.id })
          .eq('id', order.id);
          
        if (updateError) {
          console.error('Error updating order with restaurant:', updateError);
          throw updateError;
        }
        
        console.log('Assigned order to restaurant:', firstRestaurant.id);
      }

      // Resolve cart items to actual meal database records
      console.log('Resolving cart items to meal records...');
      const resolvedItems = await MealResolutionService.resolveCartItemsToMeals(
        items,
        defaultRestaurantId || order.restaurant_id
      );

      console.log('Resolved meal items:', resolvedItems);

      // Create order items with proper handling of the unique constraint
      for (const item of resolvedItems) {
        try {
          // Try to insert the order item
          const orderItem = {
            order_id: order.id,
            meal_id: item.meal_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          };

          console.log('Inserting order item:', orderItem);

          const { error: itemError } = await supabase
            .from('order_items')
            .insert(orderItem);

          if (itemError) {
            // If we get a unique constraint violation, update the existing item
            if (itemError.code === '23505' && itemError.message?.includes('order_items_order_meal_unique')) {
              console.log('Duplicate order item detected, updating existing item');
              
              // Get the existing item to add quantities
              const { data: existingItem, error: fetchError } = await supabase
                .from('order_items')
                .select('quantity')
                .eq('order_id', order.id)
                .eq('meal_id', item.meal_id)
                .single();

              if (fetchError) {
                console.error('Error fetching existing item:', fetchError);
                throw fetchError;
              }

              // Update with combined quantity
              const { error: updateError } = await supabase
                .from('order_items')
                .update({ 
                  quantity: existingItem.quantity + item.quantity,
                  price: item.price // Update price in case it changed
                })
                .eq('order_id', order.id)
                .eq('meal_id', item.meal_id);

              if (updateError) {
                console.error('Error updating existing order item:', updateError);
                throw updateError;
              }
              
              console.log(`Updated existing order item for meal_id: ${item.meal_id}`);
            } else {
              console.error('Order item creation error:', itemError);
              throw itemError;
            }
          } else {
            console.log(`Successfully created order item for meal_id: ${item.meal_id}`);
          }
        } catch (itemProcessError) {
          console.error('Error processing order item:', item, itemProcessError);
          throw itemProcessError;
        }
      }

      console.log('All order items processed successfully');

      // Clear cart and show success message
      clearCart();
      
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.id.slice(0, 8)} has been submitted`,
        variant: "default"
      });

      console.log('Order submission completed successfully');

    } catch (error) {
      console.error('Order submission failed:', error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to place order. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('restaurant')) {
          errorMessage = "Unable to assign restaurant for your order. Please try again.";
        } else if (error.message.includes('meal')) {
          errorMessage = "There was an issue processing your meal items. Please try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Order Failed",
        description: errorMessage,
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
