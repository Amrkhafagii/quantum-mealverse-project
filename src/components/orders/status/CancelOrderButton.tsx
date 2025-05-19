
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNetworkStatus } from '@/components/providers/NetworkStatusProvider';
import { useToast } from '@/hooks/use-toast';
import { hapticFeedback } from '@/utils/hapticFeedback';

interface CancelOrderButtonProps {
  orderId: string;
}

const CancelOrderButton: React.FC<CancelOrderButtonProps> = ({ orderId }) => {
  const { isOnline } = useNetworkStatus();
  const { toast } = useToast();

  const handleCancelOrder = async () => {
    // Provide haptic feedback
    hapticFeedback.warning();
    
    try {
      if (!isOnline) {
        // If offline, store the cancel request for later
        toast({
          title: "Order cancellation queued",
          description: "Your cancellation request will be processed when you're back online.",
          variant: "default"
        });
        
        // Here you would implement offline support
        // For now, we'll just log it
        console.log('Order cancellation queued for when online:', orderId);
      } else {
        // Process the cancellation online
        toast({
          title: "Cancelling your order",
          description: "Please wait while we process your request...",
          variant: "default"
        });
        
        // Call your API to cancel the order
        // For now, we'll simulate a successful cancellation
        setTimeout(() => {
          toast({
            title: "Order cancelled",
            description: "Your order has been successfully cancelled.",
            variant: "default"
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      toast({
        title: "Error",
        description: "Could not cancel your order. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button 
      variant="outline" 
      className="w-full mt-4 text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
      onClick={handleCancelOrder}
    >
      Cancel Order
    </Button>
  );
};

export default CancelOrderButton;
