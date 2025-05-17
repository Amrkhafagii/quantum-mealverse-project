
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Platform } from '@/utils/platform';

interface PresenceUser {
  user_id: string;
  status: 'online' | 'away' | 'offline';
  timestamp: number;
  platform: string;
  metadata?: Record<string, any>;
}

interface PresenceOptions {
  channelName: string;
  userId: string;
  metadata?: Record<string, any>;
  onSync?: (state: Record<string, PresenceUser[]>) => void;
  onJoin?: (key: string, user: PresenceUser) => void;
  onLeave?: (key: string, user: PresenceUser) => void;
  updateInterval?: number;
}

class PresenceManager {
  private channel: RealtimeChannel | null = null;
  private options: PresenceOptions | null = null;
  private intervalId: number | null = null;
  private isSubscribed = false;
  
  /**
   * Initialize presence and start tracking
   */
  public async initialize(options: PresenceOptions): Promise<boolean> {
    if (this.channel) {
      console.warn('Presence manager already initialized. Call cleanup() first.');
      return false;
    }
    
    this.options = options;
    
    // Create the presence channel
    this.channel = supabase.channel(options.channelName);
    
    // Set up event handlers
    this.channel
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel!.presenceState();
        if (options.onSync) {
          options.onSync(state as Record<string, PresenceUser[]>);
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (options.onJoin) {
          options.onJoin(key, newPresences[0] as PresenceUser);
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        if (options.onLeave) {
          options.onLeave(key, leftPresences[0] as PresenceUser);
        }
      });
    
    // Subscribe to the channel
    try {
      const status = await this.channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.isSubscribed = true;
          this.trackPresence();
          this.setupUpdateInterval();
        }
      });
      
      return this.isSubscribed;
    } catch (error) {
      console.error('Error subscribing to presence channel:', error);
      return false;
    }
  }
  
  /**
   * Track initial presence state
   */
  private async trackPresence(): Promise<void> {
    if (!this.channel || !this.options || !this.isSubscribed) return;
    
    // Create base presence state
    const presenceData: PresenceUser = {
      user_id: this.options.userId,
      status: 'online',
      timestamp: Date.now(),
      platform: Platform.getPlatformName(),
    };
    
    // Add metadata if available
    if (this.options.metadata) {
      presenceData.metadata = this.options.metadata;
    }
    
    try {
      await this.channel.track(presenceData);
    } catch (error) {
      console.error('Error tracking presence:', error);
    }
  }
  
  /**
   * Set up interval to update presence regularly
   */
  private setupUpdateInterval(): void {
    if (!this.options) return;
    
    const updateInterval = this.options.updateInterval || 30000; // Default to 30 seconds
    
    this.intervalId = window.setInterval(async () => {
      if (!this.channel || !this.options || !this.isSubscribed) {
        this.cleanup();
        return;
      }
      
      // Create updated presence state
      const presenceData: PresenceUser = {
        user_id: this.options.userId,
        status: document.visibilityState === 'visible' ? 'online' : 'away',
        timestamp: Date.now(),
        platform: Platform.getPlatformName(),
      };
      
      // Add metadata if available
      if (this.options.metadata) {
        presenceData.metadata = this.options.metadata;
      }
      
      try {
        await this.channel.track(presenceData);
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    }, updateInterval);
    
    // Add visibility change listener
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }
  
  /**
   * Handle page visibility changes
   */
  private handleVisibilityChange = async (): Promise<void> => {
    if (!this.channel || !this.options || !this.isSubscribed) return;
    
    // Update status based on visibility state
    const presenceData: PresenceUser = {
      user_id: this.options.userId,
      status: document.visibilityState === 'visible' ? 'online' : 'away',
      timestamp: Date.now(),
      platform: Platform.getPlatformName(),
    };
    
    // Add metadata if available
    if (this.options.metadata) {
      presenceData.metadata = this.options.metadata;
    }
    
    try {
      await this.channel.track(presenceData);
    } catch (error) {
      console.error('Error updating presence on visibility change:', error);
    }
  };
  
  /**
   * Update user's presence status and metadata
   */
  public async updateStatus(
    status: 'online' | 'away' | 'offline', 
    metadata?: Record<string, any>
  ): Promise<boolean> {
    if (!this.channel || !this.options || !this.isSubscribed) return false;
    
    // Create presence update
    const presenceData: PresenceUser = {
      user_id: this.options.userId,
      status,
      timestamp: Date.now(),
      platform: Platform.getPlatformName(),
    };
    
    // Add metadata if available
    if (metadata || this.options.metadata) {
      presenceData.metadata = {
        ...this.options.metadata,
        ...metadata,
      };
    }
    
    try {
      await this.channel.track(presenceData);
      return true;
    } catch (error) {
      console.error('Error updating presence status:', error);
      return false;
    }
  }
  
  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    if (this.channel && this.isSubscribed) {
      try {
        // Set offline status before untracking
        if (this.options) {
          await this.updateStatus('offline');
        }
        
        await this.channel.untrack();
        await supabase.removeChannel(this.channel);
      } catch (error) {
        console.error('Error cleaning up presence manager:', error);
      }
    }
    
    this.channel = null;
    this.options = null;
    this.isSubscribed = false;
  }
}

// Export a singleton instance
export const presenceManager = new PresenceManager();
