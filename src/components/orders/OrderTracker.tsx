import React from 'react';
import OrderLocationMap from './OrderLocationMap';
import { Button } from '@/components/ui/button';

interface OrderTrackerProps {
  order: any; // Keep existing type
  driverLocation?: any; // Keep existing type
  onContactDriver?: () => void; // Keep existing type
  // Add more props as needed
}

const OrderTracker: React.FC<OrderTrackerProps> = ({
  order,
  driverLocation,
  onContactDriver
}) => {
  // Update implementation to pass the correct props to OrderLocationMap
  // and handle removing the assignmentId prop that was causing the error
  
  const handleContactDriver = () => {
    if (onContactDriver) {
      onContactDriver();
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden">
        <OrderLocationMap
          order={order}
          driver={driverLocation}
          showAccuracyCircle={true}
        />
      </div>
      
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
