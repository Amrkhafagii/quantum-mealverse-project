
import React from 'react';
import { Building, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { OrderTimer } from '@/components/orders/status/OrderTimer';
import { toast } from 'sonner';
import { checkExpiredAssignments } from '@/services/orders/webhook/expiredAssignments';

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
  if (!['pending', 'awaiting_restaurant'].includes(status)) return null;

  const handleTimerExpire = async () => {
    toast.info("Restaurant response time expired");
    
    // Force a server-side check for expired assignments
    try {
      await checkExpiredAssignments();
    } catch (error) {
      console.error("Error checking expired assignments:", error);
    }
    
    // Force refresh of the assignment data
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const hasValidExpiryTime = Boolean(
    assignmentStatus?.expires_at && 
    !isNaN(new Date(assignmentStatus.expires_at).getTime()) &&
    new Date(assignmentStatus.expires_at) > new Date()
  );

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
