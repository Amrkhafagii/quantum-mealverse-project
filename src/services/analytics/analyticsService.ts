
import { Platform } from '@/utils/platform';

// Define event types for type safety
export type EventName = 
  | 'page_view'
  | 'button_click'
  | 'search'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout_start'
  | 'checkout_complete'
  | 'order_placed'
  | 'error'
  | 'login'
  | 'signup'
  | 'delivery_status_update'
  | 'ar_preview_open'
  | 'restaurant_action';

export interface AnalyticsEvent {
  name: EventName;
  properties?: Record<string, any>;
  timestamp?: number;
}

interface AnalyticsOptions {
  userId?: string;
  sessionId?: string;
  appVersion?: string;
  debug?: boolean;
}

class AnalyticsService {
  private userId?: string;
  private sessionId: string;
  private appVersion: string;
  private platform: string;
  private debug: boolean;
  private initialized: boolean = false;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: number | null = null;
  private batchSize: number = 10;
  private isOffline: boolean = false;
  
  constructor(options: AnalyticsOptions = {}) {
    this.userId = options.userId;
    this.sessionId = options.sessionId || this.generateSessionId();
    this.appVersion = options.appVersion || '1.0.0';
    this.platform = Platform.isWeb ? 'web' : Platform.isIOS ? 'ios' : Platform.isAndroid ? 'android' : 'unknown';
    this.debug = options.debug || false;
    
    // Initialize offline detection
    if (typeof window !== 'undefined') {
      this.isOffline = !navigator.onLine;
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }
  
  // Initialize the analytics service
  public async initialize(apiKey: string): Promise<boolean> {
    try {
      if (this.initialized) return true;
      
      // Simulated initialization - in a real implementation, this would connect to an analytics service
      this.log(`Initializing analytics service with key: ${apiKey}`);
      
      // Start event queue processing
      this.startEventProcessing();
      
      this.initialized = true;
      return true;
    } catch (e) {
      this.logError('Failed to initialize analytics service', e);
      return false;
    }
  }
  
  // Set user information
  public setUser(userId: string, userProperties?: Record<string, any>): void {
    this.userId = userId;
    this.log(`Set user ID: ${userId}${userProperties ? ' with properties' : ''}`);
    
    // In a real implementation, we would update user properties in the analytics service
    if (userProperties) {
      this.log('User properties:', userProperties);
    }
  }
  
  // Track an event
  public track(event: EventName, properties?: Record<string, any>): void {
    const eventData: AnalyticsEvent = {
      name: event,
      properties: {
        ...properties,
        userId: this.userId,
        sessionId: this.sessionId,
        platform: this.platform,
        appVersion: this.appVersion,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    };
    
    this.log(`Track event: ${event}`, properties);
    this.eventQueue.push(eventData);
    
    // If offline, store event for later
    if (this.isOffline) {
      this.persistEvent(eventData);
    } else if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents();
    }
  }
  
  // Track page/screen views
  public trackScreen(screenName: string, properties?: Record<string, any>): void {
    this.track('page_view', {
      screen_name: screenName,
      ...properties,
    });
  }
  
  // Track errors
  public trackError(error: Error | string, context?: Record<string, any>): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    this.track('error', {
      error_message: errorMessage,
      error_stack: errorStack,
      ...context,
    });
  }
  
  // Clean up resources
  public dispose(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    
    // Flush any remaining events
    this.flushEvents();
    
    this.initialized = false;
  }
  
  // Process the event queue
  private startEventProcessing(): void {
    // Send events every 30 seconds or when batch size is reached
    this.flushInterval = window.setInterval(() => {
      if (this.eventQueue.length > 0 && !this.isOffline) {
        this.flushEvents();
      }
    }, 30000) as unknown as number;
    
    // Try to recover any persisted events
    this.recoverPersistedEvents();
  }
  
  // Send events to the analytics service
  private flushEvents(): void {
    if (!this.initialized || this.eventQueue.length === 0) return;
    
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    this.log(`Flushing ${events.length} events`);
    
    // In a real implementation, we would send events to the analytics service
    // For now, we'll just log them
    if (this.debug) {
      console.log('Analytics events:', events);
    }
    
    // Clear persisted events that were sent
    this.clearPersistedEvents(events);
  }
  
  // Store events when offline
  private persistEvent(event: AnalyticsEvent): void {
    try {
      const persistedEvents = this.getPersistedEvents();
      persistedEvents.push(event);
      
      // Store in localStorage with a limit to prevent excessive storage use
      const maxEvents = 100;
      localStorage.setItem(
        'analytics_events',
        JSON.stringify(persistedEvents.slice(-maxEvents))
      );
    } catch (e) {
      this.logError('Failed to persist event', e);
    }
  }
  
  // Get persisted events from storage
  private getPersistedEvents(): AnalyticsEvent[] {
    try {
      const eventsJson = localStorage.getItem('analytics_events');
      return eventsJson ? JSON.parse(eventsJson) : [];
    } catch (e) {
      this.logError('Failed to get persisted events', e);
      return [];
    }
  }
  
  // Clear persisted events after sending
  private clearPersistedEvents(sentEvents: AnalyticsEvent[]): void {
    try {
      const persistedEvents = this.getPersistedEvents();
      const sentTimestamps = new Set(sentEvents.map(e => e.timestamp));
      
      const remainingEvents = persistedEvents.filter(
        e => e.timestamp && !sentTimestamps.has(e.timestamp)
      );
      
      localStorage.setItem('analytics_events', JSON.stringify(remainingEvents));
    } catch (e) {
      this.logError('Failed to clear persisted events', e);
    }
  }
  
  // Recover events persisted during offline periods
  private recoverPersistedEvents(): void {
    try {
      const persistedEvents = this.getPersistedEvents();
      
      if (persistedEvents.length > 0) {
        this.log(`Recovered ${persistedEvents.length} persisted events`);
        this.eventQueue.push(...persistedEvents);
        
        if (!this.isOffline) {
          this.flushEvents();
        }
      }
    } catch (e) {
      this.logError('Failed to recover persisted events', e);
    }
  }
  
  // Handle coming back online
  private handleOnline = (): void => {
    this.isOffline = false;
    this.log('Connection restored. Processing queued events.');
    this.flushEvents();
  };
  
  // Handle going offline
  private handleOffline = (): void => {
    this.isOffline = true;
    this.log('Connection lost. Events will be queued.');
  };
  
  // Generate a unique session ID
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  
  // Debug logging
  private log(message: string, data?: any): void {
    if (this.debug) {
      console.log(`[Analytics] ${message}`, data);
    }
  }
  
  // Error logging
  private logError(message: string, error?: any): void {
    console.error(`[Analytics Error] ${message}`, error);
  }
}

// Create a singleton instance
export const analytics = new AnalyticsService({
  debug: process.env.NODE_ENV === 'development',
});

export default analytics;
