
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { AuthFormData } from '@/types/auth';

export const useCheckoutAuth = () => {
  const { user: authUser, login } = useAuth();
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [hasDeliveryInfo, setHasDeliveryInfo] = useState<boolean>(false);
  const [defaultValues, setDefaultValues] = useState<any>({
    email: '',
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
    phoneNumber: '',
    deliveryMethod: 'standard',
    paymentMethod: 'card',
  });
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(true);
  const { toast } = useToast();

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      setIsLoadingUserData(true);
      
      if (authUser) {
        setLoggedInUser(authUser);
        setDefaultValues(prev => ({
          ...prev,
          email: authUser.email || '',
          fullName: authUser.displayName || '',
        }));
        
        // Check if user has delivery info saved
        // For now, let's just assume they don't have info saved
        setHasDeliveryInfo(false);
      } else {
        setShowLoginPrompt(true);
      }
      
      setIsLoadingUserData(false);
    };
    
    checkUser();
  }, [authUser]);

  const handleAuthSubmit = async (data: AuthFormData) => {
    try {
      await login(data.email, data.password);
      
      toast({
        title: "Login successful",
        description: "You've been logged in successfully.",
      });
      
      setShowLoginPrompt(false);
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
    handleAuthSubmit,
    setLoggedInUser,
    setShowLoginPrompt,
    setHasDeliveryInfo,
    setDefaultValues
  };
};
