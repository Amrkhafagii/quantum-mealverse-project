
import React from 'react';
import { MapOff, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface OfflineMapFallbackProps {
  title?: string;
  description?: string;
  retry?: () => void;
  isRetrying?: boolean;
  showLocationData?: boolean;
  locationData?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  className?: string;
}

export const OfflineMapFallback: React.FC<OfflineMapFallbackProps> = ({
  title = "Map Unavailable",
  description = "The map cannot be displayed at this time.",
  retry,
  isRetrying = false,
  showLocationData = false,
  locationData,
  className = '',
}) => {
  return (
    <Card className={`bg-slate-800/30 border-slate-700/50 ${className}`}>
      <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[250px]">
        <MapOff className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-200 mb-1">{title}</h3>
        <p className="text-gray-400 mb-4 max-w-xs">{description}</p>
        
        {retry && (
          <Button 
            onClick={retry} 
            variant="outline" 
            size="sm"
            disabled={isRetrying}
            className="mb-4"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </>
            )}
          </Button>
        )}
        
        {showLocationData && locationData && (
          <div className="mt-2 p-3 bg-slate-800/50 rounded-md w-full max-w-xs">
            <div className="flex items-center mb-2">
              <MapPin className="h-4 w-4 text-quantum-cyan mr-2" />
              <span className="text-sm font-medium text-gray-300">Location Data</span>
            </div>
            
            {locationData.address && (
              <p className="text-xs text-gray-400 mb-1">{locationData.address}</p>
            )}
            
            {locationData.latitude && locationData.longitude && (
              <p className="text-xs text-gray-500 font-mono">
                {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
