
import React from 'react';
import { Building, Clock } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { CircularTimer } from '@/components/orders/status/CircularTimer';
import { Button } from "@/components/ui/button";
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import { OrderTimer } from '@/components/orders/status/OrderTimer';

interface OrderRestaurantStatusProps {
  status: string;
  restaurantName?: string;
  assignmentStatus: any;
  isCancelling: boolean;
  onCancel: () => void;
  orderId?: string; // Adding orderId prop
}

export const OrderRestaurantStatus: React.FC<OrderRestaurantStatusProps> = ({
  status,
  restaurantName,
  assignmentStatus,
  isCancelling,
  onCancel,
  orderId // Receive the orderId prop
}) => {
  const { timeLeft, totalTime } = useCountdownTimer(assignmentStatus?.expires_at);
  const getProgressValue = () => {
    if (!assignmentStatus) return 33.33;
    const { attempt_count } = assignmentStatus;
    return ((3 - attempt_count + 1) / 3) * 100;
  };
  
  if (!['pending', 'awaiting_restaurant'].includes(status)) return null;

  const handleTimerExpire = () => {
    console.log('Timer expired, refreshing order status...');
    // We don't have onOrderUpdate here, but we could potentially refresh data another way
  };

  return (
    <div className="space-y-6 py-4">
      {restaurantName && (
        <div className="flex items-center justify-center gap-2 text-quantum-cyan">
          <Building className="h-5 w-5" />
          <span className="text-lg">{restaurantName}</span>
        </div>
      )}

      <div className="max-w-md mx-auto space-y-6">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2 text-gray-300">
            <Clock className="h-5 w-5" />
            <span>Waiting for confirmation from Restaurant...</span>
          </div>
          <div className="flex justify-between w-full text-sm mb-2">
            <span></span>
            <span>Attempt {assignmentStatus?.attempt_count || 1} of 3</span>
          </div>
          
          {assignmentStatus?.expires_at && (
            <div className="w-full mb-6">
              <OrderTimer 
                expiresAt={assignmentStatus.expires_at} 
                orderId={orderId}
                onTimerExpire={handleTimerExpire}
              />
            </div>
          )}

          <Progress 
            value={getProgressValue()} 
            className="h-2 w-full bg-gradient-to-r from-quantum-cyan to-quantum-purple" 
          />
        </div>

        <Button 
          variant="destructive" 
          className="w-full" 
          onClick={onCancel}
          disabled={isCancelling}
        >
          {isCancelling ? 'Cancelling...' : 'Cancel Order'}
        </Button>
      </div>
    </div>
  );
};
