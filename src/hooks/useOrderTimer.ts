
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkExpiredAssignments } from '@/services/orders/webhookService';
import { logApiCall } from '@/services/loggerService';

export const useOrderTimer = (
  expiresAt: string | undefined,
  orderId: string | undefined
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
      console.warn('Invalid expiry time format:', expiresAt);
      return;
    }

    // If the timestamp is already in the past, consider it expired immediately
    if (expiresAtTime < Date.now()) {
      console.log(`Timer already expired for order ${orderId}, expires_at: ${expiresAt}`);
      console.log(`Current time: ${new Date().toISOString()}, Expiry time: ${expiresAt}`);
      console.log(`Time difference: ${Math.floor((expiresAtTime - Date.now()) / 1000)} seconds`);
      setTimeLeft(0);
      setProgress(0);
      setIsExpired(true);
      return;
    }

    const FIVE_MINUTES = 5 * 60; // 5 minutes in seconds

    const updateTimer = async () => {
      const now = Date.now();
      const secondsLeft = Math.max(0, Math.floor((expiresAtTime - now) / 1000));
      setTimeLeft(secondsLeft);

      const progressValue = (secondsLeft / FIVE_MINUTES) * 100;
      setProgress(Math.max(0, Math.min(100, progressValue)));

      // If the timer has just expired (secondsLeft is 0 and we haven't set isExpired yet)
      if (secondsLeft === 0 && !isExpired) {
        console.log(`Timer expired for order ${orderId} at ${new Date().toISOString()}`);
        console.log(`Expiry time was: ${expiresAt}`);
        setIsExpired(true);
        
        // Log the timer expiration
        await logApiCall('timer-expired', {
          orderId, 
          expiresAt, 
          currentTime: new Date().toISOString()
        }, null);
        
        // When a timer expires in the UI, trigger the backend check
        try {
          console.log('Triggering expired assignments check on timer expiry');
          const result = await checkExpiredAssignments();
          console.log('Expired assignments check result:', result);
          
          // Log the result
          await logApiCall('expired-assignments-check', { orderId }, result);
          
          if (!result.success) {
            console.warn('Expired check failed:', result.error);
          }
        } catch (error) {
          console.error('Error checking expired assignments:', error);
        }
      }
    };

    // Immediately check and update on mount/dependency change
    updateTimer();

    const timerInterval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(timerInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt, orderId, isExpired]);

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
