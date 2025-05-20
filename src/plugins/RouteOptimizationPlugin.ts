
import { registerPlugin } from '@capacitor/core';

export interface RoutePoint {
  latitude: number;
  longitude: number;
  name?: string;
  stopType?: 'pickup' | 'delivery' | 'waypoint';
}

export interface RouteOptions {
  optimizeWaypoints: boolean;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  avoidFerries?: boolean;
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
  departureTime?: Date;
  trafficModel?: 'best_guess' | 'pessimistic' | 'optimistic';
  units?: 'metric' | 'imperial';
  stopOptimization?: 'distance' | 'duration'; // Added to control optimization strategy
}

export interface OptimizedRoute {
  waypoints: RoutePoint[];
  distance: number; // in meters
  duration: number; // in seconds
  polyline: string;
  legs: RouteLeg[];
  optimizedOrder?: number[]; // Added to show the optimized order of waypoints
}

export interface RouteLeg {
  startLocation: {
    latitude: number;
    longitude: number;
  };
  endLocation: {
    latitude: number;
    longitude: number;
  };
  distance: number; // in meters
  duration: number; // in seconds
  steps?: RouteStep[];
}

export interface RouteStep {
  instructions: string;
  distance: number;
  duration: number;
  maneuver?: string;
}

export interface RouteOptimizationPlugin {
  calculateOptimalRoute(options: {
    origin: RoutePoint;
    destination: RoutePoint;
    waypoints?: RoutePoint[];
    options?: RouteOptions;
  }): Promise<{ route: OptimizedRoute }>;
  
  calculateMultiStopRoute(options: {
    stops: RoutePoint[];
    returnToOrigin?: boolean;
    options?: RouteOptions;
  }): Promise<{ route: OptimizedRoute }>;
  
  getEstimatedTime(options: {
    origin: RoutePoint;
    destination: RoutePoint;
    departureTime?: Date;
  }): Promise<{ duration: number; distance: number }>;
  
  cancelRouteCalculation(): Promise<void>;
}

const RouteOptimization = registerPlugin<RouteOptimizationPlugin>('RouteOptimization');

export default RouteOptimization;
