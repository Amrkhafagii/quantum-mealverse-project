
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Platform } from '@/utils/platform';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceState {
  user_id: string;
  timestamp: number;
  status: 'online' | 'away' | 'offline';
  platform: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export function useRealtimePresence(options: { 
  channelName?: string;
  updateInterval?: number;
  includeLocation?: boolean;
  enabled?: boolean;
} = {}) {
  const {
    channelName = 'presence',
    updateInterval = 30000, // 30 seconds
    includeLocation = false,
    enabled = true
  } = options;
  
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Record<string, PresenceState>>({});
  const [presenceChannel, setPresenceChannel] = useState<RealtimeChannel | null>(null);
  
  // Setup realtime presence subscription
  useEffect(() => {
    if (!user || !enabled) return;
    
    // Create initial presence state
    const initialState: PresenceState = {
      user_id: user.id,
      timestamp: Date.now(),
      status: 'online',
      platform: Platform.getPlatformName(),
    };
    
    // Add location if enabled
    if (includeLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          initialState.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        },
        (err) => {
          console.warn('Could not get user location for presence:', err);
        }
      );
    }
    
    // Create and subscribe to presence channel
    const channel = supabase.channel(`${channelName}:${user.id}`)
      .on('presence', { event: 'sync' }, () => {
        // Get current state of all users in the channel
        const state = channel.presenceState();
        const newState: Record<string, PresenceState> = {};
        
        // Process all users' presence data
        Object.keys(state).forEach(key => {
          const userPresence = state[key][0] as PresenceState;
          newState[userPresence.user_id] = userPresence;
        });
        
        setOnlineUsers(newState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const presence = newPresences[0] as PresenceState;
        console.log('User joined:', presence.user_id, 'on', presence.platform);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const presence = leftPresences[0] as PresenceState;
        console.log('User left:', presence.user_id, 'from', presence.platform);
      });
    
    // Track presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(initialState);
        setPresenceChannel(channel);
      }
    });
    
    // Update presence state periodically
    const intervalId = setInterval(async () => {
      if (channel) {
        const updatedState: PresenceState = {
          user_id: user.id,
          timestamp: Date.now(),
          status: document.visibilityState === 'visible' ? 'online' : 'away',
          platform: Platform.getPlatformName(),
        };
        
        // Update location if enabled
        if (includeLocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000,
                maximumAge: 60000,
              });
            });
            
            updatedState.location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
          } catch (err) {
            console.warn('Could not update location for presence:', err);
          }
        }
        
        await channel.track(updatedState);
      }
    }, updateInterval);
    
    // Cleanup
    return () => {
      clearInterval(intervalId);
      if (channel) {
        channel.untrack();
        supabase.removeChannel(channel);
      }
    };
  }, [user, enabled, channelName, updateInterval, includeLocation]);
  
  // Update status when page visibility changes
  useEffect(() => {
    if (!presenceChannel || !user) return;
    
    const handleVisibilityChange = async () => {
      await presenceChannel.track({
        user_id: user.id,
        timestamp: Date.now(),
        status: document.visibilityState === 'visible' ? 'online' : 'away',
        platform: Platform.getPlatformName(),
      });
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [presenceChannel, user]);
  
  return {
    onlineUsers,
    currentUser: user ? onlineUsers[user.id] : undefined,
    updatePresence: async (status: 'online' | 'away' | 'offline') => {
      if (!presenceChannel || !user) return;
      
      await presenceChannel.track({
        user_id: user.id,
        timestamp: Date.now(),
        status,
        platform: Platform.getPlatformName(),
      });
    }
  };
}
