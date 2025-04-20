
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cancelOrder } from '@/services/orders/orderService';

interface CancelOrderButtonProps {
  orderId: string;
  onOrderUpdate: () => void;
}

export const CancelOrderButton: React.FC<CancelOrderButtonProps> = ({ 
  orderId, 
  onOrderUpdate 
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();

  const handleCancel = async () => {
    if (!orderId || isCancelling) return;
    
    setIsCancelling(true);
    try {
      await cancelOrder(orderId);
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully."
      });
      onOrderUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel the order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleCancel}
      disabled={isCancelling}
      className="w-full mt-2"
    >
      {isCancelling ? 'Cancelling...' : 'Cancel Order'}
    </Button>
  );
};
