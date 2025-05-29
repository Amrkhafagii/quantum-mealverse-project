
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

  // Phase 6: Integrated checkout flow without validation stops
  const handleUnifiedSubmit = async (data: any) => {
    console.log('Phase 6: Starting integrated checkout with items:', {
      itemCount: items.length,
      totalAmount,
      hasFlexibleItems: items.some(item => item.assignment_source === 'nutrition_generation')
    });

    // Phase 6: Direct order submission - no validation barriers
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
