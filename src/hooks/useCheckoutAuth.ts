
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryFormValues } from '@/components/checkout/DeliveryForm';
import { handleAuthSubmit } from '@/services/auth/authCheckout';
import { useToast } from "@/components/ui/use-toast";

export const useCheckoutAuth = () => {
  const { toast } = useToast();
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

  return {
    loggedInUser,
    hasDeliveryInfo,
    defaultValues,
    showLoginPrompt,
    handleAuthSubmit: (data: any) => 
      handleAuthSubmit(data, {
        setLoggedInUser,
        setShowLoginPrompt,
        setHasDeliveryInfo,
        setDefaultValues,
        toast
      })
  };
};
