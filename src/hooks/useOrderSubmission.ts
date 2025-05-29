
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

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

      // Create the order with all required fields
      const orderData = {
        user_id: userId,
        total_amount: totalAmount,
        status: 'pending',
        delivery_address: data.address,
        delivery_instructions: data.instructions || null,
        phone_number: data.phone,
        latitude: data.latitude,
        longitude: data.longitude,
        // Add required fields that were missing
        city: data.city || 'Unknown',
        customer_email: data.email,
        customer_name: data.fullName,
        customer_phone: data.phone,
        delivery_method: data.deliveryMethod || 'delivery',
        payment_method: data.paymentMethod || 'cash',
        delivery_fee: 0,
        subtotal: totalAmount,
        total: totalAmount
      };

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

      // Create order items with required meal_id field
      const orderItems = items.map(item => ({
        order_id: order.id,
        meal_id: item.id, // Use item.id as meal_id
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw itemsError;
      }

      console.log('Order items created successfully');

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
