import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { useMapView, defaultPosition } from '@/contexts/MapViewContext';
import debounce from 'lodash/debounce';

// Declare the googleMapCallback property on the window object
declare global {
  interface Window {
    googleMapCallback: () => void;
  }
}

// Define types for our component props
interface MapLocation {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  type?: 'driver' | 'restaurant' | 'customer' | 'generic';
}

interface DeliveryGoogleMapProps {
  driverLocation?: MapLocation;
  restaurantLocation?: MapLocation;
  customerLocation?: MapLocation;
  additionalMarkers?: MapLocation[];
  showRoute?: boolean;
  className?: string;
  zoom?: number;
  autoCenter?: boolean;
  onMapClick?: (location: { longitude: number, latitude: number }) => void;
  isInteractive?: boolean;
  mapId?: string;
  onMapLoad?: () => void;
}

// Default map container styles
const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.375rem' // equivalent to rounded-md in Tailwind
};

// Batch update manager
class BatchUpdateManager {
  private updateInterval: number = 200; // ms
  private updateTimeout: NodeJS.Timeout | null = null;
  private pendingUpdates: Record<string, any> = {};
  private updateCallbacks: Record<string, (value: any) => void> = {};

  constructor(interval?: number) {
    if (interval) this.updateInterval = interval;
  }

  registerCallback(key: string, callback: (value: any) => void) {
    this.updateCallbacks[key] = callback;
  }

  unregisterCallback(key: string) {
    delete this.updateCallbacks[key];
  }

  queueUpdate(key: string, value: any) {
    this.pendingUpdates[key] = value;
    
    if (!this.updateTimeout) {
      this.updateTimeout = setTimeout(() => {
        this.processUpdates();
      }, this.updateInterval);
    }
  }

  private processUpdates() {
    const keys = Object.keys(this.pendingUpdates);
    keys.forEach(key => {
      if (this.updateCallbacks[key]) {
        this.updateCallbacks[key](this.pendingUpdates[key]);
      }
    });
    
    this.pendingUpdates = {};
    this.updateTimeout = null;
  }
}

// Create a singleton batch update manager
const batchManager = new BatchUpdateManager();

