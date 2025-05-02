import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDeliveryUser } from '@/hooks/useDeliveryUser';
import { findNearbyAssignments, acceptDeliveryAssignment, rejectAssignment } from '@/services/delivery/deliveryOrderAssignmentService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const AvailableOrders: React.FC = () => {
  const { user } = useAuth();
  const { deliveryUser } = useDeliveryUser(user?.id);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  
  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Error getting location:", err);
          toast({
            title: "Location Error",
            description: "Please enable location services to see nearby orders",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
    }
  }, []);
  
  const fetchAvailableOrders = async () => {
    if (!userPosition || !deliveryUser) return;
    
    try {
      setLoading(true);
      setError(null);
      const assignments = await findNearbyAssignments(
        userPosition.lat,
        userPosition.lng,
        10 // 10km radius
      );
      setAvailableOrders(assignments);
    } catch (err) {
      console.error('Error fetching available orders:', err);
      setError('Failed to load nearby orders');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (userPosition && deliveryUser) {
      fetchAvailableOrders();
      
      // Set up polling for new orders every 30 seconds
      const interval = setInterval(fetchAvailableOrders, 30000);
      
      return () => clearInterval(interval);
    }
  }, [userPosition, deliveryUser]);
  
  const handleAccept = async (assignmentId: string) => {
    if (!deliveryUser) return;
    
    try {
      await acceptDeliveryAssignment(assignmentId, deliveryUser.id);
      toast({
        title: "Order Accepted",
        description: "You have a new delivery assignment",
      });
      setAvailableOrders(availableOrders.filter(order => order.id !== assignmentId));
    } catch (err) {
      console.error('Error accepting order:', err);
      toast({
        title: "Error",
        description: "Failed to accept the order",
        variant: "destructive",
      });
    }
  };
  
  const handleReject = async (assignmentId: string) => {
    try {
      await rejectAssignment(assignmentId);
      setAvailableOrders(availableOrders.filter(order => order.id !== assignmentId));
    } catch (err) {
      console.error('Error rejecting order:', err);
      toast({
        title: "Error",
        description: "Failed to reject the order",
        variant: "destructive",
      });
    }
  };
  
  const refreshOrders = () => {
    fetchAvailableOrders();
  };
  
  if (!deliveryUser || deliveryUser.status !== 'active') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-lg font-medium">Not Available</p>
            <p className="text-sm text-gray-500 text-center">
              You need to be active to receive orders.
              Please set your status to active first.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>Available Orders</span>
          <Button variant="ghost" size="sm" onClick={refreshOrders} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </CardTitle>
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
        ) : availableOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="mb-2">No orders available nearby</p>
            <p className="text-sm">Check back soon or widen your delivery radius</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableOrders.map((order) => (
              <Card key={order.id} className="bg-quantum-darkBlue/50">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{order.restaurant?.name || 'Restaurant'}</CardTitle>
                    <span className="text-lg font-bold text-quantum-cyan">
                      $5.00 <span className="text-xs font-normal">base</span>
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-quantum-cyan" />
                      <span>{order.distance_km.toFixed(1)} km away</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-quantum-cyan" />
                      <span>Est. delivery time: {Math.round(order.estimate_minutes)} min</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-quantum-cyan" />
                      <span>Potential tip: $2-4</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-1">
                  <div className="flex justify-between w-full gap-2">
                    <Button 
                      variant="outline" 
                      className="w-1/2"
                      onClick={() => handleReject(order.id)}
                    >
                      Decline
                    </Button>
                    <Button 
                      className="w-1/2 bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90"
                      onClick={() => handleAccept(order.id)}
                    >
                      Accept
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
