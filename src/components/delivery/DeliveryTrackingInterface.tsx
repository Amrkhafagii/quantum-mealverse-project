
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger, Tabs, TabsContent } from '@/components/ui/tabs';
import { useDeliveryAssignments } from '@/hooks/useDeliveryAssignments';
import { useDeliveryLocationService } from '@/hooks/useDeliveryLocationService';
import { useAuth } from '@/hooks/useAuth';
import { useDeliveryUser } from '@/hooks/useDeliveryUser';
import { MapPin, Navigation, AlertTriangle, Map as MapIcon } from 'lucide-react'; // Fixed 'Map' import
import { Order } from '@/types/order';
import { Platform } from '@/utils/platform';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { toast } from '@/hooks/use-toast';

interface DeliveryTrackingInterfaceProps {
  orderId?: string;
  showMap?: boolean;
  isMinimal?: boolean;
}

export const DeliveryTrackingInterface: React.FC<DeliveryTrackingInterfaceProps> = ({
  orderId,
  showMap = true,
  isMinimal = false,
}) => {
  const { user } = useAuth();
  const { deliveryUser } = useDeliveryUser(user?.id);
  const { isOnline } = useConnectionStatus();
  const isMobile = Platform.isNative() || window.innerWidth < 768;
  const [tab, setTab] = useState<string>('active');
  
  const {
    activeAssignments,
    pastAssignments,
    markAsPickedUp,
    markAsOnTheWay,
    markAsDelivered,
    updateLocation,
    refreshData,
  } = useDeliveryAssignments(deliveryUser?.id);
  
  const {
    location,
    startTracking,
    isTracking,
    updateTrackingInterval,
    isBatteryLow
  } = useDeliveryLocationService();
  
  // Find the selected assignment (either specified by orderId or the first active one)
  const selectedAssignment = orderId
    ? activeAssignments.find(a => a.order_id === orderId)
    : activeAssignments[0];
  
  // Start tracking location when we have active assignments
  useEffect(() => {
    if (activeAssignments.length > 0 && !isTracking) {
      startTracking().catch(error => {
        console.error('Failed to start location tracking:', error);
        toast({
          title: 'Location Tracking Error',
          description: 'Unable to track location. Please check your settings.',
          variant: 'destructive',
        });
      });
    }
  }, [activeAssignments.length, isTracking, startTracking]);
  
  // Update tracking frequency based on distance to destination
  useEffect(() => {
    if (selectedAssignment && location) {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        selectedAssignment.latitude || 0,
        selectedAssignment.longitude || 0
      );
      
      updateTrackingInterval(distance);
    }
  }, [selectedAssignment, location, updateTrackingInterval]);
  
  // Update location for active assignments
  useEffect(() => {
    if (isOnline && location && activeAssignments.length > 0) {
      // Only send updates if we're actually moving (to save battery)
      if (isTracking && location.isMoving) {
        activeAssignments.forEach(assignment => {
          updateLocation(assignment.id, location.latitude, location.longitude);
        });
      }
    }
  }, [isOnline, location, activeAssignments, updateLocation, isTracking]);
  
  // Periodically refresh data when online
  useEffect(() => {
    if (!isOnline) return;
    
    const interval = setInterval(() => {
      refreshData();
    }, isBatteryLow ? 60000 : 30000); // Less frequent updates when battery is low
    
    return () => clearInterval(interval);
  }, [isOnline, refreshData, isBatteryLow]);
  
  // Helper function to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in meters
  };
  
  // Handle various delivery status updates
  const handlePickup = async (assignmentId: string) => {
    if (!isOnline) {
      toast({
        title: 'You are offline',
        description: 'Cannot update order status while offline',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await markAsPickedUp(assignmentId);
    } catch (error) {
      console.error('Error marking as picked up:', error);
    }
  };
  
  const handleStartDelivery = async (assignmentId: string) => {
    if (!isOnline) {
      toast({
        title: 'You are offline',
        description: 'Cannot update order status while offline',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await markAsOnTheWay(assignmentId);
    } catch (error) {
      console.error('Error marking as on the way:', error);
    }
  };
  
  const handleComplete = async (assignmentId: string) => {
    if (!isOnline) {
      toast({
        title: 'You are offline',
        description: 'Cannot update order status while offline',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await markAsDelivered(assignmentId);
    } catch (error) {
      console.error('Error marking as delivered:', error);
    }
  };
  
  // Minimal view for embedding in other components
  if (isMinimal) {
    return (
      <div>
        {selectedAssignment ? (
          <DeliveryActionPanel
            assignment={selectedAssignment}
            onPickup={handlePickup}
            onStartDelivery={handleStartDelivery}
            onComplete={handleComplete}
            isOffline={!isOnline}
          />
        ) : (
          <div className="text-center p-4 text-gray-500">
            No active deliveries
          </div>
        )}
      </div>
    );
  }
  
  // Full tracking interface with tabs and map
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Delivery Tracking</h2>
      
      {!isOnline && (
        <div className="bg-yellow-500/20 p-3 rounded-md flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <span className="text-sm">
            You're offline. Some features may be limited.
          </span>
        </div>
      )}
      
      <Tabs defaultValue="active" value={tab} onValueChange={setTab}>
        <TabsList className={isMobile ? "w-full grid grid-cols-2" : ""}>
          <TabsTrigger value="active">
            Active Deliveries {activeAssignments.length > 0 && `(${activeAssignments.length})`}
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Deliveries
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-4 space-y-4">
          {activeAssignments.length > 0 ? (
            activeAssignments.map(assignment => (
              <Card key={assignment.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium">
                      Order #{assignment.formatted_order_id || assignment.order_id?.substring(0, 8)}
                    </CardTitle>
                    <DeliveryStatusBadge status={assignment.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      {assignment.restaurant && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-5 w-5 mt-0.5 text-orange-500" />
                          <div>
                            <p className="font-medium">{assignment.restaurant.name}</p>
                            <p className="text-sm text-gray-500">{assignment.restaurant.address}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-2">
                        <Navigation className="h-5 w-5 mt-0.5 text-blue-500" />
                        <div>
                          <p className="font-medium">Delivery Address</p>
                          <p className="text-sm text-gray-500">{assignment.delivery_address}</p>
                        </div>
                      </div>
                      
                      <DeliveryActionPanel
                        assignment={assignment}
                        onPickup={handlePickup}
                        onStartDelivery={handleStartDelivery}
                        onComplete={handleComplete}
                        isOffline={!isOnline}
                      />
                    </div>
                    
                    {showMap && (
                      <div className="h-[200px] bg-gray-100 rounded-md overflow-hidden relative">
                        {Platform.isWeb ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <MapIcon className="h-6 w-6 text-gray-400" />
                            <span className="ml-2 text-gray-500">Map View</span>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <MapIcon className="h-6 w-6 text-gray-400" />
                            <span className="ml-2 text-gray-500">Native Map</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center p-6 text-gray-500">
              No active deliveries
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-4 space-y-4">
          {pastAssignments.length > 0 ? (
            pastAssignments.map(assignment => (
              <Card key={assignment.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium">
                      Order #{assignment.formatted_order_id || assignment.order_id?.substring(0, 8)}
                    </CardTitle>
                    <DeliveryStatusBadge status={assignment.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Completed:</span> {new Date(assignment.updated_at).toLocaleString()}</p>
                    <p><span className="font-medium">Customer:</span> {assignment.customer_name}</p>
                    <p><span className="font-medium">Address:</span> {assignment.delivery_address}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center p-6 text-gray-500">
              No past deliveries
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Delivery Status Badge Component
interface DeliveryStatusBadgeProps {
  status: string;
}

const DeliveryStatusBadge: React.FC<DeliveryStatusBadgeProps> = ({ status }) => {
  let variant: 
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "success" = "default";
  
  switch (status) {
    case 'assigned':
      variant = "secondary";
      break;
    case 'picked_up':
      variant = "default";
      break;
    case 'on_the_way':
      variant = "success";
      break;
    case 'delivered':
      variant = "outline";
      break;
    default:
      variant = "outline";
  }
  
  // Format the status for display
  let displayStatus = status.replace(/_/g, ' ');
  displayStatus = displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1);
  
  return (
    <Badge variant={variant as any}>
      {displayStatus}
    </Badge>
  );
};

// Delivery Action Panel Component
interface DeliveryActionPanelProps {
  assignment: any;
  onPickup: (id: string) => void;
  onStartDelivery: (id: string) => void;
  onComplete: (id: string) => void;
  isOffline: boolean;
}

const DeliveryActionPanel: React.FC<DeliveryActionPanelProps> = ({
  assignment,
  onPickup,
  onStartDelivery,
  onComplete,
  isOffline,
}) => {
  let actionButton;
  
  switch (assignment.status) {
    case 'assigned':
      actionButton = (
        <Button 
          onClick={() => onPickup(assignment.id)} 
          disabled={isOffline}
          className="w-full"
        >
          Mark as Picked Up
        </Button>
      );
      break;
    case 'picked_up':
      actionButton = (
        <Button 
          onClick={() => onStartDelivery(assignment.id)} 
          disabled={isOffline}
          className="w-full"
        >
          Start Delivery
        </Button>
      );
      break;
    case 'on_the_way':
      actionButton = (
        <Button 
          onClick={() => onComplete(assignment.id)} 
          disabled={isOffline}
          className="w-full"
        >
          Mark as Delivered
        </Button>
      );
      break;
    case 'delivered':
      actionButton = (
        <Button 
          disabled
          variant="outline"
          className="w-full"
        >
          Completed
        </Button>
      );
      break;
    default:
      actionButton = null;
  }
  
  return (
    <div className="pt-2">
      {actionButton}
    </div>
  );
};

export default DeliveryTrackingInterface;
