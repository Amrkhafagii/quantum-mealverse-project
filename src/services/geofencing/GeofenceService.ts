import { supabase } from '@/integrations/supabase/client';

export interface GeofenceZone {
  id: string;
  name: string;
  zone_type: 'pickup' | 'delivery' | 'restaurant' | 'customer';
  latitude: number;
  longitude: number;
  radius_meters: number;
  restaurant_id?: string;
  order_id?: string;
  is_active: boolean;
  metadata: Record<string, any>;
}

export interface GeofenceEvent {
  id: string;
  geofence_zone_id: string;
  delivery_user_id: string;
  assignment_id: string;
  event_type: 'enter' | 'exit' | 'dwell';
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  metadata: Record<string, any>;
}

export class GeofenceService {
  private static instance: GeofenceService;
  private activeZones: Map<string, GeofenceZone> = new Map();
  private enteredZones: Set<string> = new Set();
  private dwellTimers: Map<string, number> = new Map();
  private deliveryUserId: string | null = null;
  private assignmentId: string | null = null;

  private constructor() {}

  static getInstance(): GeofenceService {
    if (!this.instance) {
      this.instance = new GeofenceService();
    }
    return this.instance;
  }

  async initialize(deliveryUserId: string, assignmentId: string): Promise<void> {
    this.deliveryUserId = deliveryUserId;
    this.assignmentId = assignmentId;
    await this.loadActiveZones();
  }

  private async loadActiveZones(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('geofence_zones')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error loading geofence zones:', error);
        return;
      }

      this.activeZones.clear();
      data?.forEach(zone => {
        this.activeZones.set(zone.id, zone as GeofenceZone);
      });

