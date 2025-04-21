
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkExpiredAssignments, forceExpireAssignments } from '@/services/orders/webhookService';
import { logApiCall } from '@/services/loggerService';
import { createUnitTest } from '@/services/testLogger/unitTestLogger';

const orderTimerTest = createUnitTest('useOrderTimer');

export const useOrderTimer = (
  expiresAt: string | undefined,
  orderId: string | undefined
) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [serverTime, setServerTime] = useState<Date | null>(null);
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);

  // First effect: Get server time once to calculate offset
  useEffect(() => {
    const getServerTime = async () => {
      try {
        const testResponse = await orderTimerTest(
          'getServerTime function call',
          async () => {
            const response = await supabase.functions.invoke('get-server-time', {
              method: 'POST',
            });
            
            if (response.error) {
              throw response.error;
            }
            
            return response.data;
          }
        );

        const response = await supabase.functions.invoke('get-server-time', {
          method: 'POST',
        });
        
        if (response.error) {
          console.error('Error getting server time:', response.error);
          return;
        }
        
        // Set server time with proper type checking
        if (response.data && response.data.timestamp) {
          try {
            // Parse the ISO string to ensure it's a valid date
            const serverTimeDate = new Date(response.data.timestamp);
            console.log('Server time:', serverTimeDate.toISOString());
            console.log('Local time:', new Date().toISOString());
            setServerTime(serverTimeDate);
            
            // Calculate and store the offset separately
            const offset = serverTimeDate.getTime() - new Date().getTime();
            console.log('Server time offset (ms):', offset);
            setServerTimeOffset(offset);
          } catch (parseError) {
            console.error('Error parsing server time:', parseError);
          }
        } else {
          console.warn('No timestamp in server response:', response.data);
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
    
    // Calculate time correctly using server time offset
    const calculateRemainingTime = () => {
      const now = new Date();
      let secondsLeft: number;
      
      // Always use the server time offset to get more accurate time
      const adjustedNow = new Date(now.getTime() + serverTimeOffset);
      console.log('Adjusted current time (with server offset):', adjustedNow.toISOString());
      
      // Calculate time difference in seconds
      secondsLeft = Math.max(0, Math.floor((expiresAtDate.getTime() - adjustedNow.getTime()) / 1000));
      console.log('Time remaining with server-adjusted time (seconds):', secondsLeft);
      
      return secondsLeft;
    };

    // Initial calculation
    const initialSecondsLeft = calculateRemainingTime();
    
    // If the timer is already expired based on initial calculation
    if (initialSecondsLeft <= 0) {
      console.log(`⏰ Timer already expired for order ${orderId}`);
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
          
          // If direct force method fails, try the webhook
          if (!result.success) {
            console.log('Direct method failed, trying webhook...');
            const webhookResult = await checkExpiredAssignments();
            console.log('Webhook expired assignments check result:', webhookResult);
          }
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
      
      // When timer is about to expire (30 seconds or less), start checking more frequently
      if (secondsLeft <= 30 && secondsLeft > 0 && !isExpired) {
        console.log(`⏰ Timer about to expire for order ${orderId} in ${secondsLeft} seconds...`);
        
        // Pre-check if assignments are still pending and need to be expired
        const preCheckExpired = async () => {
          try {
            // Verify if there are still pending assignments that need to be expired
            const { data } = await supabase
              .from('restaurant_assignments')
              .select('count')
              .eq('order_id', orderId)
              .eq('status', 'pending')
              .count();
              
            const pendingCount = data?.[0]?.count || 0;
            console.log(`Pre-check: ${pendingCount} pending assignments for order ${orderId}`);
            
            if (pendingCount > 0) {
              console.log('Preemptively checking for expirations...');
              await checkExpiredAssignments();
            }
          } catch (error) {
            console.error('Error in pre-check for expired assignments:', error);
          }
        };
        
        preCheckExpired();
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
          serverTime: serverTime?.toISOString() || 'not available',
          serverTimeOffset
        }, null);
        
        // Multiple expiration methods for redundancy
        
        // Method 1: Direct database update via forceExpireAssignments
        try {
          console.log('🔄 Method 1: Directly forcing assignment expiration for order:', orderId);
          const result = await forceExpireAssignments(orderId);
          console.log('Method 1 result:', result);
          await logApiCall('expire-method1', { orderId }, result);
          
          // Method 2: Webhook check if method 1 fails or as additional verification
          if (!result.success) {
            console.log('🔄 Method 1 failed, trying Method 2: webhook...');
            const webhookResult = await checkExpiredAssignments();
            console.log('Method 2 result:', webhookResult);
            await logApiCall('expire-method2', { orderId }, webhookResult);
          }
        } catch (error) {
          console.error('❌ Error in Method 1:', error);
          
          // Method 2: Webhook check (as backup)
          try {
            console.log('🔄 Method 2: Checking expired assignments via webhook');
            const webhookResult = await checkExpiredAssignments();
            console.log('Method 2 result:', webhookResult);
            await logApiCall('expire-method2-backup', { orderId }, webhookResult);
          } catch (webhookError) {
            console.error('❌ Error in Method 2:', webhookError);
          }
          
          // Method 3: Last resort - direct database update with delay
          setTimeout(async () => {
            try {
              console.log('🔄 Method 3: Final attempt to force expiration for order:', orderId);
              const finalResult = await forceExpireAssignments(orderId);
              console.log('Method 3 result:', finalResult);
              await logApiCall('expire-method3', { orderId }, finalResult);
            } catch (finalError) {
              console.error('❌ Final attempt also failed:', finalError);
            }
          }, 2000);
        }
        
        // Method 4: Double check with another delay to ensure assignments were updated
        setTimeout(async () => {
          try {
            console.log('🔄 Method 4: Verification check for pending assignments');
            const { data } = await supabase
              .from('restaurant_assignments')
              .select('id, status, expires_at')
              .eq('order_id', orderId)
              .eq('status', 'pending');
              
            if (data && data.length > 0) {
              console.log(`Found ${data.length} pending assignments that should be expired. Forcing update.`);
              const forceResult = await forceExpireAssignments(orderId);
              console.log('Method 4 result:', forceResult);
              await logApiCall('expire-method4', { orderId }, forceResult);
            } else {
              console.log('No pending assignments found in verification check.');
            }
          } catch (error) {
            console.error('❌ Error in verification check:', error);
          }
        }, 5000);
      }
    };

    // Set up interval to update the timer
    const timerInterval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, [expiresAt, orderId, isExpired, serverTime, serverTimeOffset]);

  const formatTime = (seconds: number): string => {
    const timeStr = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
    
    const testFormatTime = async () => {
      await orderTimerTest(
        'formatTime function',
        async () => timeStr,
        timeStr
      );
    };

    testFormatTime();
    return timeStr;
  };

  return {
    timeLeft,
    progress,
    formattedTime: formatTime(timeLeft),
    isExpired
  };
};
