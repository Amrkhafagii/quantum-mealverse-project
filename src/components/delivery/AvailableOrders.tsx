import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PackagePlus, 
  MapPin, 
  AlertCircle, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocationTracker } from '@/hooks/useLocationTracker';
import { DeliveryAssignment } from '@/types/delivery';
import { getAvailableDeliveryAssignments } from '@/services/delivery/deliveryAssignmentService';

interface AvailableOrdersProps {
  deliveryUserId: string;
  onAssign: (assignmentId: string) => void;
}

export const AvailableOrders: React.FC<AvailableOrdersProps> = ({ deliveryUserId, onAssign }) => {
  const { toast } = useToast();
  const [availableAssignments, setAvailableAssignments] = useState<DeliveryAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { location, permissionStatus, error, getCurrentLocation, locationIsValid, isLocationStale } = useLocationTracker();
  
  useEffect(() => {
    if (!deliveryUserId) return;
    loadAvailableAssignments();
    
    // Poll for new assignments every 30 seconds
    const interval = setInterval(loadAvailableAssignments, 30000);
    return () => clearInterval(interval);
  }, [deliveryUserId, location]);
  
  const loadAvailableAssignments = useCallback(async () => {
    if (!deliveryUserId) return;
    try {
      setLoading(true);
      if (!location || !locationIsValid()) {
        await getCurrentLocation();
      }
      
      if (!location || !locationIsValid()) {
        toast({
          title: "Location required",
          description: "Please enable location services to view available deliveries.",
          variant: "destructive"
        });
        return;
      }
      
      const assignments = await getAvailableDeliveryAssignments(deliveryUserId, location.latitude, location.longitude);
      setAvailableAssignments(assignments);
    } catch (error) {
      console.error('Error loading available assignments:', error);
      toast({
        title: "Couldn't load deliveries",
        description: "There was a problem loading available deliveries.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [deliveryUserId, location, getCurrentLocation, locationIsValid, toast]);
  
  const handleAssignOrder = async (assignmentId: string) => {
    try {
      onAssign(assignmentId);
      toast({
        title: "Order assigned",
        description: "The order has been assigned to you.",
      });
    } catch (error) {
      console.error('Error assigning order:', error);
      toast({
        title: "Assignment failed",
        description: "Couldn't assign the order. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAvailableAssignments();
    } finally {
      setRefreshing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
      </div>
    );
  }
  
  if (availableAssignments.length === 0) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="p-8 flex flex-col items-center justify-center">
          <PackagePlus className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No Available Deliveries</h3>
          <p className="text-gray-400 text-center max-w-md">
            There are no available deliveries in your area at the moment. Please check back later.
          </p>
          {permissionStatus === 'denied' && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Location access denied. Please enable location services in your browser settings.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Available Deliveries</h2>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={refreshing}
          onClick={handleRefresh}
        >
          {refreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>
      {availableAssignments.map((assignment) => (
        <Card key={assignment.id} className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Order #{assignment.order_id.slice(-6)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Restaurant</p>
                  <p className="font-medium">[Restaurant Name]</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Customer</p>
                  <p className="font-medium">[Customer Name]</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Pickup Time</p>
                  <p className="font-medium">
                    {assignment.pickup_time 
                      ? new Date(assignment.pickup_time).toLocaleTimeString() 
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Estimated Delivery</p>
                  <p className="font-medium">
                    {assignment.estimated_delivery_time 
                      ? new Date(assignment.estimated_delivery_time).toLocaleTimeString()
                      : 'Not specified'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  View on Map
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleAssignOrder(assignment.id)}
                >
                  Accept Delivery
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
