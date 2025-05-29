
import { supabase } from '@/integrations/supabase/client';
import { DeliveryLocationTracking, LocationUpdate, ETACalculation } from '@/types/location-sharing';

export class RealTimeLocationService {
  // Update driver location with automatic ETA calculation
  async updateDriverLocation(
    deliveryAssignmentId: string,
    deliveryUserId: string,
    location: LocationUpdate
  ): Promise<{ locationId: string; eta?: ETACalculation } | null> {
    try {
      const { data, error } = await supabase.rpc('update_driver_location_with_eta', {
        p_delivery_assignment_id: deliveryAssignmentId,
        p_delivery_user_id: deliveryUserId,
        p_latitude: location.latitude,
        p_longitude: location.longitude,
        p_accuracy: location.accuracy || null,
        p_altitude: location.altitude || null,
        p_heading: location.heading || null,
        p_speed: location.speed || null,
        p_battery_level: location.battery_level || null,
        p_network_type: location.network_type || null
      });

      if (error) throw error;

      const result = data?.[0];
      if (!result) return null;

      return {
        locationId: result.location_id,
        eta: result.eta_minutes ? {
          eta_minutes: result.eta_minutes,
          distance_km: 0, // Will be calculated by the function
          estimated_arrival: result.estimated_arrival
        } : undefined
      };
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  }

  // Get latest driver location for a delivery assignment
  async getLatestDriverLocation(deliveryAssignmentId: string): Promise<DeliveryLocationTracking | null> {
    try {
      const { data, error } = await supabase
        .from('delivery_location_tracking')
        .select('*')
        .eq('delivery_assignment_id', deliveryAssignmentId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      return data || null;
    } catch (error) {
      console.error('Error getting latest driver location:', error);
      return null;
    }
  }

  // Get location history for a delivery assignment
  async getLocationHistory(
    deliveryAssignmentId: string,
    limit: number = 50
  ): Promise<DeliveryLocationTracking[]> {
    try {
      const { data, error } = await supabase
        .from('delivery_location_tracking')
        .select('*')
        .eq('delivery_assignment_id', deliveryAssignmentId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting location history:', error);
      return [];
    }
  }

  // Subscribe to real-time location updates
  subscribeToLocationUpdates(
    deliveryAssignmentId: string,
    onUpdate: (location: DeliveryLocationTracking) => void,
    onError?: (error: Error) => void
  ) {
    const channel = supabase
      .channel(`location-tracking-${deliveryAssignmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'delivery_location_tracking',
          filter: `delivery_assignment_id=eq.${deliveryAssignmentId}`
        },
        (payload) => {
          console.log('Real-time location update:', payload);
          onUpdate(payload.new as DeliveryLocationTracking);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'delivery_location_tracking',
          filter: `delivery_assignment_id=eq.${deliveryAssignmentId}`
        },
        (payload) => {
          console.log('Real-time location update:', payload);
          onUpdate(payload.new as DeliveryLocationTracking);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to location updates for assignment ${deliveryAssignmentId}`);
        } else if (status === 'CHANNEL_ERROR') {
          const error = new Error(`Failed to subscribe to location updates for assignment ${deliveryAssignmentId}`);
          console.error(error);
          onError?.(error);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Calculate ETA manually (for testing or custom calculations)
  async calculateETA(
    deliveryAssignmentId: string,
    driverLat: number,
    driverLng: number,
    destinationLat: number,
    destinationLng: number,
    trafficFactor: number = 1.0
  ): Promise<ETACalculation | null> {
    try {
      const { data, error } = await supabase.rpc('calculate_delivery_eta', {
        p_delivery_assignment_id: deliveryAssignmentId,
        p_driver_lat: driverLat,
        p_driver_lng: driverLng,
        p_destination_lat: destinationLat,
        p_destination_lng: destinationLng,
        p_traffic_factor: trafficFactor
      });

      if (error) throw error;

      const result = data?.[0];
      if (!result) return null;

      return {
        eta_minutes: result.eta_minutes,
        distance_km: result.distance_km,
        estimated_arrival: result.estimated_arrival
      };
    } catch (error) {
      console.error('Error calculating ETA:', error);
      return null;
    }
  }
}

export const realTimeLocationService = new RealTimeLocationService();
