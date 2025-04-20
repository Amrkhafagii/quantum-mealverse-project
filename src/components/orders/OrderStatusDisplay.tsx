
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cancelOrder } from '@/services/orders/orderService';

interface AssignmentStatus {
  status: string;
  assigned_restaurant_id?: string;
  assignment_id?: string;
  expires_at?: string;
  attempt_count: number;
}

interface OrderStatusDisplayProps {
  order: any;
  assignmentStatus: AssignmentStatus | null;
  onOrderUpdate?: () => void;
}

export const OrderStatusDisplay: React.FC<OrderStatusDisplayProps> = ({ 
  order, 
  assignmentStatus,
  onOrderUpdate 
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (!assignmentStatus?.expires_at || order?.status !== 'awaiting_restaurant') return;
    
    const expiresAt = new Date(assignmentStatus.expires_at).getTime();
    const totalTime = 5 * 60; // 5 minutes in seconds
    
    const updateTimer = () => {
      const now = Date.now();
      const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(secondsLeft);
      
      const progressValue = (secondsLeft / totalTime) * 100;
      setProgress(progressValue);
    };
    
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    
    return () => {
      clearInterval(timerInterval);
    };
  }, [assignmentStatus?.expires_at, order?.status]);

  const handleCancelOrder = async () => {
    if (!order?.id || isCancelling) return;
    
    setIsCancelling(true);
    try {
      await cancelOrder(order.id);
      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled successfully."
      });
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel the order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderOrderStatus = () => {
    if (!order) return null;
    
    let statusMessage = '';
    let statusDetails = '';
    
    switch (order.status) {
      case 'pending':
        statusMessage = 'Finding a restaurant to fulfill your order...';
        if (assignmentStatus?.attempt_count) {
          statusDetails = `Attempt ${assignmentStatus.attempt_count} of 3`;
        }
        break;
      case 'awaiting_restaurant':
        statusMessage = 'A restaurant is reviewing your order...';
        statusDetails = timeLeft > 0 ? `Restaurant has ${formatTime(timeLeft)} to respond` : 'Waiting for response';
        break;
      case 'processing':
        statusMessage = 'Your order is being prepared!';
        break;
      case 'on_the_way':
        statusMessage = 'Your order is on the way to you!';
        break;
      case 'delivered':
        statusMessage = 'Your order has been delivered. Enjoy!';
        break;
      case 'cancelled':
        statusMessage = 'Your order has been cancelled.';
        break;
      case 'assignment_failed':
        statusMessage = "We couldn't find a restaurant for your order right now.";
        statusDetails = 'Your order has been automatically cancelled.';
        break;
      case 'no_restaurants_available':
        statusMessage = 'No restaurants available in your area.';
        statusDetails = 'Please try a different delivery address or try again later.';
        break;
      default:
        statusMessage = `Order Status: ${order.status}`;
    }
    
    return (
      <div className="space-y-2">
        <p className="text-lg">{statusMessage}</p>
        {statusDetails && <p className="text-sm text-gray-400">{statusDetails}</p>}
        
        {order.status === 'awaiting_restaurant' && (
          <div className="space-y-4">
            {timeLeft > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Restaurant response time:</span>
                  </div>
                  <span>{formatTime(timeLeft)}</span>
                </div>
                <Progress value={progress} className="h-2 bg-gray-700" />
              </div>
            )}
            <Button 
              variant="destructive" 
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="w-full"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          </div>
        )}
        
        {/* Display assignment attempt count regardless of status */}
        {(order.status === 'pending' || order.status === 'awaiting_restaurant') && assignmentStatus?.attempt_count > 0 && (
          <p className="text-sm text-gray-400 mt-2">
            Assignment attempt: {assignmentStatus.attempt_count} of 3
          </p>
        )}
      </div>
    );
  };

  return renderOrderStatus();
};
