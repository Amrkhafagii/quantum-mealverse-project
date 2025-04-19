
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryFormValues } from '@/components/checkout/DeliveryForm';
import { handleAuthSubmit } from '@/services/auth/authCheckout';
import { useToast } from "@/components/ui/use-toast";

// Define the delivery info type from the database
interface DeliveryInfoDB {
  address: string;
  city: string;
  created_at: string;
  full_name: string;
  id: string;
  phone: string;
  updated_at: string;
  user_id: string;
  latitude?: number;
  longitude?: number;
}

export const useCheckoutAuth = () => {
  const { toast } = useToast();
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [hasDeliveryInfo, setHasDeliveryInfo] = useState(false);
  const [defaultValues, setDefaultValues] = useState<Partial<DeliveryFormValues>>({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    console.log("[Place Order Debug] useCheckoutAuth hook initialized");
    
    const checkLoginStatus = async () => {
      console.log("[Place Order Debug] Checking login status");
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[Place Order Debug] Error getting session:", sessionError);
          setShowLoginPrompt(true);
          return;
        }
        
        if (session?.user) {
          console.log("[Place Order Debug] User is logged in:", session.user.email);
          setLoggedInUser(session.user);
          
          try {
            const { data: deliveryInfo, error: deliveryError } = await supabase
              .from('delivery_info')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();
              
            if (deliveryError) {
              console.error("[Place Order Debug] Error fetching delivery info:", deliveryError);
            }
              
            if (deliveryInfo) {
              console.log("[Place Order Debug] User has delivery info:", deliveryInfo);
              setHasDeliveryInfo(true);
              
              // Cast deliveryInfo to our interface
              const typedDeliveryInfo = deliveryInfo as DeliveryInfoDB;
              
              // Initialize with valid coordinates to ensure form validation passes
              setDefaultValues({
                ...typedDeliveryInfo,
                email: session.user.email || "",
                fullName: typedDeliveryInfo.full_name,
                latitude: typedDeliveryInfo.latitude || 0,
                longitude: typedDeliveryInfo.longitude || 0,
                deliveryMethod: "delivery" as const,
                paymentMethod: "cash" as const
              });
              
              console.log("[Place Order Debug] Default values set:", {
                ...typedDeliveryInfo,
                email: session.user.email || "",
                fullName: typedDeliveryInfo.full_name,
                latitude: typedDeliveryInfo.latitude || 0,
                longitude: typedDeliveryInfo.longitude || 0,
                deliveryMethod: "delivery",
                paymentMethod: "cash"
              });
            } else if (session.user.email) {
              console.log("[Place Order Debug] User has no delivery info, setting email default only");
              setDefaultValues({
                email: session.user.email,
                latitude: 0,
                longitude: 0,
                deliveryMethod: "delivery" as const,
                paymentMethod: "cash" as const
              });
            }
          } catch (error) {
            console.error("[Place Order Debug] Unexpected error in delivery info fetch:", error);
          }
        } else {
          console.log("[Place Order Debug] User is not logged in, showing login prompt");
          setShowLoginPrompt(true);
        }
      } catch (error) {
        console.error("[Place Order Debug] Unexpected error in checkLoginStatus:", error);
        setShowLoginPrompt(true);
      }
    };
    
    checkLoginStatus();
    
    // Return cleanup function
    return () => {
      console.log("[Place Order Debug] useCheckoutAuth hook cleanup");
    };
  }, []);

  console.log("[Place Order Debug] Current auth state:", {
    loggedInUser: loggedInUser ? `${loggedInUser.email} (${loggedInUser.id})` : null,
    hasDeliveryInfo,
    showLoginPrompt,
    defaultValuesSet: Object.keys(defaultValues).length > 0
  });

  return {
    loggedInUser,
    hasDeliveryInfo,
    defaultValues,
    showLoginPrompt,
    handleAuthSubmit: (data: any) => {
      console.log("[Place Order Debug] Auth submit handler called with:", data);
      return handleAuthSubmit(data, {
        setLoggedInUser,
        setShowLoginPrompt,
        setHasDeliveryInfo,
        setDefaultValues,
        toast
      });
    }
  };
};
