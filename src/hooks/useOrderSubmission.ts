
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnectionStatus } from './useConnectionStatus';
import { useToast } from '@/components/ui/use-toast';
import { CartItem } from '@/contexts/CartContext';
import { queueOfflineAction } from '@/utils/offlineStorage';

export const useOrderSubmission = (
  userId: string | undefined,
  items: CartItem[],
  totalAmount: number,
  hasDeliveryInfo: boolean,
  clearCart: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOnline } = useConnectionStatus();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (formData: any) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to complete your order",
        variant: "destructive"
      });
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty. Add some items before checkout.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const orderData = {
        user_id: userId,
        items: items,
        total_amount: totalAmount,
        delivery_info: {
          full_name: formData.fullName,
          address: formData.address,
          city: formData.city,
          zip_code: formData.zipCode,
          phone_number: formData.phoneNumber,
        },
        delivery_method: formData.deliveryMethod,
        payment_method: formData.paymentMethod,
        created_at: new Date().toISOString(),
        status: 'pending'
      };
      
      if (isOnline) {
        // Online submission - would normally send to server
        // For now, simulate success
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
          title: "Order placed successfully",
          description: "Thank you for your order!"
        });
        
        clearCart();
        navigate('/orders');
      } else {
        // Offline submission - queue for later
        queueOfflineAction({
          type: 'CREATE_ORDER',
          payload: orderData
        });
        
        toast({
          title: "Order saved offline",
          description: "Your order will be submitted when you're back online."
        });
        
        clearCart();
        navigate('/');
      }
    } catch (error) {
      console.error("Error during order submission:", error);
      toast({
        title: "Error",
        description: "There was a problem placing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return { isSubmitting, handleSubmit };
};
