
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
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useInterval } from '@/hooks/use-interval';
import { formatDistanceToNow } from 'date-fns';

export const ActiveDeliveries: React.FC = () => {
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
  
  const [selectedAssignment, setSelectedAssignment] = useState<DeliveryAssignment | null>(null);
  
  // Setup location tracking
  const { position, startTracking, stopTracking, isTracking } = useLocationTracker({
    watchPosition: true,
    trackingInterval: 10000,
    onLocationUpdate: (pos) => {
      // If we have an active delivery, update its location
      if (selectedAssignment && ['picked_up', 'on_the_way'].includes(selectedAssignment.status)) {
        updateLocation(
          selectedAssignment.id, 
          pos.coords.latitude, 
          pos.coords.longitude
        );
      }
    },
    onError: (err) => {
      console.error('Location error:', err);
      toast({
        title: "Location Error",
        description: "Unable to track your location. Please enable location services.",
        variant: "destructive",
      });
    }
  });
  
  // Start tracking when there's an active delivery
  useEffect(() => {
    if (activeAssignments.length > 0 && !isTracking) {
      startTracking();
    } else if (activeAssignments.length === 0 && isTracking) {
      stopTracking();
    }
    
    // Set the first active assignment as selected if none is selected
    if (activeAssignments.length > 0 && !selectedAssignment) {
      setSelectedAssignment(activeAssignments[0]);
    }
    
    // If the selected assignment is no longer in the active list, reset selection
    if (selectedAssignment && !activeAssignments.some(a => a.id === selectedAssignment.id)) {
      setSelectedAssignment(activeAssignments.length > 0 ? activeAssignments[0] : null);
    }
  }, [activeAssignments, isTracking, selectedAssignment, startTracking, stopTracking]);
  
  // Refresh data every minute
  useInterval(() => {
    refreshData();
  }, 60000);
  
  const handlePickup = async (assignment: DeliveryAssignment) => {
    await markAsPickedUp(assignment.id);
    setSelectedAssignment(prev => 
      prev?.id === assignment.id 
        ? { ...prev, status: 'picked_up' } 
        : prev
    );
  };
  
  const handleStartDelivery = async (assignment: DeliveryAssignment) => {
    await markAsOnTheWay(assignment.id);
    setSelectedAssignment(prev => 
      prev?.id === assignment.id 
        ? { ...prev, status: 'on_the_way' } 
        : prev
    );
  };
  
  const handleCompleteDelivery = async (assignment: DeliveryAssignment) => {
    await markAsDelivered(assignment.id);
    // We'll let the refresh handle removing this from active assignments
  };
  
  if (loading && activeAssignments.length === 0) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="p-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="p-8 flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-xl font-medium text-red-400 mb-2">Error</h3>
          <p className="text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!deliveryUser || deliveryUser.status !== 'active') {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="p-8 flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">Not Available</h3>
          <p className="text-gray-400 text-center max-w-md">
            You need to be active to see your deliveries.
            Please set your status to active first.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (activeAssignments.length === 0) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="p-8 flex flex-col items-center justify-center">
          <Package className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No Active Deliveries</h3>
          <p className="text-gray-400 text-center max-w-md">
            You don't have any active deliveries right now. 
            Check the available orders section to find new delivery opportunities.
          </p>
          <Button 
            onClick={refreshData} 
            className="mt-4"
            variant="outline"
          >
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge className="bg-blue-500">Assigned</Badge>;
      case 'picked_up':
        return <Badge className="bg-purple-500">Picked Up</Badge>;
      case 'on_the_way':
        return <Badge className="bg-yellow-500">On The Way</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };
  
  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Unknown time';
    }
  };
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Active Deliveries</span>
          <Button variant="ghost" size="sm" onClick={refreshData}>
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {activeAssignments.map((assignment) => (
            <Card 
              key={assignment.id} 
              className={`bg-quantum-darkBlue/50 ${selectedAssignment?.id === assignment.id ? 'border-quantum-cyan' : ''}`}
              onClick={() => setSelectedAssignment(assignment)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Order #{assignment.order_id.slice(-6)}</h3>
                  {getStatusBadge(assignment.status)}
                </div>
                <p className="text-sm text-gray-400">{getTimeAgo(assignment.created_at)}</p>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-quantum-cyan shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{assignment.restaurant?.name || 'Restaurant'}</p>
                      <p className="text-sm text-gray-400">{assignment.restaurant?.address || 'Loading address...'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-quantum-cyan shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Customer</p>
                      <p className="text-sm text-gray-400">{assignment.customer?.address || 'Loading address...'}</p>
                    </div>
                  </div>
                  
                  {assignment.distance_km && (
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-quantum-cyan" />
                      <span>Est. {Math.round(assignment.distance_km * 3)} min • {assignment.distance_km.toFixed(1)} km</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter>
                {assignment.status === 'assigned' && (
                  <Button 
                    onClick={() => handlePickup(assignment)}
                    className="w-full bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Mark as Picked Up
                  </Button>
                )}
                
                {assignment.status === 'picked_up' && (
                  <Button 
                    onClick={() => handleStartDelivery(assignment)}
                    className="w-full bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90"
                  >
                    <ChevronRight className="h-4 w-4 mr-2" />
                    Start Delivery
                  </Button>
                )}
                
                {assignment.status === 'on_the_way' && (
                  <Button 
                    onClick={() => handleCompleteDelivery(assignment)}
                    className="w-full bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Delivery
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
          
          {position && isTracking && (
            <div className="rounded border border-quantum-cyan/30 p-3 bg-quantum-darkBlue/20">
              <p className="text-sm text-gray-400 mb-1">Location Tracking Active</p>
              <p className="text-xs">
                Lat: {position.coords.latitude.toFixed(6)}, 
                Lng: {position.coords.longitude.toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
