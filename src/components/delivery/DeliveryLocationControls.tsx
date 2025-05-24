
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { LocationStatusIndicator } from '../location/LocationStatusIndicator';
import { TrackingMode } from '@/utils/trackingModeCalculator';

export interface DeliveryLocationControlsProps {
  onLocationUpdate?: (location: any) => void;
  showHelp?: boolean;
}

export const DeliveryLocationControls: React.FC<DeliveryLocationControlsProps> = ({
  onLocationUpdate,
  showHelp = false
}) => {
  // This is a stub implementation to fix type errors
  const handleRefreshLocation = () => {
    if (onLocationUpdate) {
      onLocationUpdate({ latitude: 0, longitude: 0 });
    }
  };

  return (
    <Card className="mb-4 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LocationStatusIndicator 
              accuracy={100} 
              trackingMode={'medium' as TrackingMode} 
              isTracking={true} 
            />
            <span className="text-sm font-medium">Location Services</span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefreshLocation}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
