
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

export const useLocationTracker = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  const { toast } = useToast();

  // Memoize this function to prevent re-renders
  const locationIsValid = useCallback(() => {
    if (!lastUpdateTime) return false;
    const timeDiff = Date.now() - lastUpdateTime;
    return timeDiff < 600000; // 10 minutes in milliseconds
  }, [lastUpdateTime]);

  const getCurrentLocation = useCallback(() => {
    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            // Store location in localStorage with timestamp
            localStorage.setItem('userLocation', JSON.stringify({
              ...newLocation,
              timestamp: Date.now()
            }));

            setLocation(newLocation);
            setLastUpdateTime(Date.now());

            // Store in Supabase if user is authenticated
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user) {
                await supabase.from('user_locations').insert({
                  user_id: session.user.id,
                  latitude: newLocation.latitude,
                  longitude: newLocation.longitude,
                  source: 'checkout'
                });
              }
            } catch (err) {
              console.error("Error saving location to database:", err);
              // Continue even if DB save fails - local save is enough
            }

            resolve(newLocation);
          },
          (error) => {
            reject(error);
          },
          { timeout: 10000, enableHighAccuracy: true } // Add timeout to prevent hanging
        );
      } else {
        reject(new Error("Geolocation is not supported"));
      }
    });
  }, []);

  useEffect(() => {
    // Check for stored location on mount
    try {
      const storedLocation = localStorage.getItem('userLocation');
      if (storedLocation) {
        const { latitude, longitude, timestamp } = JSON.parse(storedLocation);
        const timeDiff = Date.now() - timestamp;
        
        if (timeDiff < 600000) { // 10 minutes
          setLocation({ latitude, longitude });
          setLastUpdateTime(timestamp);
        } else {
          localStorage.removeItem('userLocation');
        }
      }
    } catch (error) {
      console.error("Error reading location from storage:", error);
      localStorage.removeItem('userLocation');
    }
  }, []);

  return {
    location,
    getCurrentLocation,
    locationIsValid,
    lastUpdateTime
  };
};
