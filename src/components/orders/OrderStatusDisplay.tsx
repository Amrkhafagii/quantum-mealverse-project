
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

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
}

export const OrderStatusDisplay: React.FC<OrderStatusDisplayProps> = ({ order, assignmentStatus }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  
  // Calculate and update countdown timer
  useEffect(() => {
    if (!assignmentStatus?.expires_at || order?.status !== 'awaiting_restaurant') return;
    
    const expiresAt = new Date(assignmentStatus.expires_at).getTime();
    const totalTime = 5 * 60; // 5 minutes in seconds
    
    const updateTimer = () => {
      const now = Date.now();
      const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(secondsLeft);
      
      // Calculate progress percentage (from 100% to 0%)
      const progressValue = (secondsLeft / totalTime) * 100;
      setProgress(progressValue);
      
      if (secondsLeft <= 0) {
        clearInterval(timerInterval);
      }
    };
    
    updateTimer(); // Run immediately
    const timerInterval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(timerInterval);
  }, [assignmentStatus?.expires_at, order?.status]);
  
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
        statusDetails = 'Please try again in a few minutes.';
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
        
        {order.status === 'awaiting_restaurant' && timeLeft > 0 && (
          <div className="space-y-1 mt-2">
            <div className="flex justify-between text-xs">
              <span>Restaurant response time:</span>
              <span>{formatTime(timeLeft)}</span>
            </div>
            <Progress value={progress} className="h-2 bg-gray-700">
              <div className="h-full bg-quantum-cyan" style={{ width: `${progress}%` }} />
            </Progress>
          </div>
        )}
        
        {assignmentStatus?.attempt_count > 0 && order.status !== 'processing' && (
          <p className="text-sm text-gray-400">
            Assignment attempt: {assignmentStatus.attempt_count} of 3
          </p>
        )}
      </div>
    );
  };

  return renderOrderStatus();
};
