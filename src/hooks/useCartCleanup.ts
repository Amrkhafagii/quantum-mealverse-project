
import { useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

export const useCartCleanup = (options: {
  validateOnMount?: boolean;
  showNotifications?: boolean;
} = {}) => {
  const { validateCart } = useCart();
  const { toast } = useToast();
  const { validateOnMount = true, showNotifications = true } = options;

  useEffect(() => {
    if (validateOnMount) {
      const performCleanup = async () => {
        try {
          await validateCart();
        } catch (error) {
          console.error('Error during cart cleanup:', error);
          if (showNotifications) {
            toast({
              title: "Cart validation error",
              description: "There was an issue validating your cart. Please refresh and try again.",
              variant: "destructive"
            });
          }
        }
      };

      performCleanup();
    }
  }, [validateOnMount, validateCart, showNotifications, toast]);

  return { validateCart };
};
