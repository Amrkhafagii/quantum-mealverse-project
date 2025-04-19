
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
    console.log("Handle submit called with data:", data);
    
    if (items.length === 0) {
      console.log("Cart is empty, cannot proceed");
      toast({
        title: "Cart is empty",
        description: "Please add some items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    console.log("Setting isSubmitting to true");
    setIsSubmitting(true);
    
    try {
      if (!loggedInUser?.id) {
        console.log("No logged in user ID found");
        setIsSubmitting(false);
        throw new Error("You must be logged in to place an order");
      }

      console.log("Saving delivery info");
      await saveDeliveryInfo(loggedInUser.id, data, hasDeliveryInfo);
      
      console.log("Creating order");
      const insertedOrder = await createOrder(loggedInUser.id, data, items, totalAmount);
      
      console.log("Creating order items");
      await createOrderItems(insertedOrder.id, items);
      
      if (data.latitude && data.longitude) {
        console.log("Saving user location");
        await saveUserLocation(loggedInUser.id, data.latitude, data.longitude);
      }
      
      console.log("Order created successfully:", insertedOrder.id);
      toast({
        title: "Order placed successfully",
        description: `Your order #${insertedOrder.id} has been placed successfully`,
      });
      
      clearCart();
      navigate(`/thank-you?order=${insertedOrder.id}`);
    } catch (error: any) {
      console.error("Order submission error:", error);
      setIsSubmitting(false); // Make sure to reset submission state on error
      toast({
        title: "Error placing order",
        description: error.message,
        variant: "destructive"
      });
    }
  };

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
