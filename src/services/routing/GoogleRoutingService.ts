import { supabase } from '@/integrations/supabase/client';

export interface RouteWaypoint {
  latitude: number;
  longitude: number;
  name?: string;
  stopType?: 'pickup' | 'delivery' | 'waypoint';
}

export interface RouteStep {
  instruction: string;
  maneuver: string;
  distance: number;
  duration: number;
  startLocation: {
    latitude: number;
    longitude: number;
  };
  endLocation: {
    latitude: number;
    longitude: number;
  };
  polyline?: string;
  roadName?: string;
}

export interface CalculatedRoute {
  id: string;
  legs: Array<{
    distance: number;
    duration: number;
    steps: RouteStep[];
  }>;
  overview_polyline: string;
  total_distance: number;
  total_duration: number;
  optimized_waypoint_order?: number[];
}

export interface TrafficIncident {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
  delayMinutes: number;
}

export class GoogleRoutingService {
  private static instance: GoogleRoutingService;
  private apiKey: string;

  private constructor() {
    this.apiKey = "AIzaSyBKQztvlSSaT-kjpzWBHIZ1uzgRh8rPlVs";
  }

  static getInstance(): GoogleRoutingService {
    if (!this.instance) {
      this.instance = new GoogleRoutingService();
    }
    return this.instance;
  }

  async calculateOptimizedRoute(
    origin: RouteWaypoint,
    destination: RouteWaypoint,
    waypoints: RouteWaypoint[] = [],
    assignmentId: string
  ): Promise<CalculatedRoute> {
    try {
      const waypointParams = waypoints.length > 0 
        ? `&waypoints=optimize:true|${waypoints.map(wp => `${wp.latitude},${wp.longitude}`).join('|')}`
        : '';

      const url = `https://maps.googleapis.com/maps/api/directions/json?` +
        `origin=${origin.latitude},${origin.longitude}` +
        `&destination=${destination.latitude},${destination.longitude}` +
        `${waypointParams}` +
        `&key=${this.apiKey}` +
        `&mode=driving` +
        `&traffic_model=best_guess` +
        `&departure_time=now` +
        `&alternatives=false`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Directions API error: ${data.status}`);
      }

      const route = data.routes[0];
      const legs = route.legs.map((leg: any) => ({
        distance: leg.distance.value,
        duration: leg.duration_in_traffic?.value || leg.duration.value,
        steps: leg.steps.map((step: any) => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
          maneuver: step.maneuver || 'straight',
          distance: step.distance.value,
          duration: step.duration.value,
          startLocation: {
            latitude: step.start_location.lat,
            longitude: step.start_location.lng,
          },
          endLocation: {
            latitude: step.end_location.lat,
            longitude: step.end_location.lng,
          },
          polyline: step.polyline.points,
          roadName: step.instructions
        }))
      }));

      const totalDistance = legs.reduce((sum, leg) => sum + leg.distance, 0);
      const totalDuration = legs.reduce((sum, leg) => sum + leg.duration, 0);

      const calculatedRoute: CalculatedRoute = {
        id: crypto.randomUUID(),
        legs,
        overview_polyline: route.overview_polyline.points,
        total_distance: totalDistance,
        total_duration: totalDuration,
        optimized_waypoint_order: route.waypoint_order
      };

      // Store route in database
      await this.storeRoute(calculatedRoute, assignmentId, origin, destination, waypoints);

      return calculatedRoute;
    } catch (error) {
      console.error('Error calculating route:', error);
      throw error;
    }
  }

  async calculateETA(
    routeId: string,
    currentLocation: { latitude: number; longitude: number }
  ): Promise<Date> {
    try {
      const { data, error } = await supabase.rpc('calculate_route_eta', {
        p_route_id: routeId,
        p_current_latitude: currentLocation.latitude,
        p_current_longitude: currentLocation.longitude
      });

      if (error) throw error;

      return new Date(data);
    } catch (error) {
      console.error('Error calculating ETA:', error);
      // Fallback calculation
      return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    }
  }

  async getTrafficIncidents(routeId: string): Promise<TrafficIncident[]> {
    try {
      const { data, error } = await supabase
        .from('traffic_incidents')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      return data.map(incident => ({
        type: incident.incident_type,
        severity: incident.severity as 'low' | 'medium' | 'high' | 'critical',
        location: {
          latitude: incident.latitude,
          longitude: incident.longitude
        },
        description: incident.description,
        delayMinutes: incident.delay_minutes
      }));
    } catch (error) {
      console.error('Error fetching traffic incidents:', error);
      return [];
    }
  }

  async recalculateRoute(
    routeId: string,
    currentLocation: { latitude: number; longitude: number },
    assignmentId: string
  ): Promise<CalculatedRoute> {
    try {
      // Get original route destination
      const { data: routeData, error } = await supabase
        .from('routes')
        .select('*')
        .eq('id', routeId)
        .single();

      if (error) throw error;

      const destination = {
        latitude: routeData.destination_latitude,
        longitude: routeData.destination_longitude
      };

      // Calculate new route from current location
      return await this.calculateOptimizedRoute(
        currentLocation,
        destination,
        [],
        assignmentId
      );
    } catch (error) {
      console.error('Error recalculating route:', error);
      throw error;
    }
  }

  private async storeRoute(
    route: CalculatedRoute,
    assignmentId: string,
    origin: RouteWaypoint,
    destination: RouteWaypoint,
    waypoints: RouteWaypoint[]
  ): Promise<void> {
    try {
      // Store main route (remove id from insert since it's auto-generated)
      const { data: routeRecord, error: routeError } = await supabase
        .from('routes')
        .insert({
          assignment_id: assignmentId,
          origin_latitude: origin.latitude,
          origin_longitude: origin.longitude,
          destination_latitude: destination.latitude,
          destination_longitude: destination.longitude,
          waypoints: waypoints,
          optimized_waypoints: route.optimized_waypoint_order ? 
            route.optimized_waypoint_order.map(i => waypoints[i]) : waypoints,
          route_polyline: route.overview_polyline,
          total_distance_meters: route.total_distance,
          total_duration_seconds: route.total_duration,
          estimated_arrival: new Date(Date.now() + route.total_duration * 1000),
          route_steps: route.legs.flatMap(leg => leg.steps)
        })
        .select()
        .single();

      if (routeError) throw routeError;

      // Use the returned route ID for segments
      const routeId = routeRecord.id;

      // Store route segments for turn-by-turn navigation
      const segments = [];
      let segmentIndex = 0;

      for (const leg of route.legs) {
        for (const step of leg.steps) {
          segments.push({
            route_id: routeId,
            segment_index: segmentIndex++,
            instruction: step.instruction,
            maneuver: step.maneuver,
            start_latitude: step.startLocation.latitude,
            start_longitude: step.startLocation.longitude,
            end_latitude: step.endLocation.latitude,
            end_longitude: step.endLocation.longitude,
            distance_meters: step.distance,
            duration_seconds: step.duration,
            road_name: step.roadName,
            segment_polyline: step.polyline
          });
        }
      }

      if (segments.length > 0) {
        const { error: segmentsError } = await supabase
          .from('route_segments')
          .insert(segments);

        if (segmentsError) throw segmentsError;
      }
    } catch (error) {
      console.error('Error storing route:', error);
      throw error;
    }
  }
}

export const googleRoutingService = GoogleRoutingService.getInstance();
