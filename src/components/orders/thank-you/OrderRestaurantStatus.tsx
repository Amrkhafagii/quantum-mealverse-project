
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
      assignmentStatus
    });
    if (assignmentStatus) {
      console.log('Assignment status details:', assignmentStatus);
      if (assignmentStatus.expires_at) {
        try {
          const expiresDate = new Date(assignmentStatus.expires_at);
          const now = new Date();
          const isValid = !isNaN(expiresDate.getTime());
          const timeRemaining = isValid ? Math.floor((expiresDate.getTime() - now.getTime()) / 1000) : null;
          console.log('Expiry time analysis:', {
            expires_at: assignmentStatus.expires_at,
            parsed: isValid ? expiresDate.toISOString() : 'INVALID DATE',
            currentTime: now.toISOString(),
            isValid,
            isFuture: isValid && expiresDate > now,
            timeRemaining: timeRemaining !== null ? `${timeRemaining}s` : 'N/A'
          });
        } catch (error) {
          console.error('Error analyzing expiry time:', error);
        }
      } else {
        console.log('No expires_at found in assignment status');
      }
    }
  }, [status, assignmentStatus, orderId]);

  if (!['pending', 'awaiting_restaurant'].includes(status)) return null;

  const handleTimerExpire = () => {
    console.log('Timer expired, refreshing order status...');
  };

  // More robust check for valid expiry time
  const hasValidExpiryTime = Boolean(
    assignmentStatus?.expires_at && 
    !isNaN(new Date(assignmentStatus.expires_at).getTime()) &&
    new Date(assignmentStatus.expires_at) > new Date()
  );

  console.log('Timer visibility check:', { 
    hasValidExpiryTime, 
    expiryTime: assignmentStatus?.expires_at
  });

  // Only show the restaurant name if there's an actual assigned restaurant
  // that has accepted the order (not just a pending assignment)
  const showRestaurantName = restaurantName && 
                            status !== 'pending' && 
                            status !== 'awaiting_restaurant' && 
                            assignmentStatus?.status !== 'awaiting_response';

  return (
    <div className="space-y-6 py-4">
      {showRestaurantName && (
        <div className="flex items-center justify-center gap-2 text-quantum-cyan">
          <Building className="h-5 w-5" />
          <span className="text-lg">{restaurantName}</span>
        </div>
      )}

      <div className="max-w-md mx-auto space-y-6">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2 text-gray-300">
            <Clock className="h-5 w-5" />
            <span>Waiting for a restaurant to accept your order...</span>
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
              {assignmentStatus?.status === 'awaiting_response' ? 
                "Reaching out to nearby restaurants..." : 
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
