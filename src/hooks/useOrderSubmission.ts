
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
      console.log('=== ORDER SUBMISSION DEBUG START ===');
      console.log('Order submission starting with:', {
        userId,
        itemCount: items.length,
        totalAmount,
        data
      });

      // Debug cart items
      console.log('Cart items details:', items.map(item => ({
        id: item.id,
        name: item.name,
        restaurant_id: item.restaurant_id,
        price: item.price,
        quantity: item.quantity
      })));

      // Create the order with correct field mapping
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
        throw new Error(`Order creation failed: ${orderError.message}`);
      }

      console.log('Order created successfully:', order);

      // Restaurant assignment logic with better error handling
      let assignedRestaurantId = null;
      
      // Check if items already have restaurant assignments
      const itemsWithRestaurants = items.filter(item => item.restaurant_id);
      const itemsWithoutRestaurants = items.filter(item => !item.restaurant_id);
      
      console.log('Restaurant assignment analysis:', {
        totalItems: items.length,
        itemsWithRestaurants: itemsWithRestaurants.length,
        itemsWithoutRestaurants: itemsWithoutRestaurants.length
      });

      if (itemsWithRestaurants.length > 0) {
        // Use the first restaurant ID from assigned items
        assignedRestaurantId = itemsWithRestaurants[0].restaurant_id;
        console.log('Using existing restaurant assignment:', assignedRestaurantId);
      } else {
        // Get a fallback restaurant with better error handling
        console.log('No restaurant assignments found, getting fallback restaurant...');
        
        const { data: restaurants, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id, name, is_active')
          .eq('is_active', true)
          .limit(5);
          
        console.log('Available restaurants query result:', { restaurants, error: restaurantError });
        
        if (restaurantError) {
          console.error('Restaurant query error:', restaurantError);
          throw new Error(`Failed to find restaurants: ${restaurantError.message}`);
        }
        
        if (!restaurants || restaurants.length === 0) {
          console.error('No active restaurants found in database');
          throw new Error('No active restaurants available. Please try again later.');
        }
        
        assignedRestaurantId = restaurants[0].id;
        console.log('Assigned fallback restaurant:', {
          id: assignedRestaurantId,
          name: restaurants[0].name,
          availableCount: restaurants.length
        });
      }

      // Validate restaurant ID before proceeding
      if (!assignedRestaurantId) {
        throw new Error('No restaurant could be assigned to process your order');
      }

      // Update order with restaurant assignment
      console.log('Updating order with restaurant assignment...');
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({ restaurant_id: assignedRestaurantId })
        .eq('id', order.id);
        
      if (updateError) {
        console.error('Error updating order with restaurant:', updateError);
        throw new Error(`Failed to assign restaurant: ${updateError.message}`);
      }
      
      console.log('Order updated with restaurant assignment successfully');

      // Resolve cart items to meal records with enhanced error handling
      console.log('Starting meal resolution process...');
      
      let resolvedItems;
      try {
        resolvedItems = await MealResolutionService.resolveCartItemsToMeals(
          items,
          assignedRestaurantId
        );

        console.log('Meal resolution successful:', {
          originalItemCount: items.length,
          resolvedItemCount: resolvedItems.length,
          resolvedItems: resolvedItems.map(item => ({
            id: item.id,
            name: item.name,
            meal_id: item.meal_id,
            price: item.price,
            quantity: item.quantity
          }))
        });

      } catch (mealResolutionError) {
        console.error('Meal resolution failed:', mealResolutionError);
        throw new Error(`Failed to process meal items: ${mealResolutionError instanceof Error ? mealResolutionError.message : 'Unknown error'}`);
      }

      // Validate all meal IDs exist before creating order items
      const mealIds = resolvedItems.map(item => item.meal_id);
      const areMealIdsValid = await MealResolutionService.validateMealIds(mealIds);
      
      if (!areMealIdsValid) {
        console.error('Meal ID validation failed before order item creation');
        throw new Error('Some meal items could not be validated. Please try again.');
      }

      console.log('All meal IDs validated successfully');

      // Create order items with better error handling
      console.log('Creating order items...');
      
      for (const [index, item] of resolvedItems.entries()) {
        try {
          const orderItem = {
            order_id: order.id,
            meal_id: item.meal_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          };

          console.log(`Creating order item ${index + 1}/${resolvedItems.length}:`, orderItem);

          const { error: itemError } = await supabase
            .from('order_items')
            .insert(orderItem);

          if (itemError) {
            // Handle unique constraint violations
            if (itemError.code === '23505' && itemError.message?.includes('order_items_order_meal_unique')) {
              console.log('Duplicate order item detected, updating existing item...');
              
              const { data: existingItem, error: fetchError } = await supabase
                .from('order_items')
                .select('quantity')
                .eq('order_id', order.id)
                .eq('meal_id', item.meal_id)
                .single();

              if (fetchError) {
                console.error('Error fetching existing item:', fetchError);
                throw new Error(`Failed to fetch existing item: ${fetchError.message}`);
              }

              const { error: updateError } = await supabase
                .from('order_items')
                .update({ 
                  quantity: existingItem.quantity + item.quantity,
                  price: item.price
                })
                .eq('order_id', order.id)
                .eq('meal_id', item.meal_id);

              if (updateError) {
                console.error('Error updating existing order item:', updateError);
                throw new Error(`Failed to update existing item: ${updateError.message}`);
              }
              
              console.log(`Updated existing order item for meal_id: ${item.meal_id}`);
            } else if (itemError.code === '23503' && itemError.message?.includes('meal_id_fkey')) {
              console.error('Foreign key constraint violation for meal_id:', item.meal_id);
              throw new Error(`Invalid meal reference for "${item.name}". The meal may have been deleted.`);
            } else {
              console.error('Order item creation error:', itemError);
              throw new Error(`Failed to create order item "${item.name}": ${itemError.message}`);
            }
          } else {
            console.log(`Successfully created order item ${index + 1} for meal_id: ${item.meal_id}`);
          }
        } catch (itemProcessError) {
          console.error(`Error processing order item ${index + 1}:`, item, itemProcessError);
          throw itemProcessError;
        }
      }

      console.log('All order items processed successfully');

      // Clear cart and show success
      clearCart();
      
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.id.slice(0, 8)} has been submitted`,
        variant: "default"
      });

      console.log('=== ORDER SUBMISSION DEBUG END (SUCCESS) ===');

    } catch (error) {
      console.error('=== ORDER SUBMISSION DEBUG END (ERROR) ===');
      console.error('Complete error details:', error);
      
      let errorMessage = "Failed to place order. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error stack:', error.stack);
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
