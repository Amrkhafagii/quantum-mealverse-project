
import React from 'react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Card, CardContent } from '@/components/ui/card';
import { GoogleMapsKeyForm } from './GoogleMapsKeyForm';
import DeliveryGoogleMap from './DeliveryGoogleMap';

interface MapContainerProps {
  className?: string;
  driverLocation?: any;
  customerLocation?: any;
  restaurantLocation?: any;
  children?: React.ReactNode;
  showRoute?: boolean;
  isInteractive?: boolean;
  height?: string;
}

const MapContainer: React.FC<MapContainerProps> = ({
  className,
  driverLocation,
  customerLocation,
  restaurantLocation,
  children,
  showRoute = true,
  isInteractive = true,
  height = 'h-[300px]'
}) => {
  const { googleMapsApiKey } = useGoogleMaps();

  return (
    <Card className={className}>
      <CardContent className={`p-0 overflow-hidden ${height}`}>
        {!googleMapsApiKey ? (
          <div className="p-4">
            <GoogleMapsKeyForm />
          </div>
        ) : (
          <DeliveryGoogleMap
            driverLocation={driverLocation}
            customerLocation={customerLocation}
            restaurantLocation={restaurantLocation}
            showRoute={showRoute}
            isInteractive={isInteractive}
            className={`w-full h-full`}
          />
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default MapContainer;
