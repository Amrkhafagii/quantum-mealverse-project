
import React from 'react';
import { Card } from '@/components/ui/card';
import { AccuracyLevel } from '../location/LocationAccuracyIndicator';

interface NativeMapProps {
  mapId: string;
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    type?: string;
  }>;
  height?: string;
  width?: string;
  className?: string;
  liteMode?: boolean;
  locationAccuracy?: AccuracyLevel; // Added locationAccuracy prop
  showAccuracyCircle?: boolean; // Added showAccuracyCircle prop
}

// This is a placeholder component for native map implementation
// In a real app, this would use the Capacitor Google Maps plugin or similar
const NativeMap: React.FC<NativeMapProps> = ({
  mapId,
  center,
  zoom = 14,
  markers = [],
  height = '300px',
  width,
  className = '',
  liteMode = false,
  locationAccuracy, // Added locationAccuracy prop
  showAccuracyCircle // Added showAccuracyCircle prop
}) => {
  // In a real implementation, these props would be used to configure the native map

  return (
    <Card 
      className={`${className} overflow-hidden flex items-center justify-center bg-muted/20`}
      style={{
        width: width || '100%',
        height: height || '300px'
      }}
    >
      <div className="text-center p-4">
        <p className="text-sm font-medium">Native Map View</p>
        <p className="text-xs text-muted-foreground mt-1">Map ID: {mapId}</p>
        {markers.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">Markers: {markers.length}</p>
        )}
        {locationAccuracy && (
          <p className="text-xs text-muted-foreground mt-1">
            Accuracy: {locationAccuracy} {showAccuracyCircle ? '(circle visible)' : ''}
          </p>
        )}
      </div>
    </Card>
  );
};

export default NativeMap;
