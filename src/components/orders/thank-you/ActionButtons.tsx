
import React from 'react';
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  orderId: string | null;
  onTrackOrder: (id: string) => void;
  onContinueShopping: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  orderId,
  onTrackOrder,
  onContinueShopping
}) => {
  return (
    <div className="space-y-4 pt-6">
      <Button 
        onClick={() => orderId && onTrackOrder(orderId)}
        className="w-full"
      >
        Track Your Order
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={onContinueShopping}
      >
        Continue Shopping
      </Button>
    </div>
  );
};
