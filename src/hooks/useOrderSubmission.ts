
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { DeliveryFormValues } from '@/hooks/useDeliveryForm';
import { 
  saveDeliveryInfo, 
  createOrder, 
  createOrderItems,
  saveUserLocation 
} from '@/services/orders/orderService';

export const useOrderSubmission = (
  userId: string | undefined,
  items: any[],
  totalAmount: number,
  hasDeliveryInfo: boolean,
  clearCart: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (data: DeliveryFormValues) => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (!userId) {
        setIsSubmitting(false);
        throw new Error("You must be logged in to place an order");
      }

      await saveDeliveryInfo(userId, data, hasDeliveryInfo);
      
      const insertedOrder = await createOrder(userId, data, items, totalAmount);
      
      if (!insertedOrder || !insertedOrder.id) {
        throw new Error("Failed to create order - no order ID returned");
      }
      
      await createOrderItems(insertedOrder.id, items);
      
      if (data.latitude && data.longitude) {
        await saveUserLocation(userId, data.latitude, data.longitude);
      }
      
      toast({
        title: "Order placed successfully",
        description: `Your order has been placed successfully`,
      });
      
      clearCart();
      navigate(`/thank-you?order=${insertedOrder.id}`);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Error placing order",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
