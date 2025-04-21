
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkExpiredAssignments, forceExpireAssignments } from '@/services/orders/webhookService';
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

    // Debug logs to help diagnose timezone issues
    console.log('Timer initialization for order:', orderId);
    console.log('expiresAt (raw):', expiresAt);
    console.log('expiresAt (parsed):', expiresAtDate.toISOString());
    console.log('Current time:', new Date().toISOString());
    console.log('Time difference (ms):', expiresAtTime - Date.now());
    console.log('Time difference (seconds):', Math.floor((expiresAtTime - Date.now()) / 1000));

    // If the timestamp is already in the past, expire immediately
    if (expiresAtTime < Date.now()) {
      console.log(`Timer already expired for order ${orderId}`);
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

      // Log periodic checks to help diagnose expiration issues
      if (secondsLeft <= 300 && secondsLeft % 30 === 0) {
        console.log(`Timer check for order ${orderId}: ${secondsLeft} seconds left`);
        console.log(`Current time: ${new Date().toISOString()}, Expiry time: ${expiresAt}`);
      }

      // If the timer has just expired (secondsLeft is 0 and we haven't set isExpired yet)
      if (secondsLeft === 0 && !isExpired) {
        console.log(`⏰ TIMER EXPIRED for order ${orderId} at ${new Date().toISOString()}`);
        console.log(`Expiry time was: ${expiresAt}`);
        setIsExpired(true);
        
        // Log the timer expiration
        await logApiCall('timer-expired', {
          orderId, 
          expiresAt, 
          currentTime: new Date().toISOString()
        }, null);
        
        // First attempt: Try to force expiration directly in the database
        try {
          console.log('🔄 Directly forcing assignment expiration for order:', orderId);
          const result = await forceExpireAssignments(orderId);
          console.log('Direct force expiration result:', result);
          
          // Log the result
          await logApiCall('direct-expired-assignments', { orderId }, result);
          
          // If direct method fails, try the webhook method as backup
          if (!result.success) {
            console.log('🔄 Direct method failed, trying webhook...');
            const webhookResult = await checkExpiredAssignments();
            console.log('Webhook expired assignments check result:', webhookResult);
            
            // Log the result
            await logApiCall('expired-assignments-webhook', { orderId }, webhookResult);
          }
        } catch (error) {
          console.error('❌ Error handling expired assignment:', error);
          
          // Last resort: Try one more time with a delay
          setTimeout(async () => {
            try {
              console.log('🔄 Final attempt to force expiration for order:', orderId);
              const finalResult = await forceExpireAssignments(orderId);
              console.log('Final force expiration result:', finalResult);
            } catch (finalError) {
              console.error('❌ Final attempt also failed:', finalError);
            }
          }, 2000);
        }
      }
    };

    // Immediately check and update on mount/dependency change
    updateTimer();

    const timerInterval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(timerInterval);
    };
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
