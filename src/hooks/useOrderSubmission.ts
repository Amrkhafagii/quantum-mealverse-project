
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from '@/types/cart';
import { unifiedOrderService, CreateOrderRequest } from '@/services/orders/UnifiedOrderService';
import { useOrderStore } from '@/stores/orderStore';

export const useOrderSubmission = (
  userId: string | undefined,
  items: CartItem[],
  totalAmount: number,
  hasDeliveryInfo: boolean,
  clearCart: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { setCreatingOrder, setOrderError, addRecentOrder } = useOrderStore();

  const handleSubmit = async (data: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setCreatingOrder(true);
    setOrderError(null);
    
    console.log('useOrderSubmission: Starting order submission with unified service');

    try {
      const subtotal = totalAmount * 0.9;
      
      const orderRequest: CreateOrderRequest = {
        customerData: {
          id: userId,
          name: data.fullName,
          email: data.email || '',
          phone: data.phone
        },
        deliveryData: {
          address: data.address,
          city: data.city || '',
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          method: data.deliveryMethod || 'delivery',
          instructions: data.specialInstructions || undefined
        },
        paymentData: {
          method: data.paymentMethod || 'cash',
          total: totalAmount,
          subtotal: subtotal
        },
        items: items
      };

      const result = await unifiedOrderService.createOrder(orderRequest);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create order');
      }

      console.log('useOrderSubmission: Order created successfully with ID:', result.orderId);

      if (result.order) {
        addRecentOrder(result.order);
      }

      toast({
        title: "Order Placed Successfully!",
        description: `Your order has been placed successfully.`,
        variant: "default"
      });

      clearCart();
      
      if (result.orderId) {
        window.location.href = `/order-confirmation/${result.orderId}`;
      }

    } catch (error) {
      console.error('useOrderSubmission: Order submission error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to place order. Please try again.";
      
      setOrderError(errorMessage);
      toast({
        title: "Order Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setCreatingOrder(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
