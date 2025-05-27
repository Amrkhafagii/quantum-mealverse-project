
import { supabase } from '@/integrations/supabase/client';
import { googleRoutingService } from '../routing/GoogleRoutingService';

export interface NavigationSession {
  id: string;
  routeId: string;
  deliveryUserId: string;
  assignmentId: string;
  currentStepIndex: number;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  distanceRemaining: number;
  timeRemaining: number;
  nextManeuver: string;
  nextManeuverDistance: number;
  isActive: boolean;
  offRoute: boolean;
  rerouteCount: number;
}

export interface NavigationUpdate {
  currentStep: {
    instruction: string;
    maneuver: string;
    distanceToNext: number;
    roadName?: string;
  };
  progress: {
    distanceRemaining: number;
    timeRemaining: number;
    percentComplete: number;
  };
  eta: Date;
  offRoute: boolean;
}

export class NavigationService {
  private static instance: NavigationService;
  private activeSession: NavigationSession | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): NavigationService {
    if (!this.instance) {
      this.instance = new NavigationService();
    }
    return this.instance;
  }

  async startNavigation(
    routeId: string,
    deliveryUserId: string,
    assignmentId: string
  ): Promise<NavigationSession> {
    try {
      // Create navigation session
      const { data, error } = await supabase
        .from('navigation_sessions')
        .insert({
          route_id: routeId,
          delivery_user_id: deliveryUserId,
          assignment_id: assignmentId,
          current_step_index: 0,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      this.activeSession = {
        id: data.id,
        routeId: data.route_id,
        deliveryUserId: data.delivery_user_id,
        assignmentId: data.assignment_id,
        currentStepIndex: data.current_step_index,
        currentLocation: {
          latitude: data.current_latitude || 0,
          longitude: data.current_longitude || 0
        },
        distanceRemaining: data.distance_remaining_meters || 0,
        timeRemaining: data.time_remaining_seconds || 0,
        nextManeuver: data.next_maneuver || '',
        nextManeuverDistance: data.next_maneuver_distance_meters || 0,
        isActive: data.is_active,
        offRoute: data.off_route,
        rerouteCount: data.reroute_count
      };

      // Start location monitoring
      this.startLocationMonitoring();

      return this.activeSession;
    } catch (error) {
      console.error('Error starting navigation:', error);
      throw error;
    }
  }

  async updateLocation(
    latitude: number,
    longitude: number
  ): Promise<NavigationUpdate | null> {
    if (!this.activeSession) return null;

    try {
      // Update navigation progress in database
      const { data, error } = await supabase.rpc('update_navigation_progress', {
        p_session_id: this.activeSession.id,
        p_current_latitude: latitude,
        p_current_longitude: longitude
      });

      if (error) throw error;

      // Get current navigation state
      const { data: sessionData, error: sessionError } = await supabase
        .from('navigation_sessions')
        .select(`
          *,
          routes!inner(*)
        `)
        .eq('id', this.activeSession.id)
        .single();

      if (sessionError) throw sessionError;

      // Get current route segment
      const { data: currentSegment, error: segmentError } = await supabase
        .from('route_segments')
        .select('*')
        .eq('route_id', sessionData.route_id)
        .eq('segment_index', sessionData.current_step_index)
        .single();

      if (segmentError && segmentError.code !== 'PGRST116') {
        throw segmentError;
      }

      // Calculate progress
      const distanceToNextStep = currentSegment ? 
        this.calculateDistance(
          latitude,
          longitude,
          currentSegment.end_latitude,
          currentSegment.end_longitude
        ) : 0;

      // Check if we've completed the current step
      if (distanceToNextStep < 50 && currentSegment) { // 50 meter threshold
        await this.advanceToNextStep();
      }

      // Calculate ETA
      const eta = await googleRoutingService.calculateETA(
        sessionData.route_id,
        { latitude, longitude }
      );

      // Handle rerouting if off route
      if (sessionData.off_route && this.activeSession.rerouteCount < 3) {
        await this.handleReroute(latitude, longitude);
      }

      const navigationUpdate: NavigationUpdate = {
        currentStep: {
          instruction: currentSegment?.instruction || 'Continue straight',
          maneuver: currentSegment?.maneuver || 'straight',
          distanceToNext: distanceToNextStep,
          roadName: currentSegment?.road_name
        },
        progress: {
          distanceRemaining: sessionData.distance_remaining_meters || 0,
          timeRemaining: sessionData.time_remaining_seconds || 0,
          percentComplete: this.calculateProgressPercent(sessionData)
        },
        eta,
        offRoute: sessionData.off_route
      };

      // Update active session
      this.activeSession.currentLocation = { latitude, longitude };
      this.activeSession.offRoute = sessionData.off_route;

      return navigationUpdate;
    } catch (error) {
      console.error('Error updating navigation:', error);
      return null;
    }
  }

  async stopNavigation(): Promise<void> {
    if (!this.activeSession) return;

    try {
      // Stop location monitoring
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }

      // Mark session as completed
      await supabase
        .from('navigation_sessions')
        .update({
          is_active: false,
          completed_at: new Date().toISOString()
        })
        .eq('id', this.activeSession.id);

      this.activeSession = null;
    } catch (error) {
      console.error('Error stopping navigation:', error);
    }
  }

  getActiveSession(): NavigationSession | null {
    return this.activeSession;
  }

  private async advanceToNextStep(): Promise<void> {
    if (!this.activeSession) return;

    try {
      const nextStepIndex = this.activeSession.currentStepIndex + 1;

      await supabase
        .from('navigation_sessions')
        .update({
          current_step_index: nextStepIndex
        })
        .eq('id', this.activeSession.id);

      this.activeSession.currentStepIndex = nextStepIndex;
    } catch (error) {
      console.error('Error advancing to next step:', error);
    }
  }

  private async handleReroute(latitude: number, longitude: number): Promise<void> {
    if (!this.activeSession) return;

    try {
      console.log('Handling reroute...');
      
      // Calculate new route
      const newRoute = await googleRoutingService.recalculateRoute(
        this.activeSession.routeId,
        { latitude, longitude },
        this.activeSession.assignmentId
      );

      // Update session with new route
      await supabase
        .from('navigation_sessions')
        .update({
          route_id: newRoute.id,
          current_step_index: 0,
          off_route: false,
          reroute_count: this.activeSession.rerouteCount + 1
        })
        .eq('id', this.activeSession.id);

      this.activeSession.routeId = newRoute.id;
      this.activeSession.currentStepIndex = 0;
      this.activeSession.offRoute = false;
      this.activeSession.rerouteCount++;
    } catch (error) {
      console.error('Error handling reroute:', error);
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

  private calculateProgressPercent(sessionData: any): number {
    const totalDistance = sessionData.routes?.total_distance_meters || 0;
    const remainingDistance = sessionData.distance_remaining_meters || 0;
    
    if (totalDistance === 0) return 0;
    
    return Math.max(0, Math.min(100, ((totalDistance - remainingDistance) / totalDistance) * 100));
  }

  private startLocationMonitoring(): void {
    // This would integrate with the battery-optimized location service
    // For now, we'll set up a basic monitoring system
    this.updateInterval = setInterval(() => {
      if (this.activeSession && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.updateLocation(
              position.coords.latitude,
              position.coords.longitude
            );
          },
          (error) => {
            console.error('Error getting location:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000
          }
        );
      }
    }, 5000); // Update every 5 seconds
  }
}

export const navigationService = NavigationService.getInstance();
