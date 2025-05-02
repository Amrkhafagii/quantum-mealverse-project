import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryLocation } from '@/types/delivery-assignment';
import { toast } from './use-toast';

interface RealtimeLocationOptions {
  assignmentId?: string;
  onLocationUpdate?: (location: DeliveryLocation) => void;
}

export const useRealtimeLocation = ({ 
  assignmentId, 
  onLocationUpdate 
}: RealtimeLocationOptions) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [latestLocation, setLatestLocation] = useState<DeliveryLocation | null>(null);
  const [locationHistory, setLocationHistory] = useState<DeliveryLocation[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Don't subscribe if no assignment ID is provided
    if (!assignmentId) {
      setIsSubscribed(false);
      return () => {};
    }

    // Set up the real-time subscription
    const channel = supabase
      .channel('public:delivery_locations')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'delivery_locations',
          filter: `assignment_id=eq.${assignmentId}` 
        }, 
        (payload) => {
          console.log('New location update received:', payload);
          const newLocation = payload.new as DeliveryLocation;
          
          // Update state with latest location
          setLatestLocation(newLocation);
          
          // Add to history (keeping most recent locations)
          setLocationHistory(prev => {
            const updated = [newLocation, ...prev].slice(0, 50); // Keep last 50 points
            return updated;
          });
          
          // Call the callback if provided
          if (onLocationUpdate) {
            onLocationUpdate(newLocation);
          }
        })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          toast({
            title: 'Live tracking enabled',
            description: 'You are now receiving real-time location updates',
            duration: 3000,
          });
        } else if (status === 'CHANNEL_ERROR') {
          setError(new Error('Failed to subscribe to real-time updates'));
          toast({
            title: 'Live tracking error',
            description: 'Could not connect to real-time updates',
            variant: 'destructive',
          });
        }
      });

    // Clean up subscription on unmount
    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [assignmentId, onLocationUpdate]);

  return {
    isSubscribed,
    latestLocation,
    locationHistory,
    error
  };
};
