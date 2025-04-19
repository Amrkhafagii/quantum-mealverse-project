
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setLoggedInUser(session.user);
        
        const { data: deliveryInfo } = await supabase
          .from('delivery_info')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (deliveryInfo) {
          setHasDeliveryInfo(true);
          setDefaultValues({
            ...deliveryInfo,
            email: session.user.email || "",
            fullName: deliveryInfo.full_name,
          });
        } else if (session.user.email) {
          setDefaultValues({
            email: session.user.email
          });
        }
      } else {
        setShowLoginPrompt(true);
      }
    };
    
    checkLoginStatus();
  }, []);

  const handleSubmit = async (data: DeliveryFormValues) => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    if (data.deliveryMethod === 'delivery' && (data.latitude === 0 || data.longitude === 0)) {
      toast({
        title: "Location Required",
        description: "Please set your location for delivery",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!loggedInUser?.id) {
        setIsSubmitting(false);
        throw new Error("You must be logged in to place an order");
      }

      await saveDeliveryInfo(loggedInUser.id, data, hasDeliveryInfo);
      const insertedOrder = await createOrder(loggedInUser.id, data, items, totalAmount);
      await createOrderItems(insertedOrder.id, items);
      
      if (data.latitude && data.longitude) {
        await saveUserLocation(loggedInUser.id, data.latitude, data.longitude);
      }
      
      toast({
        title: "Order placed successfully",
        description: `Your order #${insertedOrder.id} has been placed successfully`,
      });
      
      clearCart();
      navigate(`/thank-you?order=${insertedOrder.id}`);
    } catch (error: any) {
      console.error("Order submission error:", error);
      setIsSubmitting(false);
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
    handleAuthSubmit: (data: { email: string; password: string }) => 
      handleAuthSubmit(data, setLoggedInUser, setShowLoginPrompt, setHasDeliveryInfo, setDefaultValues, toast),
    handleSubmit
  };
};