const DeliveryGoogleMap: React.FC<DeliveryGoogleMapProps> = ({
  driverLocation,
  restaurantLocation,
  customerLocation,
  additionalMarkers = [],
  showRoute = false,
  className = 'h-[400px]',
  zoom = 13,
  autoCenter = true,
  onMapClick,
  isInteractive = true,
  mapId = 'default-map',
  onMapLoad,
}) => {
  const { googleMapsApiKey } = useGoogleMaps();
  const { getSavedPosition, savePosition } = useMapView();
  
  // For tracking open info windows
  const [selectedMarker, setSelectedMarker] = useState<MapLocation | null>(null);
  
  // For directions (routes)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  
  // State to track if Google Maps API is loaded
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const googleRef = useRef<any>(null);
  const mapInitialized = useRef<boolean>(false);
  
  // Store map instance
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Store markers to avoid re-creating them
  const markersRef = useRef<{[key: string]: google.maps.Marker}>({});
  const markersDataRef = useRef<{[key: string]: MapLocation}>({});
  
  // Track position change
  const lastPositionRef = useRef<{center: google.maps.LatLngLiteral, zoom: number} | null>(null);
  const positionChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Only initialize if we have an API key and we haven't initialized yet
    if (googleMapsApiKey && !isLoaded && !loadError) {
      // Create a script element to load the Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=googleMapCallback`;
      script.async = true;
      script.defer = true;
      
      // Define the callback function
      window.googleMapCallback = () => {
        googleRef.current = window.google;
        setIsLoaded(true);
      };
      
      // Handle errors
      script.onerror = () => {
        setLoadError(new Error('Failed to load Google Maps API'));
      };
      
      // Add the script to the document
      document.head.appendChild(script);
      
      // Clean up
      return () => {
        window.googleMapCallback = null as any;
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [googleMapsApiKey, isLoaded, loadError]);
  
  // Calculate map center and bounds
  const getMapCenter = useCallback(() => {
    // Try to get saved position first
    const savedPosition = getSavedPosition(mapId);
    if (savedPosition) {
      return savedPosition.center;
    }
    
    // Otherwise calculate from locations
    const locations = [
      driverLocation,
      restaurantLocation,
      customerLocation,
      ...additionalMarkers
    ].filter(Boolean) as MapLocation[];
    
    if (locations.length === 0) {
      return defaultPosition.center; // Default center if no locations
    }
    
    if (locations.length === 1) {
      return { lat: locations[0].latitude, lng: locations[0].longitude };
    }
    
    return locations.reduce(
      (center, loc) => ({
        lat: center.lat + loc.latitude / locations.length,
        lng: center.lng + loc.longitude / locations.length
      }),
      { lat: 0, lng: 0 }
    );
  }, [driverLocation, restaurantLocation, customerLocation, additionalMarkers, getSavedPosition, mapId]);
  
  // Get initial zoom level
  const getInitialZoom = useCallback(() => {
    const savedPosition = getSavedPosition(mapId);
    return savedPosition ? savedPosition.zoom : zoom;
  }, [getSavedPosition, mapId, zoom]);
  
  // Function to fit map to bounds of all markers
  const fitBounds = useCallback(() => {
    if (!mapRef.current || !googleRef.current) return;
    
    const locations = [
      driverLocation,
      restaurantLocation,
      customerLocation,
      ...additionalMarkers
    ].filter(Boolean) as MapLocation[];
    
    if (locations.length <= 1) return;
    
    const bounds = new googleRef.current.maps.LatLngBounds();
    locations.forEach(loc => {
      bounds.extend({ lat: loc.latitude, lng: loc.longitude });
    });
    
    mapRef.current.fitBounds(bounds);
    
    // Adjust zoom if too zoomed in
    const listener = googleRef.current.maps.event.addListener(mapRef.current, 'idle', () => {
      if (mapRef.current && mapRef.current.getZoom() !== undefined && mapRef.current.getZoom() > 16) {
        mapRef.current.setZoom(16);
      }
      googleRef.current.maps.event.removeListener(listener);
    });
  }, [driverLocation, restaurantLocation, customerLocation, additionalMarkers]);
  
  // Save map position with debounce
  const debouncedSavePosition = useCallback(
    debounce((center: google.maps.LatLngLiteral, zoom: number) => {
      savePosition(mapId, { center, zoom });
    }, 500), 
    [savePosition, mapId]
  );
  
  // Update markers efficiently using batch update manager
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !googleRef.current) return;

    // Register batch update handler
    const updateKey = `map-markers-${mapId}`;
    
    batchManager.registerCallback(updateKey, (locations: {
      driver?: MapLocation,
      restaurant?: MapLocation,
      customer?: MapLocation,
      additional: MapLocation[]
    }) => {
      // Process all location updates in one batch
      
      // Handle driver location update
      if (locations.driver) {
        updateOrCreateMarker('driver', locations.driver, 'driver');
      }
      
      // Handle restaurant location update
      if (locations.restaurant) {
        updateOrCreateMarker('restaurant', locations.restaurant, 'restaurant');
      }
      
      // Handle customer location update
      if (locations.customer) {
        updateOrCreateMarker('customer', locations.customer, 'customer');
      }
      
      // Handle additional markers
      if (locations.additional && locations.additional.length > 0) {
        locations.additional.forEach((marker, index) => {
          const key = `additional-${index}`;
          updateOrCreateMarker(key, marker, marker.type || 'generic');
        });
      }
      
      // Remove any markers that no longer exist
      const validKeys = ['driver', 'restaurant', 'customer'];
      if (locations.additional) {
        locations.additional.forEach((_, index) => {
          validKeys.push(`additional-${index}`);
        });
      }
      
      // Clean up unused markers
      Object.keys(markersRef.current).forEach(key => {
        if (!validKeys.includes(key)) {
          // Remove the marker
          markersRef.current[key].setMap(null);
          delete markersRef.current[key];
          delete markersDataRef.current[key];
        }
      });
    });
    
    // Function to update or create a marker
    function updateOrCreateMarker(key: string, location: MapLocation, type: string) {
      const markerPosition = { lat: location.latitude, lng: location.longitude };
      const existingMarker = markersRef.current[key];
      
      // If marker exists and only position changed, just update position
      if (existingMarker) {
        // Check if position changed
        const currentPosition = existingMarker.getPosition();
        if (currentPosition && 
            (Math.abs(currentPosition.lat() - location.latitude) > 0.000001 || 
             Math.abs(currentPosition.lng() - location.longitude) > 0.000001)) {
          existingMarker.setPosition(markerPosition);
        }
        // Update stored data
        markersDataRef.current[key] = location;
        return;
      }
      
      // Create new marker
      const marker = new googleRef.current.maps.Marker({
        position: markerPosition,
        map: mapRef.current,
        icon: getMarkerIcon(type),
        title: location.title || type
      });
      
      // Add click listener
      marker.addListener('click', () => {
        setSelectedMarker(location);
      });
      
      // Store marker reference
      markersRef.current[key] = marker;
      markersDataRef.current[key] = location;
    }
    
    // Get marker icon based on type
    function getMarkerIcon(locationType?: string) {
      if (!googleRef.current) return null;
      
      switch (locationType) {
        case 'driver':
          return {
            path: googleRef.current.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            fillColor: '#00FF00',
            fillOpacity: 1,
            strokeWeight: 1,
            scale: 6
          };
        case 'restaurant':
          return {
            path: googleRef.current.maps.SymbolPath.CIRCLE,
            fillColor: '#FF8C00',
            fillOpacity: 1,
            strokeWeight: 1,
            scale: 8
          };
        case 'customer':
          return {
            path: googleRef.current.maps.SymbolPath.CIRCLE,
            fillColor: '#FF0000',
            fillOpacity: 1,
            strokeWeight: 1,
            scale: 8
          };
        default:
          return {
            path: googleRef.current.maps.SymbolPath.CIRCLE,
            fillColor: '#3887be',
            fillOpacity: 1,
            strokeWeight: 1,
            scale: 7
          };
      }
    }
    
    // Clean up
    return () => {
      batchManager.unregisterCallback(updateKey);
    };
  }, [isLoaded, mapId]);
  
  // Queue location updates to batch manager
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    
    const updateKey = `map-markers-${mapId}`;
    batchManager.queueUpdate(updateKey, {
      driver: driverLocation,
      restaurant: restaurantLocation,
      customer: customerLocation,
      additional: additionalMarkers
    });
    
  }, [isLoaded, driverLocation, restaurantLocation, customerLocation, additionalMarkers, mapId]);
  
  // Set up directions when route should be displayed
  useEffect(() => {
    if (!isLoaded || !showRoute || !googleRef.current || !mapRef.current) return;
    
    // Determine route points - we need both driver and at least one destination
    if (!driverLocation || !(restaurantLocation || customerLocation)) return;
    
    const start = driverLocation;
    const end = customerLocation || restaurantLocation;
    if (!end) return;
    
    const directionsService = new googleRef.current.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: { lat: start.latitude, lng: start.longitude },
        destination: { lat: end.latitude, lng: end.longitude },
        travelMode: googleRef.current.maps.TravelMode.DRIVING,
      },
      (result: google.maps.DirectionsResult, status: google.maps.DirectionsStatus) => {
        if (status === googleRef.current.maps.DirectionsStatus.OK) {
          setDirections(result);
          setDirectionsError(null);
        } else {
          console.error(`Error fetching directions: ${status}`);
          setDirectionsError(`Couldn't fetch route: ${status}`);
          setDirections(null);
        }
      }
    );
  }, [isLoaded, showRoute, driverLocation, restaurantLocation, customerLocation]);
  
  // Update bounds when locations change and autoCenter is true
  useEffect(() => {
    if (isLoaded && mapRef.current && autoCenter) {
      fitBounds();
    }
  }, [isLoaded, fitBounds, autoCenter]);
  
  // Handle map load
  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    mapInitialized.current = true;
    
    // Set up position change listener
    map.addListener('idle', () => {
      if (!mapRef.current) return;
      
      const center = mapRef.current.getCenter();
      const zoom = mapRef.current.getZoom();
      
      if (!center || zoom === undefined) return;
      
      const centerLiteral = { lat: center.lat(), lng: center.lng() };
      lastPositionRef.current = { center: centerLiteral, zoom };
      
      // Debounced save position to avoid too many saves
      debouncedSavePosition(centerLiteral, zoom);
    });
    
    // Initial positioning
    if (!autoCenter) {
      const initialCenter = getMapCenter();
      const initialZoom = getInitialZoom();
      map.setCenter(initialCenter);
      map.setZoom(initialZoom);
    } else {
      fitBounds();
    }
    
    // Call onMapLoad callback if provided
    if (onMapLoad) onMapLoad();
  }, [fitBounds, autoCenter, getMapCenter, getInitialZoom, debouncedSavePosition, onMapLoad]);
  
  // Clean up on unmount
  const onUnmount = useCallback(() => {
    mapRef.current = null;
    mapInitialized.current = false;
    
    // Clear all marker references
    Object.values(markersRef.current).forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = {};
    markersDataRef.current = {};
    
    // Clear any pending position save
    if (positionChangeTimeoutRef.current) {
      clearTimeout(positionChangeTimeoutRef.current);
    }
  }, []);
  
  // Handle map clicks if callback provided
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (onMapClick && e.latLng) {
      onMapClick({
        latitude: e.latLng.lat(),
        longitude: e.latLng.lng()
      });
    }
    // Close any open info windows when map is clicked
    setSelectedMarker(null);
  }, [onMapClick]);
  
  if (loadError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-md border`}>
        <div className="text-center p-4">
          <p className="text-red-500 font-medium mb-2">Error loading Google Maps</p>
          <p className="text-sm text-gray-600">{loadError.message}</p>
        </div>
      </div>
    );
  }
  
  if (!isLoaded || !googleRef.current) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-md border`}>
        <div className="text-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
          <p className="text-sm text-gray-600 mt-2">Loading map...</p>
        </div>
      </div>
    );
  }
  
  // Once the map is loaded, render it
  return (
    <div className={`${className} relative`}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={getMapCenter()}
        zoom={getInitialZoom()}
        options={{
          disableDefaultUI: !isInteractive,
          zoomControl: isInteractive,
          scrollwheel: isInteractive,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: isInteractive,
        }}
        onClick={handleMapClick}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* We'll use batch update manager for markers */}
        
        {/* InfoWindow for selected marker */}
        {selectedMarker && (
          <InfoWindow 
            position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div>
              {selectedMarker.title && <h3>{selectedMarker.title}</h3>}
              {selectedMarker.description && <p>{selectedMarker.description}</p>}
            </div>
          </InfoWindow>
        )}
        
        {/* Route Display */}
        {showRoute && directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: '#3887be',
                strokeWeight: 5,
                strokeOpacity: 0.75
              }
            }}
          />
        )}
      </GoogleMap>
      
      {/* Route Error Display */}
      {directionsError && (
        <div className="absolute bottom-2 left-2 right-2 bg-red-100 text-red-700 text-sm p-2 rounded">
          {directionsError}
        </div>
      )}
    </div>
  );
};

export default DeliveryGoogleMap;
