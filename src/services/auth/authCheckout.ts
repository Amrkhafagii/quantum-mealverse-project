
import { supabase } from '@/integrations/supabase/client';
import { AuthFormData, AuthHandlerParams } from '@/types/auth';

export const handleAuthSubmit = async (
  data: AuthFormData,
  {
    setLoggedInUser,
    setShowLoginPrompt,
    setHasDeliveryInfo,
    setDefaultValues,
    toast
  }: AuthHandlerParams
) => {
  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });
    
    if (signInError) {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password
      });
      
      if (signUpError) throw signUpError;
      
      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
    } else {
      setLoggedInUser(signInData.user);
      setShowLoginPrompt(false);
      
      if (signInData.user) {
        const { data: deliveryInfo } = await supabase
          .from('delivery_info')
          .select('*')
          .eq('user_id', signInData.user.id)
          .maybeSingle();
          
        if (deliveryInfo) {
          setHasDeliveryInfo(true);
          setDefaultValues({
            ...deliveryInfo,
            email: signInData.user.email || "",
            fullName: deliveryInfo.full_name,
          });
        }
      }
      
      toast({
        title: "Login successful",
        description: "You've been logged in successfully.",
      });
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    });
  }
};
