
import { useCart } from '@/contexts/CartContext';
import { useCheckoutAuth } from './useCheckoutAuth';
import { useOrderSubmission } from './useOrderSubmission';

export const useCheckout = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { 
    loggedInUser, 
    hasDeliveryInfo, 
    defaultValues, 
    showLoginPrompt, 
    handleAuthSubmit 
  } = useCheckoutAuth();
  
  const { isSubmitting, handleSubmit } = useOrderSubmission(
    loggedInUser?.id,
    items,
    totalAmount,
    hasDeliveryInfo,
    clearCart
  );

  return {
    items,
    isSubmitting,
    loggedInUser,
    hasDeliveryInfo,
    defaultValues,
    showLoginPrompt,
    handleAuthSubmit,
    handleSubmit
  };
};
