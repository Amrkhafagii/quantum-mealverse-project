
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
    if (!expiresAt || !orderId) {
      return;
    }

    try {
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
            const locationData = localStorage.getItem('lastKnownLocation');
            if (!locationData) {
              return;
            }

            const { latitude, longitude } = JSON.parse(locationData);

            if (latitude && longitude) {
              await sendOrderToWebhook(orderId, latitude, longitude);
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
    } catch (error) {}
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
