
import { DeliveryLocation } from '@/types/location';

// Browser-compatible EventEmitter implementation
class BrowserEventEmitter {
  private events: Map<string, Function[]> = new Map();

  setMaxListeners(max: number): void {
    // No-op for browser compatibility
  }

  on(event: string, listener: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }

  off(event: string, listener: Function): void {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }
}

export interface GeofenceRegion {
  id: string;
  latitude: number;
  longitude: number;
  radius: number;  // in meters
  notifyOnEntry?: boolean;
  notifyOnExit?: boolean;
  notifyOnDwell?: boolean;
  dwellTime?: number;  // in milliseconds
  metadata?: Record<string, any>;
}

export type GeofenceEventType = 'enter' | 'exit' | 'dwell';

export interface GeofenceEvent {
  regionId: string;
  eventType: GeofenceEventType;
  location: DeliveryLocation;
  timestamp: number;
  metadata?: Record<string, any>;
}

export type GeofenceEventCallback = (event: GeofenceEvent) => void;

/**
 * Service for monitoring geofence regions
 */
export class GeofencingService {
  private static instance: GeofencingService;
  private regions: Map<string, GeofenceRegion> = new Map();
  private activeRegionIds: Set<string> = new Set();
  private eventEmitter: BrowserEventEmitter = new BrowserEventEmitter();
  private lastLocation: DeliveryLocation | null = null;
  private monitoringInterval: number | null = null;
  private dwellTimeouts: Map<string, number> = new Map();
  
  // Configure maximum number of event listeners
  constructor() {
    this.eventEmitter.setMaxListeners(50);
  }
  
  /**
   * Get the singleton instance
   */
  static getInstance(): GeofencingService {
    if (!this.instance) {
      this.instance = new GeofencingService();
    }
    return this.instance;
  }
  
  /**
   * Add a geofence region to monitor
   */
  addRegion(region: GeofenceRegion): string {
    this.regions.set(region.id, region);
    return region.id;
  }
  
  /**
   * Add multiple geofence regions at once
   */
  addRegions(regions: GeofenceRegion[]): string[] {
    return regions.map(region => this.addRegion(region));
  }
  
  /**
   * Remove a geofence region
   */
  removeRegion(regionId: string): boolean {
    const removed = this.regions.delete(regionId);
    this.activeRegionIds.delete(regionId);
    
    // Clear any pending dwell timeouts
    if (this.dwellTimeouts.has(regionId)) {
      window.clearTimeout(this.dwellTimeouts.get(regionId));
      this.dwellTimeouts.delete(regionId);
    }
    
    return removed;
  }
  
  /**
   * Clear all geofence regions
   */
  clearRegions(): void {
    this.regions.clear();
    this.activeRegionIds.clear();
    
    // Clear all dwell timeouts
    for (const timeoutId of this.dwellTimeouts.values()) {
      window.clearTimeout(timeoutId);
    }
    this.dwellTimeouts.clear();
  }
  
  /**
   * Start monitoring geofence regions
   */
  startMonitoring(intervalMs: number = 10000): void {
    if (this.monitoringInterval !== null) {
      return; // Already monitoring
    }
    
    console.log('Starting geofence monitoring...');
    
    // Use setInterval for web implementation
    this.monitoringInterval = window.setInterval(() => {
      if (!this.lastLocation) return;
      this.processLocation(this.lastLocation);
    }, intervalMs);
  }
  
  /**
   * Stop monitoring geofence regions
   */
  stopMonitoring(): void {
    if (this.monitoringInterval === null) {
      return; // Not monitoring
    }
    
    console.log('Stopping geofence monitoring...');
    
    // Clear the interval
    window.clearInterval(this.monitoringInterval);
    this.monitoringInterval = null;
    
    // Clear all dwell timeouts
    for (const timeoutId of this.dwellTimeouts.values()) {
      window.clearTimeout(timeoutId);
    }
    this.dwellTimeouts.clear();
    
    // Clear active regions
    this.activeRegionIds.clear();
  }
  
  /**
   * Process a new location update
   */
  processLocation(location: DeliveryLocation): void {
    this.lastLocation = location;
    
    // Process each geofence region
    this.regions.forEach(region => {
      const isInside = this.isLocationInRegion(location, region);
      const wasInside = this.activeRegionIds.has(region.id);
      
      if (isInside && !wasInside) {
        // Region entry event
        if (region.notifyOnEntry !== false) {
          const event: GeofenceEvent = {
            regionId: region.id,
            eventType: 'enter',
            location,
            timestamp: Date.now(),
            metadata: region.metadata
          };
          
          this.eventEmitter.emit('geofenceEvent', event);
          this.eventEmitter.emit(`region_${region.id}`, event);
        }
        
        this.activeRegionIds.add(region.id);
        
        // Start dwell timer if needed
        if (region.notifyOnDwell && region.dwellTime) {
          // Clear any existing dwell timeout
          if (this.dwellTimeouts.has(region.id)) {
            window.clearTimeout(this.dwellTimeouts.get(region.id));
          }
          
          // Set new dwell timeout
          const timeoutId = window.setTimeout(() => {
            const dwellEvent: GeofenceEvent = {
              regionId: region.id,
              eventType: 'dwell',
              location,
              timestamp: Date.now(),
              metadata: region.metadata
            };
            
            this.eventEmitter.emit('geofenceEvent', dwellEvent);
            this.eventEmitter.emit(`region_${region.id}`, dwellEvent);
            
            this.dwellTimeouts.delete(region.id);
          }, region.dwellTime);
          
          this.dwellTimeouts.set(region.id, timeoutId);
        }
      } else if (!isInside && wasInside) {
        // Region exit event
        if (region.notifyOnExit !== false) {
          const event: GeofenceEvent = {
            regionId: region.id,
            eventType: 'exit',
            location,
            timestamp: Date.now(),
            metadata: region.metadata
          };
          
          this.eventEmitter.emit('geofenceEvent', event);
          this.eventEmitter.emit(`region_${region.id}`, event);
        }
        
        this.activeRegionIds.delete(region.id);
        
        // Clear any dwell timeout
        if (this.dwellTimeouts.has(region.id)) {
          window.clearTimeout(this.dwellTimeouts.get(region.id));
          this.dwellTimeouts.delete(region.id);
        }
      }
    });
  }
  
  /**
   * Check if a location is inside a geofence region
   */
  isLocationInRegion(location: DeliveryLocation, region: GeofenceRegion): boolean {
    const distance = this.calculateDistance(
      location.latitude, 
      location.longitude, 
      region.latitude, 
      region.longitude
    );
    
    return distance <= region.radius;
  }
  
  /**
   * Calculate distance between two coordinates in meters
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }
  
  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }
  
  /**
   * Add an event listener for geofence events
   */
  addEventListener(event: 'geofenceEvent' | `region_${string}`, callback: GeofenceEventCallback): void {
    this.eventEmitter.on(event, callback);
  }
  
  /**
   * Remove an event listener
   */
  removeEventListener(event: 'geofenceEvent' | `region_${string}`, callback: GeofenceEventCallback): void {
    this.eventEmitter.off(event, callback);
  }
}

export default GeofencingService.getInstance();
