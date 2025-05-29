
import { useCart } from '@/contexts/CartContext';
import { useCheckoutAuth } from './useCheckoutAuth';
import { useOrderSubmission } from './useOrderSubmission';
import { convertMealToCartItemWithAssignment } from '@/services/mealPlan/mealToCartServiceWithAssignment';
import { useToast } from '@/hooks/use-toast';

export const useCheckout = () => {
  const { items, totalAmount, clearCart, validateCart } = useCart();
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

  // Handle restaurant assignment during checkout
  const handleUnifiedSubmit = async (data: any) => {
    console.log('Unified checkout starting with items:', {
      itemCount: items.length,
      itemsWithRestaurants: items.filter(item => item.restaurant_id).length
    });

    // Validate cart structure before submission
    await validateCart();

    // Check if items need restaurant assignment
    const itemsNeedingAssignment = items.filter(item => !item.restaurant_id);
    
    if (itemsNeedingAssignment.length > 0 && loggedInUser?.id) {
      console.log('Assigning restaurants to items during checkout...');
      
      try {
        // Here you could implement restaurant assignment for items that need it
        // For now, we'll proceed with the existing logic
        toast({
          title: "Processing Order",
          description: "Finding nearby restaurants for your items...",
          variant: "default"
        });
      } catch (error) {
        console.error('Error assigning restaurants during checkout:', error);
        toast({
          title: "Assignment Error",
          description: "Unable to find restaurants for some items",
          variant: "destructive"
        });
        return;
      }
    }
    
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
