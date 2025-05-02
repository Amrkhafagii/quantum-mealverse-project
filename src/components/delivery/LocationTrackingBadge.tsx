
import React from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';

interface LocationTrackingBadgeProps {
  latitude: number;
  longitude: number;
  isStale: boolean;
  lastUpdated: Date | null;
  className?: string;
}

export const LocationTrackingBadge: React.FC<LocationTrackingBadgeProps> = ({
  latitude,
  longitude,
  isStale,
  lastUpdated,
  className = ''
}) => {
  return (
    <div className={`rounded border border-cyan-500/30 p-2 bg-cyan-900/10 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <MapPin className="h-3 w-3 mr-1 text-cyan-500" />
          <span className="text-xs font-medium text-cyan-500">Location</span>
        </div>
        {isStale && (
          <div className="flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1 text-yellow-500" />
            <span className="text-xs text-yellow-500">Outdated</span>
          </div>
        )}
      </div>
      
      <div className="mt-1">
        <p className="text-xs text-gray-400">
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
        {lastUpdated && (
          <p className="text-xs text-gray-500 mt-0.5">
            Updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationTrackingBadge;
