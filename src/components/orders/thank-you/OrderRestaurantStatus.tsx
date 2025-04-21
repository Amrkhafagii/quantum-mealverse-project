
import React, { useEffect } from 'react';
import { Building, Clock, RefreshCcw } from 'lucide-react';
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
    
    // Debug the assignment status more thoroughly
    if (assignmentStatus) {
      console.log('Assignment status details:', assignmentStatus);
      
      if (assignmentStatus.attempt_count > 1) {
        console.log(`[REASSIGNMENT UI] This is attempt #${assignmentStatus.attempt_count} for order ${orderId}`);
      }
      
      // Examine expires_at if present
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
  
  // Check if this is a reassignment (attempt > 1)
  const isReassignment = assignmentStatus?.attempt_count > 1;
  const attemptCount = assignmentStatus?.attempt_count || 1;
  const attemptsRemaining = 3 - attemptCount;

  return (
    <div className="space-y-6 py-4">
      {restaurantName && (
        <div className="flex items-center justify-center gap-2 text-quantum-cyan">
          <Building className="h-5 w-5" />
          <span className="text-lg">{restaurantName}</span>
          {isReassignment && (
            <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded-full">
              Attempt {attemptCount}/3
            </span>
          )}
        </div>
      )}

      {isReassignment && (
        <div className="bg-blue-900/20 border border-blue-800 rounded-md p-3 text-sm text-center">
          <RefreshCcw className="h-4 w-4 inline mr-1 text-blue-400" />
          <span className="text-blue-300">
            {attemptsRemaining > 0 
              ? `Previous restaurant(s) didn't respond in time. Trying another restaurant (${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining).`
              : 'Final attempt to assign your order to a restaurant.'}
          </span>
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
                attemptCount={assignmentStatus.attempt_count}
                onTimerExpire={handleTimerExpire}
              />
            </div>
          ) : (
            <div className="text-sm text-gray-400 mb-6">
              {assignmentStatus?.status === 'awaiting_response' ? 
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
