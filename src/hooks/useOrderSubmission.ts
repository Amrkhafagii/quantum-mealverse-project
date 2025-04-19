
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { DeliveryFormValues } from '@/components/checkout/DeliveryForm';
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
    console.log("%c 🚀 ORDER SUBMISSION HANDLER CALLED", "background: #FF9800; color: black; padding: 4px; font-weight: bold;");
    console.log("Handle submit called with data:", data);
    
    if (items.length === 0) {
      console.log("❌ Cart is empty, cannot proceed");
      toast({
        title: "Cart is empty",
        description: "Please add some items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    console.log("✅ Setting isSubmitting to true");
    setIsSubmitting(true);
    
    try {
      if (!userId) {
        console.log("❌ No logged in user ID found");
        setIsSubmitting(false);
        throw new Error("You must be logged in to place an order");
      }

      console.log("Step 1: Saving delivery info");
      try {
        await saveDeliveryInfo(userId, data, hasDeliveryInfo);
      } catch (saveDeliveryError) {
        console.error("%c ❌ ERROR SAVING DELIVERY INFO", "background: #F44336; color: white; padding: 4px; font-weight: bold;");
        console.error("Detailed error:", saveDeliveryError);
        throw new Error(`Failed to save delivery info: ${saveDeliveryError.message}`);
      }
      
      console.log("Step 2: Creating order");
      let insertedOrder;
      try {
        insertedOrder = await createOrder(userId, data, items, totalAmount);
        console.log("Order creation response:", insertedOrder);
      } catch (createOrderError) {
        console.error("%c ❌ ERROR CREATING ORDER", "background: #F44336; color: white; padding: 4px; font-weight: bold;");
        console.error("Detailed error:", createOrderError);
        throw new Error(`Failed to create order: ${createOrderError.message}`);
      }
      
      if (!insertedOrder || !insertedOrder.id) {
        console.error("%c ❌ NO ORDER ID RETURNED", "background: #F44336; color: white; padding: 4px; font-weight: bold;");
        throw new Error("Failed to create order - no order ID returned");
      }
      
      console.log("Step 3: Creating order items");
      try {
        await createOrderItems(insertedOrder.id, items);
      } catch (itemsError) {
        console.error("%c ❌ ERROR CREATING ORDER ITEMS", "background: #F44336; color: white; padding: 4px; font-weight: bold;");
        console.error("Detailed error:", itemsError);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }
      
      if (data.latitude && data.longitude) {
        console.log("Step 4: Saving user location");
        try {
          await saveUserLocation(userId, data.latitude, data.longitude);
          
          console.log("Step 5: Sending order to webhook for restaurant assignment");
          try {
            const { sendOrderToWebhook } = await import('@/integrations/webhook');
            const webhookResult = await sendOrderToWebhook(
              insertedOrder.id,
              data.latitude,
              data.longitude
            );
            
            console.log("Webhook result:", webhookResult);
            
            if (!webhookResult.success) {
              console.warn("⚠️ Webhook call failed but continuing order process:", webhookResult.error);
            }
          } catch (webhookError) {
            console.error("%c ⚠️ WEBHOOK ERROR", "background: #FF9800; color: black; padding: 4px; font-weight: bold;");
            console.error("Error calling webhook:", webhookError);
          }
        } catch (locationError) {
          console.error("%c ⚠️ LOCATION SAVING ERROR", "background: #FF9800; color: black; padding: 4px; font-weight: bold;");
          console.error("Error saving location:", locationError);
        }
      } else {
        console.log("⚠️ No location data available for restaurant assignment");
      }
      
      console.log("🎉 Order created successfully:", insertedOrder.id);
      toast({
        title: "Order placed successfully",
        description: `Your order has been placed successfully`,
      });
      
      clearCart();
      navigate(`/thank-you?order=${insertedOrder.id}`);
    } catch (error) {
      console.error("%c ❌ ORDER SUBMISSION ERROR", "background: #F44336; color: white; padding: 4px; font-weight: bold;");
      console.error("Error stack:", error.stack);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      
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
