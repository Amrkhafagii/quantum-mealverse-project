
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, AlertCircle, Package, Navigation, Check, 
  Building, User, MapPin, Clock 
} from 'lucide-react';
import { useDeliveryAssignments } from '@/hooks/useDeliveryAssignments';
import { useDeliveryUser } from '@/hooks/useDeliveryUser';
import { useAuth } from '@/hooks/useAuth';
import { DeliveryAssignment } from '@/types/delivery-assignment';

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
    refreshData
  } = useDeliveryAssignments(deliveryUser?.id);
  
  const handleUpdateStatus = async (assignment: DeliveryAssignment, newStatus: string) => {
    try {
      switch (newStatus) {
        case 'picked_up':
          await markAsPickedUp(assignment.id);
          break;
        case 'on_the_way':
          await markAsOnTheWay(assignment.id);
          break;
        case 'delivered':
          await markAsDelivered(assignment.id);
          break;
      }
      refreshData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const getNextStatusButton = (assignment: DeliveryAssignment) => {
    switch (assignment.status) {
      case 'assigned':
        return (
          <Button 
            className="w-full bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90"
            onClick={() => handleUpdateStatus(assignment, 'picked_up')}
          >
            <Package className="mr-2 h-4 w-4" />
            Mark as Picked Up
          </Button>
        );
      case 'picked_up':
        return (
          <Button 
            className="w-full bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90"
            onClick={() => handleUpdateStatus(assignment, 'on_the_way')}
          >
            <Navigation className="mr-2 h-4 w-4" />
            Start Delivery
          </Button>
        );
      case 'on_the_way':
        return (
          <Button 
            className="w-full bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90"
            onClick={() => handleUpdateStatus(assignment, 'delivered')}
          >
            <Check className="mr-2 h-4 w-4" />
            Complete Delivery
          </Button>
        );
      default:
        return null;
    }
  };

  const renderDirectionsButton = (assignment: DeliveryAssignment) => {
    // Get destination based on current delivery stage
    let destination;
    if (assignment.status === 'assigned') {
      // Navigate to restaurant
      destination = assignment.restaurant && `${assignment.restaurant.latitude},${assignment.restaurant.longitude}`;
    } else {
      // Navigate to customer
      destination = assignment.customer && `${assignment.customer.latitude},${assignment.customer.longitude}`;
    }

    if (!destination) return null;

    return (
      <Button 
        variant="outline" 
        className="w-full mt-2"
        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank')}
      >
        <Navigation className="mr-2 h-4 w-4" />
        Get Directions
      </Button>
    );
  };
  
  if (loading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-red-400">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>Failed to load active deliveries</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={refreshData}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>Active Deliveries</span>
          <Button variant="ghost" size="sm" onClick={refreshData}>Refresh</Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {activeAssignments && activeAssignments.length > 0 ? (
          <div className="space-y-4">
            {activeAssignments.map((assignment) => (
              <Card key={assignment.id} className="bg-quantum-darkBlue/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Order #{assignment.order_id.substring(0, 8)}</CardTitle>
                  <div className="text-sm text-gray-400">
                    {assignment.status === 'assigned' && 'Ready for pickup'}
                    {assignment.status === 'picked_up' && 'Order picked up'}
                    {assignment.status === 'on_the_way' && 'On the way to customer'}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Restaurant Info */}
                  <div className="flex items-start space-x-2">
                    <Building className="h-5 w-5 text-quantum-cyan mt-1" />
                    <div>
                      <p className="font-medium">Restaurant</p>
                      <p className="text-sm text-gray-400">
                        {assignment.restaurant?.address || '123 Restaurant St.'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Customer Info - Only show if picked up or delivering */}
                  {(assignment.status === 'picked_up' || assignment.status === 'on_the_way') && (
                    <div className="flex items-start space-x-2">
                      <User className="h-5 w-5 text-quantum-cyan mt-1" />
                      <div>
                        <p className="font-medium">Customer</p>
                        <p className="text-sm text-gray-400">
                          {assignment.customer?.address || '456 Customer Ave.'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Distance and Time Estimate */}
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-quantum-cyan" />
                      <span>{assignment.distance_km?.toFixed(1) || "2.5"} km</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-quantum-cyan" />
                      <span>~{assignment.estimate_minutes || "15"} min</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="pt-2">
                    {getNextStatusButton(assignment)}
                    {renderDirectionsButton(assignment)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-lg">No active deliveries</p>
            <p className="text-sm mt-2">Check available orders to accept a delivery</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveDeliveries;
