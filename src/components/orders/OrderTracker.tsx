import React from 'react';
import OrderLocationMap from './OrderLocationMap';
import { CustomerLocationView } from '../delivery/CustomerLocationView';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface OrderTrackerProps {
  order?: any; // Keep existing type
  driverLocation?: any; // Keep existing type
  onContactDriver?: () => void; // Keep existing type
  orderId?: string; // Add orderId as an optional prop
}

const OrderTracker: React.FC<OrderTrackerProps> = ({
  order,
  driverLocation,
  onContactDriver,
  orderId
}) => {
  // Update implementation to pass the correct props to OrderLocationMap
  // and handle removing the assignmentId prop that was causing the error
  
  const handleContactDriver = () => {
    if (onContactDriver) {
      onContactDriver();
    }
  };

  // Get delivery assignment ID from order
  const deliveryAssignmentId = order?.delivery_assignment?.id;
  const driverName = order?.delivery_assignment?.delivery_user ? 
    `${order.delivery_assignment.delivery_user.first_name} ${order.delivery_assignment.delivery_user.last_name}`.trim() : 
    undefined;

  return (
    <div className="space-y-4">
      {/* Real-time location tracking component */}
      {deliveryAssignmentId && orderId && (
        <CustomerLocationView
          deliveryAssignmentId={deliveryAssignmentId}
          orderId={orderId}
          driverName={driverName}
        />
      )}

      {/* Existing map component */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-lg overflow-hidden">
            <OrderLocationMap
              order={order}
              driver={driverLocation}
              showAccuracyCircle={true}
            />
          </div>
        </CardContent>
      </Card>
      
      {driverLocation && (
        <Button 
          variant="secondary" 
          className="w-full" 
          onClick={handleContactDriver}
        >
          Contact Driver
        </Button>
      )}
    </div>
  );
};

export default OrderTracker;
