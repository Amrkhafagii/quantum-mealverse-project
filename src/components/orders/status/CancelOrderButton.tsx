
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/services/supabaseClient';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { queueOfflineAction } from '@/utils/offlineStorage/actionsService';

interface CancelOrderButtonProps {
  orderId: string;
  onCancel?: () => void;
}

const CancelOrderButton: React.FC<CancelOrderButtonProps> = ({ orderId, onCancel }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { isOnline } = useConnectionStatus();

  const handleCancelOrder = async () => {
    try {
      setIsCancelling(true);
      
      if (isOnline) {
        // Online flow - update directly in the database
        const { error } = await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId);

        if (error) throw error;

        toast({
          title: "Order cancelled",
          description: "Your order has been cancelled successfully",
        });
      } else {
        // Offline flow - queue the action for later sync
        await queueOfflineAction({
          type: 'cancel_order',
          payload: { orderId }
        });

        toast({
          title: "Order queued for cancellation",
          description: "Your order will be cancelled when you're back online",
        });
      }
      
      // Call the onCancel callback if provided
      if (onCancel) {
        onCancel();
      }
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error",
        description: "There was a problem cancelling your order",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        onClick={() => setIsConfirmOpen(true)}
        className="w-full mt-4"
      >
        Cancel Order
      </Button>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelOrder}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Yes, cancel order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CancelOrderButton;
