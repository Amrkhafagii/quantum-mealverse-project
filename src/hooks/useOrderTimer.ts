
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkExpiredAssignments } from '@/services/orders/webhookService';
import { useServerTime } from './timer/useServerTime';
import { useExpiredAssignments } from './timer/useExpiredAssignments';
import { 
  calculateRemainingTime, 
  formatTime, 
  calculateProgress 
} from '@/utils/timer/timerCalculations';

export const useOrderTimer = (
  expiresAt: string | undefined,
  orderId: string | undefined
) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const { serverTimeOffset } = useServerTime();

  // Use the extracted expired assignments hook
  useExpiredAssignments(orderId, expiresAt, isExpired);

  // Timer logic
  useEffect(() => {
    if (!expiresAt || !orderId) return;

    const expiresAtDate = new Date(expiresAt);
    
    if (isNaN(expiresAtDate.getTime())) {
      console.warn('Invalid expiry time format:', expiresAt);
      return;
    }

    console.log('Timer initialization for order:', orderId);
    console.log('expiresAt (raw):', expiresAt);
    console.log('expiresAt (parsed):', expiresAtDate.toISOString());
    
    // Initial calculation
    const initialSecondsLeft = calculateRemainingTime(expiresAtDate, serverTimeOffset);
    
    if (initialSecondsLeft <= 0) {
      console.log(`⏰ Timer already expired for order ${orderId}`);
      setTimeLeft(0);
      setProgress(0);
      setIsExpired(true);
      return;
    }
    
    setTimeLeft(initialSecondsLeft);
    setProgress(calculateProgress(initialSecondsLeft));

    const updateTimer = async () => {
      const secondsLeft = calculateRemainingTime(expiresAtDate, serverTimeOffset);
      setTimeLeft(secondsLeft);
      setProgress(calculateProgress(secondsLeft));

      if (secondsLeft <= 30 && secondsLeft > 0 && !isExpired) {
        console.log(`⏰ Timer about to expire for order ${orderId} in ${secondsLeft} seconds...`);
        
        try {
          const { data } = await supabase
            .from('restaurant_assignments')
            .select('id')
            .eq('order_id', orderId)
            .eq('status', 'pending');
            
          const pendingCount = data?.length || 0;
          
          if (pendingCount > 0) {
            console.log('Preemptively checking for expirations...');
            await checkExpiredAssignments();
          }
        } catch (error) {
          console.error('Error in pre-check for expired assignments:', error);
        }
      }

      if (secondsLeft === 0 && !isExpired) {
        console.log(`⏰ TIMER EXPIRED for order ${orderId} at ${new Date().toISOString()}`);
        setIsExpired(true);
      }
    };

    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [expiresAt, orderId, isExpired, serverTimeOffset]);

  return {
    timeLeft,
    progress,
    formattedTime: formatTime(timeLeft),
    isExpired
  };
};
