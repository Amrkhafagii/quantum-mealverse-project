
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { DeliveryFormValues } from '@/hooks/useDeliveryForm';
import { OrderStatus } from '@/types/webhook';
import { CartItem } from '@/contexts/CartContext';
import { 
  saveDeliveryInfo, 
  createOrder, 
  createOrderItems,
  saveUserLocation 
} from '@/services/orders/orderService';
import { sendOrderToWebhook } from '@/integrations/webhook';
import { recordOrderHistory } from '@/services/orders/webhook/orderHistoryService';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

export const useOrderSubmission = (
  userId: string | undefined,
  items: CartItem[],
  totalAmount: number,
  hasDeliveryInfo: boolean,
  clearCart: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isOnline } = useConnectionStatus();

  const handleSubmit = async (data: DeliveryFormValues) => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    if (!isOnline) {
      toast({
        title: "You are offline",
        description: "Please connect to the internet to place an order",
        variant: "destructive"
      });
      return;
    }

    if (isSubmitting) {
      console.log("Submission already in progress, ignoring duplicate submission");
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (!userId) {
        setIsSubmitting(false);
        throw new Error("You must be logged in to place an order");
      }

      // Save delivery information
      await saveDeliveryInfo(userId, data, hasDeliveryInfo);
      
      // Create the order with initial PENDING status
      const insertedOrder = await createOrder(userId, data, items, totalAmount, OrderStatus.PENDING);
      
      if (!insertedOrder || !insertedOrder.id) {
        throw new Error("Failed to create order - no order ID returned");
      }
      
      // Create order items
      await createOrderItems(insertedOrder.id, items);
      
      // Save user location if provided
      if (data.latitude && data.longitude && data.deliveryMethod === "delivery") {
        await saveUserLocation(userId, data.latitude, data.longitude);
        
        console.log('Sending order to webhook for restaurant assignment...');
        const webhookResult = await sendOrderToWebhook(
          insertedOrder.id,
          data.latitude,
          data.longitude
        );
        
        if (!webhookResult.success) {
          console.error('Webhook call failed:', webhookResult.error);
          // Even if webhook fails, record the order history
          await recordOrderHistory(
            insertedOrder.id,
            'webhook_failed',
            null,
            { error: webhookResult.error }
          );
        }
      }
      
      // Always record the order creation in history
      await recordOrderHistory(
        insertedOrder.id,
        'created',
        null,
        { 
          total: insertedOrder.total,
          delivery_method: data.deliveryMethod,
          items_count: items.length
        },
        undefined,
        userId,
        'customer'
      );
      
      toast({
        title: "Order placed successfully",
        description: `Your order has been placed successfully`,
      });
      
      clearCart();
      navigate(`/order-confirmation/${insertedOrder.id}`);
    } catch (error: any) {
      console.error("Order submission error:", error);
      setIsSubmitting(false);
      toast({
        title: "Error placing order",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
