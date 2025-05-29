
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/contexts/CartContext';
import { MealResolutionService } from '@/services/meal/mealResolutionService';

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
      console.log('Starting simplified order submission for user:', userId);
      console.log('Cart items:', cartItems);
      console.log('Form data:', formData);

      // Step 1: Resolve cart items to meal format (simplified, no validation)
      const resolvedItems = await MealResolutionService.resolveCartItemsToMeals(
        cartItems,
        'default-restaurant' // Placeholder restaurant ID
      );

      console.log('Resolved items (no validation):', resolvedItems);

      // Step 2: Create order record
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

      // Step 3: Create order items directly from resolved items (no validation)
      const orderItems = resolvedItems.map(item => ({
        order_id: order.id,
        meal_id: item.meal_id, // Using the mock meal ID from resolution service
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

      // Success - clear cart and show success message
      clearCart();
      
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.id?.slice(0, 8)} has been placed successfully.`,
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
