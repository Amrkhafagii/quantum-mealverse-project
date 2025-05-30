
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { LocationData } from '@/types/location';
import { useNetworkQuality } from '@/responsive/core/hooks';
import MapContainer from '@/components/maps/MapContainer';

interface DeliveryMapViewProps {
  driverLocation?: LocationData | null;
  customerLocation?: LocationData | null;
  restaurantLocation?: LocationData | null;
  estimatedArrivalTime?: Date | null;
  isOnline?: boolean;
  showRoute?: boolean;
  activeAssignment?: any;
  className?: string;
  showControls?: boolean;
}

const DeliveryMapView: React.FC<DeliveryMapViewProps> = ({
  driverLocation,
  customerLocation,
  restaurantLocation,
  estimatedArrivalTime,
  isOnline,
  showRoute = true,
  activeAssignment,
  className,
  showControls = true
}) => {
  const { quality } = useNetworkQuality();
  const [showOfflineAlert, setShowOfflineAlert] = useState(!isOnline);
  
  useEffect(() => {
    setShowOfflineAlert(!isOnline);
  }, [isOnline]);
  
  const getStatusMessage = () => {
    if (!isOnline) {
      return "Offline: Map data may be limited.";
    }
    
    if (quality === 'poor') {
      return "Poor Connection: Map loading may be slow.";
    }
    
    return null;
  };
  
  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-4 w-4 mr-2 text-red-500" />;
    }
    
    if (quality === 'poor') {
      return <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />;
    }
    
    return null;
  };
  
  return (
    <Card className={`w-full h-full flex flex-col ${className}`}>
      <CardContent className="p-0 flex-grow relative">
        {showOfflineAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-2 left-2 z-50"
          >
            <Alert variant="destructive">
              <AlertDescription>
                <WifiOff className="h-4 w-4 mr-2" />
                You are currently offline. Map updates may be limited.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        {getStatusMessage() && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-2 left-2 z-40"
          >
            <Alert>
              <AlertDescription>
                {getStatusIcon()}
                {getStatusMessage()}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        <MapContainer
          driverLocation={driverLocation}
          customerLocation={customerLocation}
          restaurantLocation={restaurantLocation}
          isInteractive={false}
          showRoute={showRoute}
        />
      </CardContent>
    </Card>
  );
};

// Export both named and default
export { DeliveryMapView };
export default DeliveryMapView;
