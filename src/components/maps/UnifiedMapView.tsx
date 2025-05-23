
import React from 'react';
import { Capacitor } from '@capacitor/core';
import DeliveryGoogleMap from './DeliveryGoogleMap';
import NativeMap from './NativeMap';
import { AccuracyLevel } from '../location/LocationAccuracyIndicator';

interface UnifiedMapViewProps {
  mapId: string;
  height?: string;
  width?: string;
  className?: string;
  title?: string;
  additionalMarkers?: Array<{
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    type?: string;
  }>;
  showHeader?: boolean;
  isInteractive?: boolean;
  zoomLevel?: number;
  lowPerformanceMode?: boolean;
  forceWebView?: boolean;
  locationAccuracy?: AccuracyLevel;
  showAccuracyCircle?: boolean;
  onMapReady?: () => void;
}

const UnifiedMapView: React.FC<UnifiedMapViewProps> = ({
  mapId,
  height = 'h-[300px]',
  width,
  className = '',
  title = '',
  additionalMarkers = [],
  showHeader = false,
  isInteractive = true,
  zoomLevel = 14,
  lowPerformanceMode = false,
  forceWebView = false,
  locationAccuracy,
  showAccuracyCircle,
  onMapReady
}) => {
  const isNativePlatform = Capacitor.isNativePlatform() && !forceWebView;

  // Determine center coordinates based on markers
  const determineCenter = () => {
    // If we have user location in markers (type=driver), use it as center
    const userLocation = additionalMarkers.find(marker => marker.type === 'driver');
    if (userLocation) {
      return { lat: userLocation.latitude, lng: userLocation.longitude };
    }
    
    // Otherwise, if we have any other markers, use the first one
    if (additionalMarkers.length > 0) {
      return { lat: additionalMarkers[0].latitude, lng: additionalMarkers[0].longitude };
    }
    
    // Default to NYC
    return { lat: 40.7128, lng: -74.0060 };
  };

  // Get center coordinates
  const center = determineCenter();

  // Render header if requested
  const renderHeader = () => {
    if (!showHeader) return null;
    
    return (
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
    );
  };

  return (
    <div className={`flex flex-col overflow-hidden rounded-lg ${className}`}>
      {renderHeader()}
      <div className="flex-1">
        {isNativePlatform ? (
          <NativeMap 
            mapId={mapId}
            center={center}
            zoom={zoomLevel}
            markers={additionalMarkers}
            height={height}
            width={width}
            className={className}
            liteMode={!isInteractive || lowPerformanceMode}
            locationAccuracy={locationAccuracy}
            showAccuracyCircle={showAccuracyCircle}
            onMapReady={onMapReady}
          />
        ) : (
          <DeliveryGoogleMap 
            mapId={mapId}
            center={center}
            zoom={zoomLevel}
            markers={additionalMarkers}
            height={height}
            width={width}
            className={className}
            enableControls={isInteractive}
            lowPerformanceMode={lowPerformanceMode}
            locationAccuracy={locationAccuracy}
            showAccuracyCircle={showAccuracyCircle}
            onMapReady={onMapReady}
          />
        )}
      </div>
    </div>
  );
};

export default UnifiedMapView;
