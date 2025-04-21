
import { useState, useEffect } from 'react';
import { sendOrderToWebhook } from '@/services/orders/webhookService';

export const useOrderTimer = (
  expiresAt: string | undefined,
  orderId: string | undefined,
  onExpire?: () => void
) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    console.log('OrderTimer Hook: Starting with expiresAt:', expiresAt, 'orderId:', orderId);

    if (!expiresAt || !orderId) {
      console.warn('Missing required data for timer:', { expiresAt, orderId });
      return;
    }

    try {
      // Parse the expiration date and validate it
      const expiresAtDate = new Date(expiresAt);
      const expiresAtTime = expiresAtDate.getTime();

      if (isNaN(expiresAtTime)) {
        console.error('Invalid expiration time format:', expiresAt);
        return;
      }

      console.log(`Timer initialized: Will expire at ${expiresAtDate.toISOString()}`);

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
          console.log(`Timer update: ${secondsLeft}s left, ${progressValue.toFixed(1)}% progress`);
        }

        // When timer hits zero, trigger the webhook for reassignment
        if (secondsLeft === 0 && !isExpired) {
          setIsExpired(true);
          console.log('Timer expired, attempting reassignment...');
          try {
            // Get location from local storage
            const locationData = localStorage.getItem('lastKnownLocation');

            if (!locationData) {
              console.error('No location data available for reassignment');
              return;
            }

            const { latitude, longitude } = JSON.parse(locationData);

            if (latitude && longitude) {
              console.log(`Sending reassignment webhook for order ${orderId} due to timer expiration`);
              // Call sendOrderToWebhook with 3 arguments only, no isExpiredReassignment flag here as original signature has 3 arguments
              await sendOrderToWebhook(orderId, latitude, longitude);
              console.log('Reassignment webhook sent successfully');
            } else {
              console.error('Invalid location data for reassignment:', { latitude, longitude });
            }
          } catch (error) {
            console.error('Error triggering reassignment:', error);
          } finally {
            onExpire?.();
          }
        }
      };

      // Initial update
      updateTimer();

      const timerInterval = setInterval(updateTimer, 1000);

      return () => {
        clearInterval(timerInterval);
      };
    } catch (error) {
      console.error('Error in timer calculation:', error);
    }
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
