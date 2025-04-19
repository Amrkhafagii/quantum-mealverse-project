
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryFormValues } from '@/hooks/useDeliveryForm';
import { handleAuthSubmit } from '@/services/auth/authCheckout';
import { useToast } from "@/components/ui/use-toast";
import { Order } from '@/types/order';

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
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      setIsLoadingUserData(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setShowLoginPrompt(true);
          setIsLoadingUserData(false);
          return;
        }
        
        if (session?.user) {
          setLoggedInUser(session.user);
          
          try {
            // First check if user has delivery info
            const { data: deliveryInfo } = await supabase
              .from('delivery_info')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

            // Get user location data
            const { data: locationData } = await supabase
              .from('user_locations')
              .select('*')
              .eq('user_id', session.user.id)
              .order('timestamp', { ascending: false })
              .limit(1)
              .maybeSingle();
              
            // If no delivery info, check previous orders
            const { data: previousOrders } = await supabase
              .from('orders')
              .select('*')
              .eq('user_id', session.user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            
            // Prioritize using delivery information
            if (deliveryInfo) {
              setHasDeliveryInfo(true);
              
              const latitude = locationData?.latitude || 0;
              const longitude = locationData?.longitude || 0;
              
              // Properly cast delivery and payment methods to the expected types
              const deliveryMethodCast = (previousOrders?.delivery_method || "delivery") as "delivery" | "pickup";
              const paymentMethodCast = (previousOrders?.payment_method || "cash") as "cash" | "visa";
              
              setDefaultValues({
                email: session.user.email || "",
                fullName: (deliveryInfo as DeliveryInfoDB).full_name,
                phone: (deliveryInfo as DeliveryInfoDB).phone,
                address: (deliveryInfo as DeliveryInfoDB).address,
                city: (deliveryInfo as DeliveryInfoDB).city,
                latitude: latitude,
                longitude: longitude,
                deliveryMethod: deliveryMethodCast,
                paymentMethod: paymentMethodCast
              });
            } else if (previousOrders) {
              // If no delivery info but there are previous orders, use order information
              setHasDeliveryInfo(true);
              
              const latitude = locationData?.latitude || 0;
              const longitude = locationData?.longitude || 0;
              
              // Cast string types to the specific union types required
              const deliveryMethodCast = (previousOrders.delivery_method || "delivery") as "delivery" | "pickup";
              const paymentMethodCast = (previousOrders.payment_method || "cash") as "cash" | "visa";
              
              setDefaultValues({
                fullName: previousOrders.customer_name,
                email: previousOrders.customer_email || session.user.email,
                phone: previousOrders.customer_phone,
                address: previousOrders.delivery_address,
                city: previousOrders.city,
                notes: previousOrders.notes || "",
                latitude: latitude,
                longitude: longitude,
                deliveryMethod: deliveryMethodCast,
                paymentMethod: paymentMethodCast
              });
            } else if (session.user.email) {
              // Fallback to just email if no previous data exists
              const latitude = locationData?.latitude || 0;
              const longitude = locationData?.longitude || 0;
              
              setDefaultValues({
                email: session.user.email,
                latitude: latitude,
                longitude: longitude,
                deliveryMethod: "delivery",
                paymentMethod: "cash"
              });
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            setShowLoginPrompt(true);
          }
        } else {
          setShowLoginPrompt(true);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setShowLoginPrompt(true);
      } finally {
        setIsLoadingUserData(false);
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
    isLoadingUserData,
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
