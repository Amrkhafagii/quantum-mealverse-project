import { supabase } from '@/integrations/supabase/client';
import { Platform } from '@/utils/platform';

interface UserPresenceState {
  user_id: string;
  online_at: string;
  client_info: {
    platform: string;
    version?: string;
    timestamp: string;
  };
  [key: string]: any;
}

class PresenceManager {
  private static instance: PresenceManager;
  private channels: Map<string, { channel: any, state: UserPresenceState }> = new Map();
  
  private constructor() {
    // Private constructor to enforce singleton
    window.addEventListener('beforeunload', () => {
      this.cleanupAllChannels();
    });
  }
  
  public static getInstance(): PresenceManager {
    if (!PresenceManager.instance) {
      PresenceManager.instance = new PresenceManager();
    }
    return PresenceManager.instance;
  }
  
  /**
   * Join a presence channel
   * @param channelName Name of the channel
   * @param userId User ID
   * @param additionalState Any additional state to track
   * @returns Success status
   */
  public async joinChannel(channelName: string, userId: string, additionalState: Record<string, any> = {}): Promise<boolean> {
    if (this.channels.has(channelName)) {
      console.log(`Already in channel ${channelName}`);
      return true;
    }
    
    try {
      const presenceState: UserPresenceState = {
        user_id: userId,
        online_at: new Date().toISOString(),
        client_info: {
          platform: Platform.getPlatformName(),
          version: '1.0.0',
          timestamp: new Date().toISOString(),
        },
        ...additionalState
      };
      
      const channel = supabase.channel(channelName);
      
      channel.on('presence', { event: 'sync' }, () => {
        // Update app-wide state if needed
        console.log(`Presence synced for channel ${channelName}:`, channel.presenceState());
      });
      
      // Subscribe to the channel
      const status = await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Start tracking presence
          await channel.track(presenceState);
        }
      });
      
      this.channels.set(channelName, { channel, state: presenceState });
      return true;
    } catch (error) {
      console.error(`Error joining channel ${channelName}:`, error);
      return false;
    }
  }
  
  /**
   * Update state in a joined channel
   * @param channelName Channel name
   * @param newState New state to merge
   * @returns Success status
   */
  public async updateState(channelName: string, newState: Record<string, any>): Promise<boolean> {
    const channelData = this.channels.get(channelName);
    
    if (!channelData) {
      console.error(`Not in channel ${channelName}`);
      return false;
    }
    
    try {
      const updatedState = {
        ...channelData.state,
        ...newState,
        // Always update timestamp
        online_at: new Date().toISOString(),
        client_info: {
          ...channelData.state.client_info,
          timestamp: new Date().toISOString(),
        }
      };
      
      await channelData.channel.track(updatedState);
      
      // Update our stored state
      this.channels.set(channelName, {
        channel: channelData.channel,
        state: updatedState
      });
      
      return true;
    } catch (error) {
      console.error(`Error updating state in channel ${channelName}:`, error);
      return false;
    }
  }
  
  /**
   * Leave a channel
   * @param channelName Channel name
   * @returns Success status
   */
  public async leaveChannel(channelName: string): Promise<boolean> {
    const channelData = this.channels.get(channelName);
    
    if (!channelData) {
      return true; // Already left
    }
    
    try {
      await channelData.channel.untrack();
      supabase.removeChannel(channelData.channel);
      this.channels.delete(channelName);
      return true;
    } catch (error) {
      console.error(`Error leaving channel ${channelName}:`, error);
      return false;
    }
  }
  
  /**
   * Get all users in a channel
   * @param channelName Channel name
   * @returns Array of user IDs
   */
  public getUsersInChannel(channelName: string): string[] {
    const channelData = this.channels.get(channelName);
    
    if (!channelData) {
      return [];
    }
    
    const state = channelData.channel.presenceState();
    return Object.values(state).flatMap(
      (presences: any) => presences.map((p: any) => p.user_id)
    );
  }
  
  /**
   * Get presence state for a channel
   * @param channelName Channel name
   * @returns Presence state or null if not in channel
   */
  public getChannelState(channelName: string): Record<string, any[]> | null {
    const channelData = this.channels.get(channelName);
    
    if (!channelData) {
      return null;
    }
    
    return channelData.channel.presenceState();
  }
  
  /**
   * Clean up all channels on app exit
   */
  private async cleanupAllChannels(): Promise<void> {
    const channelNames = Array.from(this.channels.keys());
    
    for (const channelName of channelNames) {
      await this.leaveChannel(channelName);
    }
  }
}

export default PresenceManager.getInstance();
