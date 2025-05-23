
import React from 'react';
import { MapPin, Locate } from 'lucide-react';
import UnifiedMapView from '@/components/maps/UnifiedMapView';
import { Button } from '@/components/ui/button';
import { NearbyRestaurant } from '@/hooks/useNearestRestaurant';
import LocationPermissionHandler from './LocationPermissionHandler';
import { useLocationWithIndicators } from '@/hooks/useLocationWithIndicators';

interface RestaurantMapViewProps {
  restaurants?: NearbyRestaurant[];
  selectedRestaurantId?: string;
  onRestaurantSelect?: (id: string) => void;
}

const RestaurantMapView: React.FC<RestaurantMapViewProps> = ({
  restaurants = [],
  selectedRestaurantId,
  onRestaurantSelect
}) => {
  const {
    userLocation,
    mapCenter,
    isLoadingLocation,
    locationAccuracy,
    showAccuracyCircle,
    permissionGranted,
    handleCenterOnMe
  } = useLocationWithIndicators();

  // Convert restaurants to map markers
  const getMapLocations = React.useCallback(() => {
    const markers = [];
    
    // Add restaurant markers
    if (restaurants && restaurants.length > 0) {
      for (const restaurant of restaurants) {
        if (restaurant.restaurant_id && restaurant.restaurant_name) {
          // Check if restaurant has restaurant_latitude/longitude or latitude/longitude
          const lat = restaurant.restaurant_latitude !== undefined ? restaurant.restaurant_latitude : 
                     restaurant.latitude !== undefined ? restaurant.latitude : null;
                     
          const lng = restaurant.restaurant_longitude !== undefined ? restaurant.restaurant_longitude : 
                     restaurant.longitude !== undefined ? restaurant.longitude : null;
          
          // Only add restaurant to map if it has valid coordinates
          if (lat !== null && lng !== null) {
            markers.push({
              latitude: lat,
              longitude: lng,
              title: restaurant.restaurant_name,
              description: `${restaurant.distance_km.toFixed(1)} km away`,
              type: 'restaurant'
            });
          }
        }
      }
    }
    
    return markers;
  }, [restaurants]);

  // Get all markers
  const getEffectiveMarkers = React.useCallback(() => {
    const locationMarkers = getMapLocations();
    
    // Add user location marker if available
    if (userLocation) {
      locationMarkers.push({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        title: 'Your Location',
        type: 'driver' // Using 'driver' type as it represents the current user
      });
    }
    
    return locationMarkers;
  }, [getMapLocations, userLocation]);

  // Get center coordinates for the map
  const getEffectiveCenter = () => {
    // If user has explicitly set a map center, use that
    if (mapCenter) {
      return mapCenter;
    }
    
    // If we have a user location, use that
    if (userLocation) {
      return userLocation;
    }
    
    // If we have restaurants, use the first one with valid coordinates
    if (restaurants && restaurants.length > 0) {
      for (const restaurant of restaurants) {
        // Check for valid coordinates
        if (restaurant.restaurant_latitude !== undefined && restaurant.restaurant_longitude !== undefined) {
          return {
            latitude: restaurant.restaurant_latitude,
            longitude: restaurant.restaurant_longitude
          };
        }
        
        if (restaurant.latitude !== undefined && restaurant.longitude !== undefined) {
          return {
            latitude: restaurant.latitude,
            longitude: restaurant.longitude
          };
        }
      }
    }
    
    // Default center (NYC)
    return { latitude: 40.7128, longitude: -74.0060 };
  };

  // If permission is not granted, show permission handler
  if (permissionGranted === false) {
    return (
      <div className="space-y-4">
        <LocationPermissionHandler 
          onPermissionGranted={() => {
            // Permission was granted, now we can show the map
            handleCenterOnMe();
          }}
        />
        
        {/* Show limited map without user location */}
        <div className="rounded-lg overflow-hidden mt-4 opacity-70">
          <UnifiedMapView 
            mapId="restaurant-map"
            height="h-[300px]"
            className="w-full"
            additionalMarkers={getMapLocations()}
            showHeader={true}
            title="Restaurants Near You"
            isInteractive={false}
            zoomLevel={13}
          />
        </div>
      </div>
    );
  }

  const allMarkers = getEffectiveMarkers();
  const center = getEffectiveCenter();
  
  return (
    <div className="relative">
      {/* Show a message if no restaurants are available */}
      {restaurants.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-quantum-black/70 rounded-lg">
          <div className="text-center p-6">
            <MapPin className="h-12 w-12 text-quantum-cyan mb-4 mx-auto" />
            <h3 className="text-xl font-medium mb-2">No Restaurants Found</h3>
            <p className="text-gray-400 max-w-md mb-4">
              We couldn't find any restaurants in your area. Try updating your location.
            </p>
            <Button onClick={handleCenterOnMe} disabled={isLoadingLocation}>
              {isLoadingLocation ? 'Finding location...' : 'Find My Location'}
            </Button>
          </div>
        </div>
      )}
      
      {/* The actual map component */}
      <div className="rounded-lg overflow-hidden">
        <UnifiedMapView 
          mapId="restaurant-map"
          height="h-[500px]"
          className="w-full"
          additionalMarkers={allMarkers}
          showHeader={true}
          title="Restaurants Near You"
          isInteractive={true}
          zoomLevel={13}
          locationAccuracy={locationAccuracy}
          showAccuracyCircle={showAccuracyCircle}
        />
      </div>
      
      {/* Center on me button */}
      <Button 
        variant="secondary"
        size="sm"
        className="absolute bottom-4 right-4 z-20 shadow-lg flex items-center gap-2"
        onClick={handleCenterOnMe}
        disabled={isLoadingLocation}
      >
        <Locate className="h-4 w-4" />
        {isLoadingLocation ? 'Locating...' : 'Center on Me'}
      </Button>
    </div>
  );
};

export default RestaurantMapView;
