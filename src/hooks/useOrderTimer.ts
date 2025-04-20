
import { useState, useEffect } from 'react';
import { sendOrderToWebhook } from '@/services/orders/webhookService';

export const useOrderTimer = (
  expiresAt: string | undefined,
  orderId: string | undefined,
  onExpire?: () => void
) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  const [hasExpired, setHasExpired] = useState<boolean>(false);
  
  useEffect(() => {
    console.log('OrderTimer Hook: Starting useEffect with expiresAt:', expiresAt);
    
    if (!expiresAt || !orderId) {
      console.warn('Missing required data for timer:', { expiresAt, orderId });
      return;
    }
    
    try {
      const expiresAtTime = new Date(expiresAt).getTime();
      if (isNaN(expiresAtTime)) {
        console.error('Invalid expiration time format:', expiresAt);
        return;
      }
      
      // Reset expired state when we get a new timer
      setHasExpired(false);
      
      const FIVE_MINUTES = 5 * 60; // 5 minutes in seconds
      
      const updateTimer = async () => {
        const now = Date.now();
        const secondsLeft = Math.max(0, Math.floor((expiresAtTime - now) / 1000));
        setTimeLeft(secondsLeft);
        
        // Calculate progress as percentage of time remaining from 5 minutes
        const progressValue = (secondsLeft / FIVE_MINUTES) * 100;
        setProgress(Math.max(0, Math.min(100, progressValue)));
        
        // Log timer info periodically
        if (secondsLeft % 10 === 0 || secondsLeft <= 10) {
          console.log(`Timer update: Expires at ${new Date(expiresAtTime).toISOString()}, ${secondsLeft}s left, ${progressValue.toFixed(1)}% progress`);
        }

        // When timer hits zero, trigger the webhook for reassignment
        if (secondsLeft === 0 && !hasExpired) {
          console.log('Timer expired, attempting reassignment...');
          setHasExpired(true);
          
          try {
            // Get location from local storage
            const location = localStorage.getItem('lastKnownLocation');
            const { latitude, longitude } = location ? JSON.parse(location) : { latitude: null, longitude: null };
            
            console.log('Attempting reassignment with location:', { latitude, longitude });
            
            const result = await sendOrderToWebhook(orderId, latitude, longitude);
            console.log('Reassignment webhook response:', result);
            
            if (result.success) {
              console.log('Reassignment webhook sent successfully');
            } else {
              console.error('Error in reassignment:', result.error);
            }
          } catch (error) {
            console.error('Error triggering reassignment:', error);
          }
          
          onExpire?.();
        }
      };
      
      updateTimer();
      const timerInterval = setInterval(updateTimer, 1000);
      
      return () => {
        clearInterval(timerInterval);
      };
    } catch (error) {
      console.error('Error in timer calculation:', error);
    }
  }, [expiresAt, orderId, onExpire, hasExpired]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    progress,
    formattedTime: formatTime(timeLeft),
    hasExpired
  };
};
