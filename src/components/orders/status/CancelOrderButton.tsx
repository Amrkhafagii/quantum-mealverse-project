
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CancelOrderButtonProps {
  orderId: string;
  onCancelOrder?: () => void;
}

export const CancelOrderButton: React.FC<CancelOrderButtonProps> = ({ orderId, onCancelOrder }) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();
  
  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      setIsCancelling(true);
      
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId);
        
        if (error) throw error;
        
        toast({
          title: 'Order cancelled',
          description: 'Your order has been cancelled successfully.',
        });
        
        if (onCancelOrder) {
          onCancelOrder();
        }
      } catch (error) {
        console.error('Error cancelling order:', error);
        toast({
          title: 'Error',
          description: 'There was a problem cancelling your order.',
          variant: 'destructive',
        });
      } finally {
        setIsCancelling(false);
      }
    }
  };
  
  return (
    <Button 
      variant="ghost" 
      className="text-red-500 hover:text-red-700 hover:bg-red-100/10"
      onClick={handleCancel}
      disabled={isCancelling}
      size="sm"
    >
      <X className="w-4 h-4 mr-1" />
      {isCancelling ? 'Cancelling...' : 'Cancel Order'}
    </Button>
  );
};
