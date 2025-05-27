
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigation } from '@/hooks/useNavigation';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Route, 
  AlertTriangle,
  TurnRight,
  TurnLeft,
  ArrowUp
} from 'lucide-react';

interface NavigationPanelProps {
  assignmentId?: string;
  deliveryUserId?: string;
  origin?: { latitude: number; longitude: number; name?: string };
  destination?: { latitude: number; longitude: number; name?: string };
  waypoints?: Array<{ latitude: number; longitude: number; name?: string }>;
  onNavigationStart?: () => void;
  onNavigationStop?: () => void;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  assignmentId,
  deliveryUserId,
  origin,
  destination,
  waypoints = [],
  onNavigationStart,
  onNavigationStop
}) => {
  const {
    isNavigating,
    isCalculatingRoute,
    navigationUpdate,
    currentRoute,
    error,
    startNavigation,
    stopNavigation,
    calculateRoute
  } = useNavigation({
    assignmentId,
    deliveryUserId,
    onRouteComplete: onNavigationStop
  });

  const handleStartNavigation = async () => {
    if (!origin || !destination) return;

    try {
      await startNavigation(origin, destination, waypoints);
      if (onNavigationStart) onNavigationStart();
    } catch (error) {
      console.error('Failed to start navigation:', error);
    }
  };

  const handleStopNavigation = async () => {
    await stopNavigation();
    if (onNavigationStop) onNavigationStop();
  };

  const handleCalculateRoute = async () => {
    if (!origin || !destination) return;

    try {
      await calculateRoute(origin, destination, waypoints);
    } catch (error) {
      console.error('Failed to calculate route:', error);
    }
  };

  const getManeuverIcon = (maneuver: string) => {
    switch (maneuver) {
      case 'turn-left':
        return <TurnLeft className="h-6 w-6 text-quantum-cyan" />;
      case 'turn-right':
        return <TurnRight className="h-6 w-6 text-quantum-cyan" />;
      default:
        return <ArrowUp className="h-6 w-6 text-quantum-cyan" />;
    }
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  return (
    <Card className="holographic-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-quantum-cyan" />
          Navigation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Route Information */}
        {currentRoute && (
          <div className="p-3 bg-quantum-darkBlue/30 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-quantum-cyan" />
                <span className="text-sm font-medium">Route Info</span>
              </div>
              <Badge variant="outline">
                {formatDistance(currentRoute.total_distance)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-gray-400" />
                <span>Duration: {formatDuration(currentRoute.total_duration)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span>Distance: {formatDistance(currentRoute.total_distance)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Active Navigation */}
        {isNavigating && navigationUpdate && (
          <div className="space-y-4">
            {/* Current Instruction */}
            <div className="p-4 bg-quantum-cyan/10 border border-quantum-cyan/30 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                {getManeuverIcon(navigationUpdate.currentStep.maneuver)}
                <div className="flex-1">
                  <p className="font-medium text-white">
                    {navigationUpdate.currentStep.instruction}
                  </p>
                  {navigationUpdate.currentStep.roadName && (
                    <p className="text-sm text-gray-400">
                      on {navigationUpdate.currentStep.roadName}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatDistance(navigationUpdate.currentStep.distanceToNext)}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{navigationUpdate.progress.percentComplete.toFixed(1)}%</span>
              </div>
              <Progress value={navigationUpdate.progress.percentComplete} />
            </div>

            {/* Remaining Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Remaining</p>
                <p className="font-medium">
                  {formatDistance(navigationUpdate.progress.distanceRemaining)}
                </p>
              </div>
              <div>
                <p className="text-gray-400">ETA</p>
                <p className="font-medium">
                  {navigationUpdate.eta.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>

            {/* Off Route Warning */}
            {navigationUpdate.offRoute && (
              <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">
                    Off route - Recalculating...
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isNavigating ? (
            <>
              <Button
                onClick={handleCalculateRoute}
                variant="outline"
                className="flex-1"
                disabled={isCalculatingRoute || !origin || !destination}
              >
                <Route className="h-4 w-4 mr-2" />
                {isCalculatingRoute ? 'Calculating...' : 'Calculate Route'}
              </Button>
              
              <Button
                onClick={handleStartNavigation}
                className="flex-1 bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
                disabled={isCalculatingRoute || !origin || !destination || !currentRoute}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Start Navigation
              </Button>
            </>
          ) : (
            <Button
              onClick={handleStopNavigation}
              variant="destructive"
              className="w-full"
            >
              Stop Navigation
            </Button>
          )}
        </div>

        {/* Requirements Info */}
        {(!origin || !destination) && (
          <div className="text-xs text-gray-400 text-center">
            Origin and destination locations required for navigation
          </div>
        )}
      </CardContent>
    </Card>
  );
};
