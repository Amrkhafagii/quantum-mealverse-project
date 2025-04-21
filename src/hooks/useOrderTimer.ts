
import { useState, useEffect } from 'react';
import { 
  calculateRemainingTime, 
  formatTime, 
  calculateProgress 
} from '@/utils/timer/timerCalculations';
import { useServerTime } from './timer/useServerTime';

export const useOrderTimer = (
  expiresAt: string | undefined,
  orderId: string | undefined
) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const { serverTimeOffset } = useServerTime();

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

    const updateTimer = () => {
      const secondsLeft = calculateRemainingTime(expiresAtDate, serverTimeOffset);
      setTimeLeft(secondsLeft);
      setProgress(calculateProgress(secondsLeft));

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
