
import { useCart } from '@/contexts/CartContext';
import { useCheckoutAuth } from './useCheckoutAuth';
import { useOrderSubmission } from './useOrderSubmission';
import { useOrderStore } from '@/stores/orderStore';

export const useCheckout = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { isCreatingOrder, orderError } = useOrderStore();
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

  const handleUnifiedSubmit = async (data: any) => {
    console.log('useCheckout: Starting unified checkout with items:', {
      itemCount: items.length,
      totalAmount,
      hasFlexibleItems: items.some(item => item.assignment_source === 'nutrition_generation')
    });

    await handleSubmit(data);
  };

  return {
    items,
    isSubmitting: isSubmitting || isCreatingOrder,
    loggedInUser,
    hasDeliveryInfo,
    defaultValues,
    showLoginPrompt,
    isLoadingUserData,
    orderError,
    handleAuthSubmit,
    handleSubmit: handleUnifiedSubmit
  };
};
