
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { cancelOrderWithOfflineSupport } from '@/services/sync/syncService';

interface CancelOrderButtonProps {
  orderId: string;
  onCancelOrder?: () => void;
}

export const CancelOrderButton: React.FC<CancelOrderButtonProps> = ({ orderId, onCancelOrder }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isOnline } = useConnectionStatus();

  const handleCancel = async () => {
    setIsLoading(true);
    
    try {
      const result = await cancelOrderWithOfflineSupport(orderId);
      
      if (result) {
        toast({
          title: isOnline ? 'Order cancelled' : 'Order will be cancelled when online',
          description: isOnline 
            ? 'Your order has been cancelled successfully.' 
            : 'Your request has been queued and will be processed when you are back online.',
          variant: 'default',
        });
        
        if (onCancelOrder) {
          onCancelOrder();
        }
      } else {
        toast({
          title: 'Cancellation failed',
          description: 'There was an error cancelling your order. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: 'Cancellation failed',
        description: 'There was an error cancelling your order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setDialogOpen(false);
    }
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Cancel Order
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-quantum-darkBlue border-quantum-cyan/20">
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Order</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this order? {!isOnline && 'You are currently offline. This action will be processed when you are back online.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleCancel();
            }}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Yes, Cancel Order'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
