
import { useState, useEffect } from 'react';
import { sendOrderToWebhook } from '@/services/orders/webhookService';
import { cancelOrder } from '@/services/orders/orderService';

export const useOrderTimer = (
  expiresAt: string | undefined,
  orderId: string | undefined,
  onExpire?: () => void
) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    if (!expiresAt || !orderId) {
      return;
    }

    const expiresAtDate = new Date(expiresAt);
    const expiresAtTime = expiresAtDate.getTime();

    if (isNaN(expiresAtTime)) {
      return;
    }

    const FIVE_MINUTES = 5 * 60; // 5 minutes in seconds

    const updateTimer = async () => {
      const now = Date.now();
      const secondsLeft = Math.max(0, Math.floor((expiresAtTime - now) / 1000));
      setTimeLeft(secondsLeft);

      const progressValue = (secondsLeft / FIVE_MINUTES) * 100;
      setProgress(Math.max(0, Math.min(100, progressValue)));

      if (secondsLeft === 0 && !isExpired) {
        setIsExpired(true);
        try {
          // First check if any assignments are still pending for this order
          const { data: pendingAssignments } = await supabase
            .from('restaurant_assignments')
            .select('id')
            .eq('order_id', orderId)
            .eq('status', 'pending');
          
          // Only cancel if there are still pending assignments
          if (pendingAssignments && pendingAssignments.length > 0) {
            // First mark all pending assignments as expired
            await supabase
              .from('restaurant_assignments')
              .update({ status: 'expired' })
              .eq('order_id', orderId)
              .eq('status', 'pending');
              
            // Then cancel the order
            await cancelOrder(orderId);
          }
        } finally {
          onExpire?.();
        }
      }
    };

    updateTimer();

    const timerInterval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(timerInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt, orderId, onExpire, isExpired]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    progress,
    formattedTime: formatTime(timeLeft),
    isExpired
  };
};
