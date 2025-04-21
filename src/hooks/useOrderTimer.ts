
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
  const [serverTime, setServerTime] = useState<Date | null>(null);

  // First effect: Get server time once to calculate offset
  useEffect(() => {
    const getServerTime = async () => {
      try {
        // Use Supabase to get server time
        const { data, error } = await supabase.rpc('get_server_time');
        if (error) {
          console.error('Error getting server time:', error);
          return;
        }
        
        // Set server time
        if (data) {
          const serverTimeDate = new Date(data);
          console.log('Server time:', serverTimeDate.toISOString());
          console.log('Local time:', new Date().toISOString());
          setServerTime(serverTimeDate);
        }
      } catch (error) {
        console.error('Failed to get server time:', error);
      }
    };

    getServerTime();
  }, []);

  // Second effect: Set up timer based on expiresAt and server time
  useEffect(() => {
    if (!expiresAt || !orderId) {
      return;
    }

    const expiresAtDate = new Date(expiresAt);
    
    if (isNaN(expiresAtDate.getTime())) {
      console.warn('Invalid expiry time format:', expiresAt);
      return;
    }

    console.log('Timer initialization for order:', orderId);
    console.log('expiresAt (raw):', expiresAt);
    console.log('expiresAt (parsed):', expiresAtDate.toISOString());
    console.log('Current local time:', new Date().toISOString());
    
    // Calculate time correctly using server time if available
    const calculateRemainingTime = () => {
      const now = new Date();
      let secondsLeft: number;
      
      // If we have server time, use it to calculate a more accurate time difference
      if (serverTime) {
        // Calculate the offset between local time and server time
        const serverTimeOffset = serverTime.getTime() - new Date().getTime();
        console.log('Server time offset (ms):', serverTimeOffset);
        
        // Adjust our current time by the server offset to get "server now"
        const adjustedNow = new Date(now.getTime() + serverTimeOffset);
        console.log('Adjusted current time (with server offset):', adjustedNow.toISOString());
        
        // Calculate time difference in seconds
        secondsLeft = Math.max(0, Math.floor((expiresAtDate.getTime() - adjustedNow.getTime()) / 1000));
        console.log('Time remaining with server-adjusted time (seconds):', secondsLeft);
      } else {
        // No server time available, use local time (less accurate)
        secondsLeft = Math.max(0, Math.floor((expiresAtDate.getTime() - now.getTime()) / 1000));
        console.log('Time remaining with local time (seconds):', secondsLeft);
      }
      
      return secondsLeft;
    };

    // Initial calculation
    const initialSecondsLeft = calculateRemainingTime();
    
    // If the timer is already expired based on initial calculation
    if (initialSecondsLeft <= 0) {
      console.log(`Timer already expired for order ${orderId}`);
      setTimeLeft(0);
      setProgress(0);
      setIsExpired(true);
      
      // Force expiration if already expired
      const forceExpire = async () => {
        try {
          console.log('Timer already expired, forcing expiration for order:', orderId);
          const result = await forceExpireAssignments(orderId);
          console.log('Force expiration result:', result);
          
          // Log the result
          await logApiCall('initial-expired-force', { orderId }, result);
        } catch (error) {
          console.error('Error forcing expiration on initial check:', error);
        }
      };
      
      forceExpire();
      return;
    }
    
    setTimeLeft(initialSecondsLeft);
    const FIVE_MINUTES = 5 * 60; // 5 minutes in seconds
    setProgress(Math.max(0, Math.min(100, (initialSecondsLeft / FIVE_MINUTES) * 100)));

    const updateTimer = async () => {
      const secondsLeft = calculateRemainingTime();
      setTimeLeft(secondsLeft);

      const progressValue = (secondsLeft / FIVE_MINUTES) * 100;
      setProgress(Math.max(0, Math.min(100, progressValue)));

      // Log periodic checks for debugging
      if (secondsLeft <= 300 && secondsLeft % 30 === 0) {
        console.log(`Timer check for order ${orderId}: ${secondsLeft} seconds left`);
      }

      // When timer expires (becomes 0)
      if (secondsLeft === 0 && !isExpired) {
        console.log(`⏰ TIMER EXPIRED for order ${orderId} at ${new Date().toISOString()}`);
        console.log(`Expiry time was: ${expiresAt}`);
        setIsExpired(true);
        
        // Log the timer expiration
        await logApiCall('timer-expired', {
          orderId, 
          expiresAt, 
          currentTime: new Date().toISOString(),
          serverTime: serverTime?.toISOString() || 'not available'
        }, null);
        
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

    // Set up interval to update the timer
    const timerInterval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, [expiresAt, orderId, isExpired, serverTime]);

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
