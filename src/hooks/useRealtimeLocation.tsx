import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryLocation } from '@/types/delivery-assignment';
import { toast } from './use-toast';
import { useSupabaseChannel } from './useSupabaseChannel';
import { useConnectionStatus } from './useConnectionStatus';
import { Platform } from '@/utils/platform';

interface RealtimeLocationOptions {
  assignmentId?: string;
  onLocationUpdate?: (location: DeliveryLocation) => void;
}

export const useRealtimeLocation = ({ 
  assignmentId, 
  onLocationUpdate 
}: RealtimeLocationOptions) => {
  const [latestLocation, setLatestLocation] = useState<DeliveryLocation | null>(null);
  const [locationHistory, setLocationHistory] = useState<DeliveryLocation[]>([]);
  const { isOnline } = useConnectionStatus();
  const isMobile = Platform.isNative();

  // Use the optimized Supabase channel hook
  const { isSubscribed, error } = useSupabaseChannel({
    channelName: `delivery_locations_${assignmentId || 'none'}`,
    event: 'INSERT',
    table: 'delivery_locations',
    schema: 'public',
    // No user id filter but assignment_id filter (column was not renamed): below is correct!
    filter: assignmentId ? `assignment_id=eq.${assignmentId}` : undefined,
    enabled: !!assignmentId && isOnline,
    onMessage: (payload) => {
      console.log('New location update received:', payload);
      const newLocation = payload.new as DeliveryLocation;
      
      setLatestLocation(newLocation);

      setLocationHistory(prev => {
        const maxPoints = isMobile ? 20 : 50;
        const updated = [newLocation, ...prev].slice(0, maxPoints);
        return updated;
      });

      if (onLocationUpdate) {
        onLocationUpdate(newLocation);
      }
    },
    onError: (err) => {
      console.error('Error in real-time location subscription:', err);
      toast({
        title: 'Live tracking error',
        description: 'Could not connect to real-time updates',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (isSubscribed && assignmentId) {
      toast({
        title: 'Live tracking enabled',
        description: 'You are now receiving real-time location updates',
        duration: 3000,
      });
    }
  }, [isSubscribed, assignmentId]);

  return {
    isSubscribed,
    latestLocation,
    locationHistory,
    error
  };
};
