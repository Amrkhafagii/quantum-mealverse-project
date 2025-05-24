import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import DeliveryGoogleMap from './DeliveryGoogleMap';
import NativeMap from './NativeMap';
import { AccuracyLevel } from '../location/LocationStatusIndicator';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapMarker } from '@/services/maps/MapService';

interface UnifiedMapViewProps {
  mapId: string;
  height?: string;
  width?: string;
  className?: string;
  title?: string;
  center?: { 
    latitude: number; 
    longitude: number; 
  };
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
  center,
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
  const [mapInstance, setMapInstance] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const maps = useGoogleMaps();
  
  // Determine center coordinates based on markers or provided center
  const determineCenter = () => {
    // If center is provided, use it
    if (center) {
      return center;
    }
    
    // If we have user location in markers (type=driver), use it as center
    const userLocation = additionalMarkers.find(marker => marker.type === 'driver');
    if (userLocation) {
      return { latitude: userLocation.latitude, longitude: userLocation.longitude };
    }
    
    // Otherwise, if we have any other markers, use the first one
    if (additionalMarkers.length > 0) {
      return { latitude: additionalMarkers[0].latitude, longitude: additionalMarkers[0].longitude };
    }
    
    // Default to NYC
    return { latitude: 40.7128, longitude: -74.0060 };
  };

  // Get center coordinates
  const centerCoords = determineCenter();
  
  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        // Create map instance
        const mapInstanceId = await maps.initializeMap(mapId, {
          center,
          zoom: zoomLevel,
          markers: additionalMarkers as MapMarker[],
          enableControls: isInteractive,
          liteMode: lowPerformanceMode,
          enableAnimation: isInteractive && !lowPerformanceMode
        });
        
        setMapInstance(mapInstanceId);
        setIsMapReady(true);
        
        // Add accuracy circle if needed
        if (showAccuracyCircle && maps.currentLocation) {
          const userMarker = additionalMarkers.find(m => m.type === 'driver');
          if (userMarker) {
            // Determine radius based on accuracy level
            let radius = 100; // Default
            if (locationAccuracy === 'high') radius = 50;
            else if (locationAccuracy === 'medium') radius = 100;
            else if (locationAccuracy === 'low') radius = 500;
            
            await maps.addCircle(mapInstanceId, {
              center: {
                latitude: userMarker.latitude,
                longitude: userMarker.longitude
              },
              radius,
              strokeColor: '#3388FF',
              strokeWidth: 2,
              fillColor: 'rgba(51, 136, 255, 0.2)',
              fillOpacity: 0.2
            });
          }
        }
        
        if (onMapReady) {
          onMapReady();
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };
    
    initMap();
    
    return () => {
      // Clean up map on unmount
      if (mapInstance) {
        maps.destroyMap(mapInstance).catch(console.error);
      }
    };
  }, [mapId, center?.latitude, center?.longitude, zoomLevel]); // Keep limited dependencies to prevent recreating the map
  
  // Update markers when they change
  useEffect(() => {
    if (!mapInstance || !isMapReady) return;
    
    // In a real implementation, would need to track markers and update them
    // For this simplified version, we would recreate the map
    // But that would be inefficient - a better approach would be to update existing markers
  }, [additionalMarkers, mapInstance, isMapReady]);

  // Render header if requested
  const renderHeader = () => {
    if (!showHeader) return null;
    
    return (
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
    );
  };

  // For backward compatibility, still render the old components
  // In a full refactoring, would transition completely to the new approach
  return (
    <div className={`flex flex-col overflow-hidden rounded-lg ${className}`}>
      {renderHeader()}
      <div className="flex-1 relative" style={{ width: width || '100%', height }}>
        {!isMapReady && (
          <Skeleton className="absolute inset-0" />
        )}
        <div id={mapId} className="w-full h-full"></div>
        
        {/* Keeping the old components for now as a fallback while transitioning */}
        {!isMapReady && (
          isNativePlatform ? (
            <NativeMap 
              mapId={mapId}
              center={{ lat: centerCoords.latitude, lng: centerCoords.longitude }}
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
              center={{ lat: centerCoords.latitude, lng: centerCoords.longitude }}
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
          )
        )}
      </div>
    </div>
  );
};

export default UnifiedMapView;
