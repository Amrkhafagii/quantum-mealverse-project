
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthService } from '@/services/auth/AuthService';
import { DeliveryFormValues } from '@/hooks/useDeliveryForm';
import { useToast } from '@/hooks/use-toast';

interface AuthFormData {
  email: string;
  password: string;
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
        const sessionResult = await AuthService.getSession();
        
        if (!sessionResult.success || !sessionResult.user) {
          setShowLoginPrompt(true);
          setIsLoadingUserData(false);
          return;
        }

        const user = sessionResult.user;
        setLoggedInUser(user);

        // Get user delivery info and previous orders
        const [deliveryResult, previousOrders] = await Promise.all([
          AuthService.getUserDeliveryInfo(user.id),
          AuthService.getUserPreviousOrders(user.id)
        ]);

        const { deliveryInfo, locationData } = deliveryResult;

        // Build default values from available data
        if (deliveryInfo) {
          setHasDeliveryInfo(true);
          
          const deliveryMethodCast = previousOrders?.delivery_method === "delivery" || previousOrders?.delivery_method === "pickup" 
            ? (previousOrders.delivery_method as "delivery" | "pickup") 
            : "delivery" as const;
            
          const paymentMethodCast = previousOrders?.payment_method === "cash" || previousOrders?.payment_method === "visa" 
            ? (previousOrders.payment_method as "cash" | "visa") 
            : "cash" as const;
          
          setDefaultValues({
            email: user.email || "",
            fullName: (deliveryInfo as any).full_name,
            phone: (deliveryInfo as any).phone,
            address: (deliveryInfo as any).address,
            city: (deliveryInfo as any).city,
            latitude: locationData?.latitude || 0,
            longitude: locationData?.longitude || 0,
            deliveryMethod: deliveryMethodCast,
            paymentMethod: paymentMethodCast
          });
        } else if (previousOrders) {
          setHasDeliveryInfo(true);
          
          const deliveryMethodCast = previousOrders.delivery_method === "delivery" || previousOrders.delivery_method === "pickup" 
            ? (previousOrders.delivery_method as "delivery" | "pickup") 
            : "delivery" as const;
            
          const paymentMethodCast = previousOrders.payment_method === "cash" || previousOrders.payment_method === "visa" 
            ? (previousOrders.payment_method as "cash" | "visa") 
            : "cash" as const;
          
          setDefaultValues({
            fullName: previousOrders.customer_name,
            email: previousOrders.customer_email || user.email,
            phone: previousOrders.customer_phone,
            address: previousOrders.delivery_address,
            city: previousOrders.city,
            notes: previousOrders.notes || "",
            latitude: locationData?.latitude || 0,
            longitude: locationData?.longitude || 0,
            deliveryMethod: deliveryMethodCast,
            paymentMethod: paymentMethodCast
          });
        } else if (user.email) {
          setDefaultValues({
            email: user.email,
            latitude: locationData?.latitude || 0,
            longitude: locationData?.longitude || 0,
            deliveryMethod: "delivery" as const,
            paymentMethod: "cash" as const
          });
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        setShowLoginPrompt(true);
      } finally {
        setIsLoadingUserData(false);
      }
    };
    
    checkLoginStatus();
  }, []);

  const handleAuthSubmit = async (data: AuthFormData) => {
    try {
      const result = await AuthService.signIn(data);
      
      if (!result.success) {
        // Try to sign up if sign in fails
        const signUpResult = await AuthService.signUp({
          email: data.email,
          password: data.password,
          userType: 'customer'
        });
        
        if (!signUpResult.success) {
          throw new Error(signUpResult.error);
        }
        
        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        });
        return;
      }

      setLoggedInUser(result.user);
      setShowLoginPrompt(false);
      
      if (result.user) {
        // Fetch user data after successful login
        const deliveryResult = await AuthService.getUserDeliveryInfo(result.user.id);
        
        if (deliveryResult.deliveryInfo) {
          setHasDeliveryInfo(true);
          setDefaultValues({
            ...deliveryResult.deliveryInfo,
            email: result.user.email || "",
            fullName: (deliveryResult.deliveryInfo as any).full_name,
          });
        }
      }
      
      toast({
        title: "Login successful",
        description: "You've been logged in successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    loggedInUser,
    hasDeliveryInfo,
    defaultValues,
    showLoginPrompt,
    isLoadingUserData,
    handleAuthSubmit
  };
};
