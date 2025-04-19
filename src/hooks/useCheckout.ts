
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryFormValues } from '@/components/checkout/DeliveryForm';
import { handleAuthSubmit } from '@/services/auth/authCheckout';
import { 
  saveDeliveryInfo, 
  createOrder, 
  createOrderItems,
  saveUserLocation 
} from '@/services/orders/orderService';
import { AuthFormData } from '@/types/auth';

export const useCheckout = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [hasDeliveryInfo, setHasDeliveryInfo] = useState(false);
  const [defaultValues, setDefaultValues] = useState<Partial<DeliveryFormValues>>({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      console.log("Checking login status");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log("User is logged in:", session.user.email);
        setLoggedInUser(session.user);
        
        const { data: deliveryInfo } = await supabase
          .from('delivery_info')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (deliveryInfo) {
          console.log("User has delivery info:", deliveryInfo);
          setHasDeliveryInfo(true);
          setDefaultValues({
            ...deliveryInfo,
            email: session.user.email || "",
            fullName: deliveryInfo.full_name,
          });
        } else if (session.user.email) {
          console.log("User has no delivery info, setting email default only");
          setDefaultValues({
            email: session.user.email
          });
        }
      } else {
        console.log("User is not logged in, showing login prompt");
        setShowLoginPrompt(true);
      }
    };
    
    checkLoginStatus();
  }, []);

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
      if (!loggedInUser?.id) {
        console.log("❌ No logged in user ID found");
        setIsSubmitting(false);
        throw new Error("You must be logged in to place an order");
      }

      console.log("Step 1: Saving delivery info");
      try {
        await saveDeliveryInfo(loggedInUser.id, data, hasDeliveryInfo);
      } catch (saveDeliveryError) {
        console.error("%c ❌ ERROR SAVING DELIVERY INFO", "background: #F44336; color: white; padding: 4px; font-weight: bold;");
        console.error("Detailed error:", saveDeliveryError);
        console.error("Error details:", JSON.stringify(saveDeliveryError, null, 2));
        throw new Error(`Failed to save delivery info: ${saveDeliveryError.message}`);
      }
      
      console.log("Step 2: Creating order");
      let insertedOrder;
      try {
        insertedOrder = await createOrder(loggedInUser.id, data, items, totalAmount);
        console.log("Order creation response:", insertedOrder);
      } catch (createOrderError) {
        console.error("%c ❌ ERROR CREATING ORDER", "background: #F44336; color: white; padding: 4px; font-weight: bold;");
        console.error("Detailed error:", createOrderError);
        console.error("Error details:", JSON.stringify(createOrderError, null, 2));
        throw new Error(`Failed to create order: ${createOrderError.message}`);
      }
      
      if (!insertedOrder || !insertedOrder.id) {
        console.error("%c ❌ NO ORDER ID RETURNED", "background: #F44336; color: white; padding: 4px; font-weight: bold;");
        console.error("Returned order data:", insertedOrder);
        throw new Error("Failed to create order - no order ID returned");
      }
      
      console.log("Step 3: Creating order items");
      try {
        await createOrderItems(insertedOrder.id, items);
      } catch (itemsError) {
        console.error("%c ❌ ERROR CREATING ORDER ITEMS", "background: #F44336; color: white; padding: 4px; font-weight: bold;");
        console.error("Detailed error:", itemsError);
        console.error("Error details:", JSON.stringify(itemsError, null, 2));
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }
      
      if (data.latitude && data.longitude) {
        console.log("Step 4: Saving user location");
        try {
          await saveUserLocation(loggedInUser.id, data.latitude, data.longitude);
          
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
              // We still continue with the order process even if the webhook fails
            }
          } catch (webhookError) {
            console.error("%c ⚠️ WEBHOOK ERROR", "background: #FF9800; color: black; padding: 4px; font-weight: bold;");
            console.error("Error calling webhook:", webhookError);
            console.error("Error details:", JSON.stringify(webhookError, null, 2));
            // Continue with order process even if webhook fails
          }
        } catch (locationError) {
          console.error("%c ⚠️ LOCATION SAVING ERROR", "background: #FF9800; color: black; padding: 4px; font-weight: bold;");
          console.error("Error saving location:", locationError);
          console.error("Error details:", JSON.stringify(locationError, null, 2));
          // Continue with the order process even if location saving fails
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
      console.error("Detailed error:", error);
      if (error.error?.details) {
        console.error("Database error details:", error.error.details);
      }
      if (error.error?.message) {
        console.error("Database error message:", error.error.message);
      }
      if (error.error?.code) {
        console.error("Database error code:", error.error.code);
      }
      if (error.errors) {
        console.error("Validation errors:", error.errors);
      }
      console.error("Error stack:", error.stack);
      console.error("Full error object:", JSON.stringify(error, (key, value) => {
        if (value instanceof Error) {
          return {
            message: value.message,
            stack: value.stack,
            ...value
          };
        }
        return value;
      }, 2));
      
      setIsSubmitting(false); // Make sure to reset submission state on error
      toast({
        title: "Error placing order",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Log state changes for debugging
  useEffect(() => {
    console.log("useCheckout isSubmitting state changed:", isSubmitting);
  }, [isSubmitting]);

  return {
    items,
    isSubmitting,
    loggedInUser,
    hasDeliveryInfo,
    defaultValues,
    showLoginPrompt,
    handleAuthSubmit: (data: AuthFormData) => 
      handleAuthSubmit(data, {
        setLoggedInUser,
        setShowLoginPrompt,
        setHasDeliveryInfo,
        setDefaultValues,
        toast
      }),
    handleSubmit
  };
};
