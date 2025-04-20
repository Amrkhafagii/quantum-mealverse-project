
import { useState, useEffect } from 'react';
import { sendOrderToWebhook } from '@/services/orders/webhookService';
import { useToast } from '@/hooks/use-toast';

export const useOrderTimer = (
  expiresAt: string | undefined,
  orderId: string | undefined,
  onExpire?: () => void
) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  const { toast } = useToast();
  
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
        if (secondsLeft === 0) {
          console.log('Timer expired, attempting reassignment...');
          try {
            // Use default coordinates for London if no location is available
            // This ensures the reassignment always has coordinates to work with
            const defaultLat = 51.5074;
            const defaultLng = -0.1278;
            
            // Try to get location from local storage
            let latitude = defaultLat;
            let longitude = defaultLng;
            
            const locationString = localStorage.getItem('lastKnownLocation');
            if (locationString) {
              try {
                const locationData = JSON.parse(locationString);
                if (locationData.latitude && locationData.longitude) {
                  latitude = locationData.latitude;
                  longitude = locationData.longitude;
                  console.log('Using stored location:', { latitude, longitude });
                }
              } catch (err) {
                console.warn('Error parsing stored location, using defaults:', err);
              }
            } else {
              console.log('No stored location found, using default coordinates');
            }
            
            // Send the reassignment webhook with the coordinates we have
            const result = await sendOrderToWebhook(orderId, latitude, longitude);
            
            if (result.success) {
              console.log('Reassignment webhook sent successfully:', result);
              toast({
                title: "Checking other restaurants",
                description: "Looking for another restaurant to fulfill your order...",
              });
            } else {
              console.error('Error in reassignment:', result.error);
              toast({
                title: "Reassignment issue",
                description: "There was a problem finding another restaurant. We're still trying.",
                variant: "destructive"
              });
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
  }, [expiresAt, orderId, onExpire, toast]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    progress,
    formattedTime: formatTime(timeLeft)
  };
};
