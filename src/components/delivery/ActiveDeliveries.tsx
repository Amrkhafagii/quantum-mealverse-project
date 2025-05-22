import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDeliveryUser } from '@/hooks/useDeliveryUser';
import { useDeliveryAssignments } from '@/hooks/useDeliveryAssignments';
import { useLocationTracker } from '@/hooks/useLocationTracker';
import { DeliveryAssignment } from '@/types/delivery-assignment';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Clock,
  AlertCircle,
  ChevronRight,
  Package,
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useInterval } from '@/hooks/use-interval';
import { formatDistanceToNow } from 'date-fns';

interface ActiveDeliveriesProps {
  selectedAssignmentId?: string;
  onAssignmentSelect?: (assignment: DeliveryAssignment) => void;
}

export const ActiveDeliveries: React.FC<ActiveDeliveriesProps> = ({ 
  selectedAssignmentId,
  onAssignmentSelect
}) => {
  const { user } = useAuth();
  const { deliveryUser } = useDeliveryUser(user?.id);
  const { 
    activeAssignments, 
    loading, 
    error,
    markAsPickedUp,
    markAsOnTheWay,
    markAsDelivered,
    updateLocation,
    refreshData 
  } = useDeliveryAssignments(deliveryUser?.id);
  
  const [locationUpdateTime, setLocationUpdateTime] = useState<Date | null>(null);
  
  // Setup enhanced location tracking
  const { 
    location, 
    isTracking, 
    startTracking, 
    stopTracking, 
    isLocationStale,
    lastUpdated,
    getCurrentLocation,
    permissionStatus
  } = useLocationTracker();
  
  // Force a location update on demand
  const handleForceLocationUpdate = async () => {
    try {
      const location = await getCurrentLocation();
      if (location && selectedAssignmentId) {
        updateLocation(
          selectedAssignmentId,
          location.latitude,
          location.longitude
        );
        setLocationUpdateTime(new Date());
        toast({
          title: "Location Updated",
          description: "Your current location has been updated.",
        });
      }
    } catch (err) {
      console.error('Error updating location:', err);
      toast({
        title: "Location Error",
        description: "Unable to update your location. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Start tracking when there's an active delivery
  useEffect(() => {
    if (activeAssignments.length > 0 && !isTracking) {
      startTracking();
    } else if (activeAssignments.length === 0 && isTracking) {
      stopTracking();
    }
  }, [activeAssignments, isTracking, startTracking, stopTracking]);
  
  // Refresh data every minute
  useInterval(() => {
    refreshData();
  }, 60000);
  
  const handlePickup = async (assignment: DeliveryAssignment) => {
    try {
      await markAsPickedUp(assignment.id);
    } catch (error) {
      console.error('Error marking as picked up:', error);
    }
  };
  
  const handleStartDelivery = async (assignment: DeliveryAssignment) => {
    try {
      await markAsOnTheWay(assignment.id);
    } catch (error) {
      console.error('Error marking as on the way:', error);
    }
  };
  
  const handleDelivered = async (assignment: DeliveryAssignment) => {
    try {
      await markAsDelivered(assignment.id);
    } catch (error) {
      console.error('Error marking as delivered:', error);
    }
  };

  const handleSelectAssignment = (assignment: DeliveryAssignment) => {
    if (onAssignmentSelect) {
      onAssignmentSelect(assignment);
    }
  };
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Active Deliveries</CardTitle>
          <Button variant="ghost" size="sm" onClick={refreshData} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        ) : activeAssignments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Package className="h-8 w-8 mx-auto mb-2" />
            <p className="mb-2">No active deliveries</p>
            <p className="text-sm">Check the available orders tab for new assignments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeAssignments.map((assignment) => {
              const isSelected = assignment.id === selectedAssignmentId;
              
              return (
                <Card 
                  key={assignment.id} 
                  className={`bg-quantum-darkBlue/50 border ${
                    isSelected ? 'border-quantum-cyan' : 'border-gray-700'
                  } cursor-pointer transition-colors`}
                  onClick={() => handleSelectAssignment(assignment)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          {assignment.restaurant?.name || 'Restaurant'}
                          <ChevronRight className="h-5 w-5 ml-2" />
                          {isSelected && (
                            <span className="text-xs bg-quantum-cyan text-black px-2 py-0.5 rounded ml-2">
                              Selected
                            </span>
                          )}
                        </CardTitle>
                        <p className="text-xs text-gray-400">
                          Order #{assignment.order_id.substring(0, 8)}
                        </p>
                      </div>
                      
                      <Badge
                        className={`
                          ${assignment.status === 'assigned' ? 'bg-yellow-500' : ''}
                          ${assignment.status === 'picked_up' ? 'bg-blue-500' : ''}
                          ${assignment.status === 'on_the_way' ? 'bg-purple-500' : ''}
                        `}
                      >
                        {assignment.status === 'assigned' ? 'New' : ''}
                        {assignment.status === 'picked_up' ? 'Picked Up' : ''}
                        {assignment.status === 'on_the_way' ? 'On The Way' : ''}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      {assignment.restaurant && (
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                          <span className="truncate">{assignment.restaurant.address || 'Restaurant address'}</span>
                        </div>
                      )}
                      
                      {assignment.customer && (
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-red-500" />
                          <span className="truncate">{assignment.customer.address || 'Customer address'}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-quantum-cyan" />
                        <span>{formatDistanceToNow(new Date(assignment.created_at), { addSuffix: true })}</span>
                      </div>
                      
                      {locationUpdateTime && assignment.id === selectedAssignmentId && (
                        <div className="text-xs text-green-400 flex items-center">
                          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-1.5"></span>
                          Location updated {formatDistanceToNow(locationUpdateTime, { addSuffix: true })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-1">
                    <div className="flex justify-between w-full">
                      {assignment.status === 'assigned' && (
                        <Button 
                          className="w-full bg-orange-500 hover:bg-orange-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePickup(assignment);
                          }}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Mark as Picked Up
                        </Button>
                      )}
                      
                      {assignment.status === 'picked_up' && (
                        <Button 
                          className="w-full bg-blue-500 hover:bg-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartDelivery(assignment);
                          }}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Start Delivery
                        </Button>
                      )}
                      
                      {assignment.status === 'on_the_way' && (
                        <Button 
                          className="w-full bg-green-500 hover:bg-green-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelivered(assignment);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Delivered
                        </Button>
                      )}

                      {(assignment.status === 'picked_up' || assignment.status === 'on_the_way') && (
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleForceLocationUpdate();
                          }}
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
