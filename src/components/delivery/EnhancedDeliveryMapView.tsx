
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DeliveryMapView } from './DeliveryMapView';
import { NavigationPanel } from '@/components/navigation/NavigationPanel';
import { useDeliveryAssignments } from '@/hooks/useDeliveryAssignments';
import { useAuth } from '@/hooks/useAuth';
import { useDeliveryUser } from '@/hooks/useDeliveryUser';
import { useLocationPermission } from '@/hooks/useLocationPermission';

interface EnhancedDeliveryMapViewProps {
  showNavigationPanel?: boolean;
  activeAssignment?: any;
  className?: string;
}

export const EnhancedDeliveryMapView: React.FC<EnhancedDeliveryMapViewProps> = ({
  showNavigationPanel = true,
  activeAssignment,
  className = ''
}) => {
  const { user } = useAuth();
  const { deliveryUser } = useDeliveryUser(user?.id);
  const { activeAssignments } = useDeliveryAssignments(deliveryUser?.id);
  const { location } = useLocationPermission();
  
  const [selectedAssignment, setSelectedAssignment] = useState(activeAssignment);
  const [isNavigating, setIsNavigating] = useState(false);

  // Update selected assignment when props change
  useEffect(() => {
    if (activeAssignment) {
      setSelectedAssignment(activeAssignment);
    } else if (activeAssignments.length > 0) {
      setSelectedAssignment(activeAssignments[0]);
    }
  }, [activeAssignment, activeAssignments]);

  // Get navigation waypoints from assignment
  const getNavigationPoints = () => {
    if (!selectedAssignment || !location) return null;

    const origin = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      name: 'Your Location'
    };

    const waypoints = [];
    
    // Add restaurant as waypoint if not picked up yet
    if (selectedAssignment.status === 'assigned' && selectedAssignment.restaurant) {
      waypoints.push({
        latitude: selectedAssignment.restaurant.latitude,
        longitude: selectedAssignment.restaurant.longitude,
        name: selectedAssignment.restaurant.name
      });
    }

    const destination = {
      latitude: selectedAssignment.latitude,
      longitude: selectedAssignment.longitude,
      name: selectedAssignment.customer?.name || 'Customer Location'
    };

    return { origin, destination, waypoints };
  };

  const navigationPoints = getNavigationPoints();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Enhanced Map View */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <DeliveryMapView 
            activeAssignment={selectedAssignment}
            showControls={!isNavigating}
            className="h-[400px]"
          />
        </CardContent>
      </Card>

      {/* Navigation Panel */}
      {showNavigationPanel && selectedAssignment && navigationPoints && (
        <NavigationPanel
          assignmentId={selectedAssignment.id}
          deliveryUserId={deliveryUser?.id}
          origin={navigationPoints.origin}
          destination={navigationPoints.destination}
          waypoints={navigationPoints.waypoints}
          onNavigationStart={() => setIsNavigating(true)}
          onNavigationStop={() => setIsNavigating(false)}
        />
      )}

      {/* Assignment Selector */}
      {activeAssignments.length > 1 && (
        <Card className="holographic-card">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Select Assignment</h3>
              <div className="grid grid-cols-1 gap-2">
                {activeAssignments.map((assignment) => (
                  <button
                    key={assignment.id}
                    onClick={() => setSelectedAssignment(assignment)}
                    className={`p-3 rounded-lg text-left transition-colors ${
                      selectedAssignment?.id === assignment.id
                        ? 'bg-quantum-cyan/20 border border-quantum-cyan'
                        : 'bg-quantum-darkBlue/30 border border-transparent hover:border-quantum-cyan/50'
                    }`}
                  >
                    <div className="font-medium">
                      {assignment.restaurant?.name || 'Restaurant'}
                    </div>
                    <div className="text-sm text-gray-400">
                      to {assignment.customer?.name || 'Customer'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
