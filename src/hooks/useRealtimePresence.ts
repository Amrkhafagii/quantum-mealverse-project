import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from './useAuth';
import { useConnectionStatus } from './useConnectionStatus';
import { Platform } from '@/utils/platform';

interface PresenceState {
  user_id: string;
  online_at: string;
  client_info?: {
    platform: string;
    version?: string;
    timestamp: string;
  };
  [key: string]: any;
}

export function useRealtimePresence(roomName: string, enabled = true) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [presenceState, setPresenceState] = useState<Record<string, PresenceState[]>>({});
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const { user } = useAuth();
  const { isOnline } = useConnectionStatus();
  
  // Create or cleanup channel based on enabled state and online status
  useEffect(() => {
    // Don't create channel if disabled or offline
    if (!enabled || !isOnline || !user?.id) {
      if (channel) {
        console.log(`Removing presence channel for room ${roomName}`);
        supabase.removeChannel(channel);
        setChannel(null);
        setIsTracking(false);
      }
      return;
    }
    
    if (!channel) {
      console.log(`Creating presence channel for room ${roomName}`);
      const newChannel = supabase.channel(roomName);
      
      newChannel
        .on('presence', { event: 'sync' }, () => {
          const state = newChannel.presenceState();
          console.log('Presence synced:', state);
          // Convert the type to match our state type
          setPresenceState(state as unknown as Record<string, PresenceState[]>);
          
          // Extract user IDs from presence state
          const users = Object.values(state).flatMap(
            presences => presences.map((p: any) => p.user_id)
          );
          setOnlineUsers([...new Set(users)]); // Remove duplicates
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        });
      
      setChannel(newChannel);
    }
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        setChannel(null);
        setIsTracking(false);
      }
    };
  }, [roomName, enabled, user?.id, isOnline]);
  
  // Start tracking presence
  const startTracking = useCallback(async (customState = {}) => {
    if (!channel || !user?.id) return false;
    
    try {
      setIsTracking(true);
      const status = await channel.subscribe(async (status) => {
        console.log('Presence subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          const trackStatus = await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
            client_info: {
              platform: Platform.getPlatformName(),
              version: '1.0.0',
              timestamp: new Date().toISOString(),
            },
            ...customState
          });
          console.log('Presence track status:', trackStatus);
        }
      });
      return true;
    } catch (error) {
      console.error('Error tracking presence:', error);
      setIsTracking(false);
      return false;
    }
  }, [channel, user]);
  
  // Update tracking status with new state
  const updateState = useCallback(async (customState = {}) => {
    if (!channel || !user?.id || !isTracking) return false;
    
    try {
      const trackStatus = await channel.track({
        user_id: user.id,
        online_at: new Date().toISOString(),
        client_info: {
          platform: Platform.getPlatformName(),
          version: '1.0.0',
          timestamp: new Date().toISOString(),
        },
        ...customState
      });
      console.log('Presence track update status:', trackStatus);
      return true;
    } catch (error) {
      console.error('Error updating presence state:', error);
      return false;
    }
  }, [channel, user, isTracking]);
  
  // Stop tracking presence
  const stopTracking = useCallback(async () => {
    if (!channel) return;
    
    try {
      await channel.untrack();
      setIsTracking(false);
      return true;
    } catch (error) {
      console.error('Error untracking presence:', error);
      return false;
    }
  }, [channel]);
  
  return {
    presenceState,
    onlineUsers,
    isTracking,
    startTracking,
    updateState,
    stopTracking
  };
}
