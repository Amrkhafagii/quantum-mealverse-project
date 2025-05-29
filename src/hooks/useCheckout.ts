
import { useCart } from '@/contexts/CartContext';
import { useCheckoutAuth } from './useCheckoutAuth';
import { useOrderSubmission } from './useOrderSubmission';

export const useCheckout = () => {
  const { items, totalAmount, clearCart, validateCart } = useCart();
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
    items, // Unified CartItem[] structure with restaurant assignments
    totalAmount,
    hasDeliveryInfo,
    clearCart
  );

  // Validate cart items before checkout to ensure consistency
  const handleUnifiedSubmit = async (data: any) => {
    console.log('Unified checkout starting with items:', {
      itemCount: items.length,
      itemsWithRestaurants: items.filter(item => item.restaurant_id).length,
      itemsWithAssignments: items.filter(item => item.assignment_details).length
    });

    // Validate cart structure before submission
    await validateCart();
    
    // Proceed with unified submission
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
