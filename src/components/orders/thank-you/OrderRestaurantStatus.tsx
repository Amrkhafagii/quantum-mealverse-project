
import React, { useEffect } from 'react';
import { Building, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { OrderTimer } from '@/components/orders/status/OrderTimer';

interface OrderRestaurantStatusProps {
  status: string;
  restaurantName?: string;
  assignmentStatus: any;
  isCancelling: boolean;
  onCancel: () => void;
  orderId?: string;
}

export const OrderRestaurantStatus: React.FC<OrderRestaurantStatusProps> = ({
  status,
  restaurantName,
  assignmentStatus,
  isCancelling,
  onCancel,
  orderId
}) => {
  useEffect(() => {
    console.log('OrderRestaurantStatus: Rendering with', { 
      orderId,
      status,
      assignmentStatus,
      hasExpiryTime: Boolean(assignmentStatus?.expires_at)
    });
    
    // Log details about expires_at if present
    if (assignmentStatus?.expires_at) {
      try {
        const expiresDate = new Date(assignmentStatus.expires_at);
        console.log('Expiry time details:', {
          expires_at: assignmentStatus.expires_at,
          parsed: expiresDate.toISOString(),
          isValid: !isNaN(expiresDate.getTime()),
          timeRemaining: Math.floor((expiresDate.getTime() - Date.now()) / 1000)
        });
      } catch (error) {
        console.error('Error parsing expiry time:', error);
      }
    }
  }, [status, assignmentStatus, orderId]);

  if (!['pending', 'awaiting_restaurant'].includes(status)) return null;

  const handleTimerExpire = () => {
    console.log('Timer expired, refreshing order status...');
  };

  // Check if we have a valid expires_at that's in the future
  const hasValidExpiryTime = Boolean(
    assignmentStatus?.expires_at && 
    !isNaN(new Date(assignmentStatus.expires_at).getTime()) &&
    new Date(assignmentStatus.expires_at) > new Date()
  );

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
          
          {hasValidExpiryTime ? (
            <div className="w-full mb-6">
              <OrderTimer 
                expiresAt={assignmentStatus.expires_at} 
                orderId={orderId}
                onTimerExpire={handleTimerExpire}
              />
            </div>
          ) : (
            <div className="text-sm text-gray-400 mb-6">
              {assignmentStatus ? 
                "Restaurant is being contacted..." : 
                "Preparing to contact nearby restaurants..."}
            </div>
          )}
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
