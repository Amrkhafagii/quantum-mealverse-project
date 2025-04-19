
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryFormValues } from '@/hooks/useDeliveryForm';
import { handleAuthSubmit } from '@/services/auth/authCheckout';
import { useToast } from "@/components/ui/use-toast";

interface DeliveryInfoDB {
  address: string;
  city: string;
  created_at: string;
  full_name: string;
  id: string;
  phone: string;
  updated_at: string;
  user_id: string;
}

export const useCheckoutAuth = () => {
  const { toast } = useToast();
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [hasDeliveryInfo, setHasDeliveryInfo] = useState(false);
  const [defaultValues, setDefaultValues] = useState<Partial<DeliveryFormValues>>({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setShowLoginPrompt(true);
          return;
        }
        
        if (session?.user) {
          setLoggedInUser(session.user);
          
          try {
            const { data: locationData } = await supabase
              .from('user_locations')
              .select('*')
              .eq('user_id', session.user.id)
              .order('timestamp', { ascending: false })
              .limit(1)
              .maybeSingle();
              
            const { data: deliveryInfo } = await supabase
              .from('delivery_info')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();
              
            if (deliveryInfo) {
              setHasDeliveryInfo(true);
              
              const latitude = locationData?.latitude || 0;
              const longitude = locationData?.longitude || 0;
              
              setDefaultValues({
                ...deliveryInfo,
                email: session.user.email || "",
                fullName: (deliveryInfo as any).full_name,
                latitude: latitude,
                longitude: longitude,
                deliveryMethod: "delivery" as const,
                paymentMethod: "cash" as const
              });
            } else if (session.user.email) {
              const latitude = locationData?.latitude || 0;
              const longitude = locationData?.longitude || 0;
              
              setDefaultValues({
                email: session.user.email,
                latitude: latitude,
                longitude: longitude,
                deliveryMethod: "delivery" as const,
                paymentMethod: "cash" as const
              });
            }
          } catch (error) {
            setShowLoginPrompt(true);
          }
        } else {
          setShowLoginPrompt(true);
        }
      } catch (error) {
        setShowLoginPrompt(true);
      }
    };
    
    checkLoginStatus();
    
    return () => {};
  }, []);

  return {
    loggedInUser,
    hasDeliveryInfo,
    defaultValues,
    showLoginPrompt,
    handleAuthSubmit: (data: any) => {
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
