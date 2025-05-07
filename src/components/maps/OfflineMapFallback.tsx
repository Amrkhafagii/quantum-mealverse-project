
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, WifiOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OfflineMapFallbackProps {
  retry: () => void;
  isRetrying?: boolean;
  isLowBandwidth?: boolean;
  mapType?: 'delivery' | 'restaurant' | 'general';
  className?: string;
  title?: string;
  description?: string;
  onRetry?: () => void;
  isLoading?: boolean;
  showLocationData?: boolean;
  locationData?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    lastUpdated?: string;
  };
}

export const OfflineMapFallback: React.FC<OfflineMapFallbackProps> = ({
  retry,
  isRetrying = false,
  isLowBandwidth = false,
  mapType = 'general',
  className,
  title,
  description,
  onRetry,
  isLoading = false,
  showLocationData = false,
  locationData
}) => {
  const titles = {
    delivery: 'Delivery Map Unavailable',
    restaurant: 'Restaurant Map Unavailable',
    general: 'Map Unavailable'
  };
  
  const messages = {
    delivery: isLowBandwidth 
      ? 'Poor connection detected. Using simplified map view.' 
      : 'Cannot load delivery map in offline mode.',
    restaurant: isLowBandwidth 
      ? 'Poor connection detected. Using simplified map view.' 
      : 'Cannot load restaurant location in offline mode.',
    general: isLowBandwidth 
      ? 'Poor connection detected. Using simplified map view.' 
      : 'Map cannot be displayed while offline.'
  };

  // Use custom title/description if provided, otherwise use defaults
  const displayTitle = title || (isLoading ? 'Loading Map' : titles[mapType]);
  const displayDescription = description || messages[mapType];

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      retry();
    }
  };

  return (
    <Card className={cn("w-full border border-muted", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin text-muted-foreground" />
              <span>Loading Map</span>
            </>
          ) : isLowBandwidth ? (
            <>
              <WifiOff className="w-5 h-5 mr-2 text-amber-500" />
              <span>Limited Connectivity</span>
            </>
          ) : (
            <>  
              <Map className="w-5 h-5 mr-2 text-muted-foreground" />
              <span>{displayTitle}</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">
          {displayDescription}
        </p>

        {showLocationData && locationData && (
          <div className="mb-4 p-3 bg-muted/20 rounded-md text-sm space-y-1">
            {locationData.address && (
              <p><span className="font-medium">Address:</span> {locationData.address}</p>
            )}
            {locationData.latitude && locationData.longitude && (
              <p><span className="font-medium">Coordinates:</span> {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}</p>
            )}
            {locationData.lastUpdated && (
              <p><span className="font-medium">Last updated:</span> {locationData.lastUpdated}</p>
            )}
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRetry}
          disabled={isRetrying || isLoading}
          className="w-full text-sm"
        >
          {isRetrying || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isLoading ? 'Loading...' : 'Trying to connect...'}
            </>
          ) : (
            'Retry Connection'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// Export as default as well to fix the import issue
export default OfflineMapFallback;
