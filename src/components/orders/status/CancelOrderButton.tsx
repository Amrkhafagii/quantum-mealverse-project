
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { queueOfflineAction } from '@/utils/offlineStorage/actionsService';
import { cancelOrderWithOfflineSupport } from '@/utils/offlineStorage/index';

interface CancelOrderButtonProps {
  orderId: string;
  onCancelSuccess?: () => void;
}

const CancelOrderButton: React.FC<CancelOrderButtonProps> = ({ orderId, onCancelSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isOnline } = useConnectionStatus();
  
  const { mutate: cancelOrder, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      if (isOnline) {
        // Online: Call Supabase function to cancel the order
        const { error } = await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId);
        
        if (error) {
          console.error("Error cancelling order:", error);
          throw new Error("Failed to cancel order");
        }
        
        return true;
      } else {
        // Offline: Queue the action
        await queueOfflineAction({
          type: 'cancel_order',
          payload: { orderId },
        });
        
        // Optimistically update the UI
        await cancelOrderWithOfflineSupport(orderId);
        
        return true;
      }
    },
    onSuccess: async () => {
      toast({
        title: "Order Cancelled",
        description: "Your order has been successfully cancelled.",
      });
      
      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey: ['active-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['past-orders'] });
      await queryClient.invalidateQueries({ queryKey: ['order-details', orderId] });
      
      // Execute callback if provided
      if (onCancelSuccess) {
        onCancelSuccess();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel order. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  return (
    <Button 
      variant="destructive" 
      onClick={() => cancelOrder()}
      disabled={isLoading}
    >
      {isLoading ? 'Cancelling...' : 'Cancel Order'}
    </Button>
  );
};

export default CancelOrderButton;
