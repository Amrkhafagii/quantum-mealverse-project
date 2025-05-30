
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from '@/types/cart';
import { createOrder, hasMixedOrderTypes } from '@/services/orders/orderCreationService';

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
    console.log('Starting order submission with new service:', data);

    try {
      // Calculate subtotal (90% of total for example)
      const subtotal = totalAmount * 0.9;
      
      // Prepare order data
      const orderData = {
        user_id: userId || null,
        customer_name: data.fullName,
        customer_phone: data.phone,
        customer_email: data.email || '',
        delivery_address: data.address,
        city: data.city || '',
        subtotal: subtotal,
        status: 'pending',
        payment_method: data.paymentMethod || 'cash',
        delivery_method: data.deliveryMethod || 'delivery',
        special_instructions: data.specialInstructions || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        assignment_source: 'nutrition_generation',
        is_mixed_order: hasMixedOrderTypes(items),
        deliveryMethod: data.deliveryMethod || 'delivery'
      };

      console.log('Creating order with enhanced service');

      // Create order using the new service
      const result = await createOrder(orderData, items);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create order');
      }

      console.log('Order created successfully with ID:', result.orderId);

      // Restaurant assignment (simplified for now)
      if (data.latitude && data.longitude) {
        console.log('Starting restaurant assignment process');
        // This would be handled by the webhook service or separate assignment service
      }

      toast({
        title: "Order Placed Successfully!",
        description: `Your order has been placed successfully.`,
        variant: "default"
      });

      clearCart();
      
      // Redirect to confirmation page
      if (result.orderId) {
        window.location.href = `/order-confirmation/${result.orderId}`;
      }

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
