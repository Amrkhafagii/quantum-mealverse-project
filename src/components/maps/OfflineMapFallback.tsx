
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapOff, Wifi, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface OfflineMapFallbackProps {
  title?: string;
  description?: string;
  isLoading?: boolean;
  isRetrying?: boolean;
  onRetry?: () => void;
  className?: string;
  showLocationData?: boolean;
  locationData?: {
    latitude?: number | null;
    longitude?: number | null;
    address?: string;
    lastUpdated?: string;
  };
}

export function OfflineMapFallback({
  title = "Map Unavailable",
  description = "Unable to load map due to connection issues",
  isLoading = false,
  isRetrying = false,
  onRetry,
  className,
  showLocationData = false,
  locationData
}: OfflineMapFallbackProps) {
  return (
    <Card className={cn("w-full h-full min-h-[200px] bg-quantum-darkBlue/30", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-quantum-cyan" />
          ) : (
            <MapOff className="h-5 w-5 text-quantum-cyan" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-full py-8 text-center">
          {isLoading ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-quantum-cyan mb-4" />
              <p className="text-muted-foreground">Loading map data...</p>
            </>
          ) : (
            <>
              <MapOff className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="mb-4 text-muted-foreground">{description}</p>
              
              {showLocationData && locationData && (
                <div className="mb-6 max-w-md bg-quantum-darkBlue/50 p-3 rounded-md">
                  {locationData.address && (
                    <p className="mb-2 text-quantum-cyan font-medium">{locationData.address}</p>
                  )}
                  
                  {locationData.latitude && locationData.longitude && (
                    <p className="text-sm text-muted-foreground">
                      Location: {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                    </p>
                  )}
                  
                  {locationData.lastUpdated && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last updated: {locationData.lastUpdated}
                    </p>
                  )}
                </div>
              )}
              
              {onRetry && (
                <Button 
                  onClick={onRetry}
                  disabled={isRetrying}
                  variant="outline" 
                  className="mt-2"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <Wifi className="h-4 w-4 mr-2" />
                      Try Again
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default OfflineMapFallback;
