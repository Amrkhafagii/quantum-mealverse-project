
import { useCart } from '@/contexts/CartContext';
import { useCheckoutAuth } from './useCheckoutAuth';
import { useOrderSubmission } from './useOrderSubmission';
import { useToast } from '@/hooks/use-toast';

export const useCheckout = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { toast } = useToast();
  const { 
    loggedInUser, 
    hasDeliveryInfo, 
    defaultValues, 
    showLoginPrompt,
    isLoadingUserData, 
    handleAuthSubmit 
  } = useCheckoutAuth();
  
  const { isSubmitting, handleSubmit } = useOrderSubmission(
    loggedInUser?.id,
    items,
    totalAmount,
    hasDeliveryInfo,
    clearCart
  );

  // Handle order submission without validation checks
  const handleUnifiedSubmit = async (data: any) => {
    console.log('Unified checkout starting with items:', {
      itemCount: items.length
    });

    // Proceed directly with order submission - no validation needed
    await handleSubmit(data);
  };

  return {
    items,
    isSubmitting,
    loggedInUser,
    hasDeliveryInfo,
    defaultValues,
    showLoginPrompt,
    isLoadingUserData,
    handleAuthSubmit,
    handleSubmit: handleUnifiedSubmit
  };
};
