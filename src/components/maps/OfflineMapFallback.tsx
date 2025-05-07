
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
}

export const OfflineMapFallback: React.FC<OfflineMapFallbackProps> = ({
  retry,
  isRetrying = false,
  isLowBandwidth = false,
  mapType = 'general',
  className
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

  return (
    <Card className={cn("w-full border border-muted", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          {isLowBandwidth ? (
            <>
              <WifiOff className="w-5 h-5 mr-2 text-amber-500" />
              <span>Limited Connectivity</span>
            </>
          ) : (
            <>  
              <Map className="w-5 h-5 mr-2 text-muted-foreground" />
              <span>{titles[mapType]}</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">
          {messages[mapType]}
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={retry}
          disabled={isRetrying}
          className="w-full text-sm"
        >
          {isRetrying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Trying to connect...
            </>
          ) : (
            'Retry Connection'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
