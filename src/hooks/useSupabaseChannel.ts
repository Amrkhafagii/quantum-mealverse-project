
import { useEffect, useState, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useConnectionStatus } from './useConnectionStatus';

interface UseSupabaseChannelOptions {
  channelName: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  table?: string;
  filter?: string;
  onMessage?: (payload: any) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
  /**
   * Auto-reconnect when coming back online
   */
  autoReconnect?: boolean;
}

export function useSupabaseChannel({
  channelName,
  event = '*',
  schema = 'public',
  table,
  filter,
  onMessage,
  onError,
  enabled = true,
  autoReconnect = true,
}: UseSupabaseChannelOptions) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [status, setStatus] = useState<'SUBSCRIBED' | 'CLOSED' | 'TIMED_OUT' | 'CHANNEL_ERROR' | 'SUBSCRIBED' | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { isOnline } = useConnectionStatus();

  // Function to subscribe to a channel
  const subscribe = () => {
    if (!enabled || !isOnline || channelRef.current) {
      return;
    }

    try {
      const channel = supabase.channel(channelName);
      
      // Configure the channel with postgres changes if table is provided
      if (table) {
        channel.on(
          'postgres_changes' as any, // Type assertion to work around TypeScript error
          {
            event,
            schema,
            table,
            filter,
          },
          (payload) => {
            console.log(`Received ${event} in ${table}:`, payload);
            if (onMessage) {
              onMessage(payload);
            }
          }
        );
      }

      // Subscribe and handle status changes
      channel
        .subscribe((status) => {
          console.log(`Channel ${channelName} status:`, status);
          setStatus(status as any);
          
          if (status === 'SUBSCRIBED') {
            setIsSubscribed(true);
            setError(null);
          } else if (status === 'CHANNEL_ERROR') {
            setIsSubscribed(false);
            const err = new Error(`Failed to subscribe to channel ${channelName}`);
            setError(err);
            if (onError) {
              onError(err);
            }
          }
        });

      channelRef.current = channel;
    } catch (err) {
      console.error(`Error setting up channel ${channelName}:`, err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (onError) {
        onError(error);
      }
    }
  };

  // Function to unsubscribe
  const unsubscribe = () => {
    if (channelRef.current) {
      console.log(`Unsubscribing from channel ${channelName}`);
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setIsSubscribed(false);
      setStatus(null);
    }
  };

  // Effect to handle subscription based on enabled status
  useEffect(() => {
    if (enabled && isOnline) {
      subscribe();
    } else if (!enabled && channelRef.current) {
      unsubscribe();
    }
    
    return () => {
      unsubscribe();
    };
  }, [enabled, isOnline]);

  // Effect to handle reconnection when coming back online
  useEffect(() => {
    if (autoReconnect && isOnline && !channelRef.current && enabled) {
      console.log(`Auto-reconnecting to channel ${channelName}...`);
      subscribe();
    }
  }, [isOnline, autoReconnect]);

  return {
    isSubscribed,
    status,
    error,
    unsubscribe,
    subscribe,
  };
}