      console.log(`Loaded ${this.activeZones.size} active geofence zones`);
    } catch (error) {
      console.error('Error loading geofence zones:', error);
    }
  }

  async checkGeofences(latitude: number, longitude: number, accuracy?: number): Promise<void> {
    if (!this.deliveryUserId || !this.assignmentId) return;

    for (const [zoneId, zone] of this.activeZones) {
      const distance = this.calculateDistance(latitude, longitude, zone.latitude, zone.longitude);
      const isInside = distance <= zone.radius_meters;
      const wasInside = this.enteredZones.has(zoneId);

      if (isInside && !wasInside) {
        // Entered geofence
        await this.handleGeofenceEntry(zone, latitude, longitude, accuracy);
      } else if (!isInside && wasInside) {
        // Exited geofence
        await this.handleGeofenceExit(zone, latitude, longitude, accuracy);
      }
    }
  }

  private async handleGeofenceEntry(
    zone: GeofenceZone, 
    latitude: number, 
    longitude: number, 
    accuracy?: number
  ): Promise<void> {
    this.enteredZones.add(zone.id);
    
    await this.createGeofenceEvent({
      geofence_zone_id: zone.id,
      delivery_user_id: this.deliveryUserId!,
      assignment_id: this.assignmentId!,
      event_type: 'enter',
      latitude,
      longitude,
      accuracy,
      metadata: {
        zone_name: zone.name,
        zone_type: zone.zone_type
      }
    });

    // Start dwell timer if configured
    if (zone.metadata.dwell_time_seconds) {
      const timerId = window.setTimeout(() => {
        this.handleGeofenceDwell(zone, latitude, longitude, accuracy);
      }, zone.metadata.dwell_time_seconds * 1000);
      
      this.dwellTimers.set(zone.id, timerId);
    }

    console.log(`Entered geofence: ${zone.name}`);
    
    // Send customer notification based on zone type
    await this.sendCustomerNotification(zone, 'enter');
  }

  private async handleGeofenceExit(
    zone: GeofenceZone, 
    latitude: number, 
    longitude: number, 
    accuracy?: number
  ): Promise<void> {
    this.enteredZones.delete(zone.id);
    
    // Clear dwell timer
    const timerId = this.dwellTimers.get(zone.id);
    if (timerId) {
      clearTimeout(timerId);
      this.dwellTimers.delete(zone.id);
    }

    await this.createGeofenceEvent({
      geofence_zone_id: zone.id,
      delivery_user_id: this.deliveryUserId!,
      assignment_id: this.assignmentId!,
      event_type: 'exit',
      latitude,
      longitude,
      accuracy,
      metadata: {
        zone_name: zone.name,
        zone_type: zone.zone_type
      }
    });

    console.log(`Exited geofence: ${zone.name}`);
    
    // Send customer notification based on zone type
    await this.sendCustomerNotification(zone, 'exit');
  }

  private async handleGeofenceDwell(
    zone: GeofenceZone, 
    latitude: number, 
    longitude: number, 
    accuracy?: number
  ): Promise<void> {
    await this.createGeofenceEvent({
      geofence_zone_id: zone.id,
      delivery_user_id: this.deliveryUserId!,
      assignment_id: this.assignmentId!,
      event_type: 'dwell',
      latitude,
      longitude,
      accuracy,
      metadata: {
        zone_name: zone.name,
        zone_type: zone.zone_type,
        dwell_time: zone.metadata.dwell_time_seconds
      }
    });

    console.log(`Dwelling in geofence: ${zone.name}`);
  }

  private async createGeofenceEvent(eventData: Omit<GeofenceEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('geofence_events')
        .insert({
          ...eventData,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating geofence event:', error);
      }
    } catch (error) {
      console.error('Error creating geofence event:', error);
    }
  }

  private async sendCustomerNotification(zone: GeofenceZone, eventType: 'enter' | 'exit'): Promise<void> {
    if (!zone.order_id) return;

    let title = '';
    let message = '';

    switch (zone.zone_type) {
      case 'pickup':
        if (eventType === 'enter') {
          title = 'Driver at Restaurant';
          message = 'Your driver has arrived at the restaurant to pick up your order.';
        } else {
          title = 'Order Picked Up';
          message = 'Your order has been picked up and is on the way to you!';
        }
        break;
      case 'delivery':
        if (eventType === 'enter') {
          title = 'Driver Nearby';
          message = 'Your driver is approaching your delivery location.';
        }
        break;
      default:
        return; // Don't send notifications for other zone types
    }

    if (title && message) {
      try {
        await supabase.rpc('send_customer_notification', {
          p_order_id: zone.order_id,
          p_notification_type: `geofence_${eventType}`,
          p_title: title,
          p_message: message,
          p_data: {
            zone_id: zone.id,
            zone_type: zone.zone_type,
            event_type: eventType
          }
        });
      } catch (error) {
        console.error('Error sending customer notification:', error);
      }
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async addGeofenceZone(zone: Omit<GeofenceZone, 'id'>): Promise<string | null> {
    try {
      // Validate coordinates before attempting to create the zone
      if (!this.isValidCoordinate(zone.latitude, zone.longitude)) {
        console.error('Invalid coordinates for geofence zone:', {
          latitude: zone.latitude,
          longitude: zone.longitude,
          zoneName: zone.name,
          zoneType: zone.zone_type
        });
        return null;
      }

      const { data, error } = await supabase
        .from('geofence_zones')
        .insert(zone)
        .select()
        .single();

      if (error) {
        console.error('Error adding geofence zone:', error);
        return null;
      }

      this.activeZones.set(data.id, data as GeofenceZone);
      console.log('Successfully created geofence zone:', {
        id: data.id,
        name: zone.name,
        type: zone.zone_type
      });
      return data.id;
    } catch (error) {
      console.error('Error adding geofence zone:', error);
      return null;
    }
  }

  /**
   * Validate that coordinates are valid numbers and within acceptable ranges
   */
  private isValidCoordinate(latitude: number | null | undefined, longitude: number | null | undefined): boolean {
    if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
      return false;
    }
    
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return false;
    }
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return false;
    }
    
    // Check if coordinates are within valid ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return false;
    }
    
    return true;
  }

  /**
   * Safely create geofence zones for an order - won't throw errors
   */
  async safeCreateOrderGeofences(orderId: string, pickupLocation: { latitude: number; longitude: number }, deliveryLocation: { latitude: number; longitude: number }, restaurantId?: string): Promise<void> {
    try {
      console.log('Creating geofence zones for order:', orderId);
      
      // Create pickup geofence zone
      if (this.isValidCoordinate(pickupLocation.latitude, pickupLocation.longitude)) {
        const pickupZoneId = await this.addGeofenceZone({
          name: `Pickup Zone - Order ${orderId}`,
          zone_type: 'pickup',
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude,
          radius_meters: 100,
          restaurant_id: restaurantId,
          order_id: orderId,
          is_active: true,
          metadata: {
            order_id: orderId,
            created_for: 'pickup_tracking'
          }
        });
        
        if (pickupZoneId) {
          console.log('Created pickup geofence zone:', pickupZoneId);
        } else {
          console.warn('Failed to create pickup geofence zone for order:', orderId);
        }
      } else {
        console.warn('Invalid pickup coordinates, skipping pickup geofence creation:', pickupLocation);
      }

      // Create delivery geofence zone
      if (this.isValidCoordinate(deliveryLocation.latitude, deliveryLocation.longitude)) {
        const deliveryZoneId = await this.addGeofenceZone({
          name: `Delivery Zone - Order ${orderId}`,
          zone_type: 'delivery',
          latitude: deliveryLocation.latitude,
          longitude: deliveryLocation.longitude,
          radius_meters: 50,
          order_id: orderId,
          is_active: true,
          metadata: {
            order_id: orderId,
            created_for: 'delivery_tracking'
          }
        });
        
        if (deliveryZoneId) {
          console.log('Created delivery geofence zone:', deliveryZoneId);
        } else {
          console.warn('Failed to create delivery geofence zone for order:', orderId);
        }
      } else {
        console.warn('Invalid delivery coordinates, skipping delivery geofence creation:', deliveryLocation);
      }
      
    } catch (error) {
      // Log the error but don't throw - this allows the order to continue
      console.error('Non-critical error creating geofence zones for order:', orderId, error);
    }
  }

  async removeGeofenceZone(zoneId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('geofence_zones')
        .update({ is_active: false })
        .eq('id', zoneId);

      if (error) {
        console.error('Error removing geofence zone:', error);
        return false;
      }

      this.activeZones.delete(zoneId);
      this.enteredZones.delete(zoneId);
      
      const timerId = this.dwellTimers.get(zoneId);
      if (timerId) {
        clearTimeout(timerId);
        this.dwellTimers.delete(zoneId);
      }

      return true;
    } catch (error) {
      console.error('Error removing geofence zone:', error);
      return false;
    }
  }

  getActiveZones(): GeofenceZone[] {
    return Array.from(this.activeZones.values());
  }

  getEnteredZones(): GeofenceZone[] {
    return Array.from(this.activeZones.values()).filter(zone => 
      this.enteredZones.has(zone.id)
    );
  }

  cleanup(): void {
    // Clear all timers
    this.dwellTimers.forEach(timerId => clearTimeout(timerId));
    this.dwellTimers.clear();
    this.enteredZones.clear();
    this.activeZones.clear();
  }
}

export const geofenceService = GeofenceService.getInstance();
