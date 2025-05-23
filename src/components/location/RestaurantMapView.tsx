
import React, { useCallback } from 'react';
import { MapPin, Locate, Search } from 'lucide-react';
import UnifiedMapView from '@/components/maps/UnifiedMapView';
import { Button } from '@/components/ui/button';
import { NearbyRestaurant } from '@/hooks/useNearestRestaurant';
import LocationPermissionHandler from './LocationPermissionHandler';
import { useLocationWithIndicators } from '@/hooks/useLocationWithIndicators';
import { toast } from 'sonner';

interface RestaurantMapViewProps {
  restaurants?: NearbyRestaurant[];
  selectedRestaurantId?: string;
  onRestaurantSelect?: (id: string) => void;
  onFindNearbyRequested?: () => void;
}

const RestaurantMapView: React.FC<RestaurantMapViewProps> = ({
  restaurants = [],
  selectedRestaurantId,
  onRestaurantSelect,
  onFindNearbyRequested
}) => {
  const {
    userLocation,
    mapCenter,
    isLoadingLocation,
    locationAccuracy,
    showAccuracyCircle,
    permissionGranted,
    handleCenterOnMe,
    requestLocationPermission
  } = useLocationWithIndicators();

  // Convert restaurants to map markers
  const getMapLocations = useCallback(() => {
    const markers = [];
    
    // Add restaurant markers
    if (restaurants && restaurants.length > 0) {
      for (const restaurant of restaurants) {
        if (restaurant.restaurant_id && restaurant.restaurant_name) {
          // Get coordinates from the restaurant object based on available properties
          let lat = null;
          let lng = null;
          
          // Check all possible coordinate property names
          if ('restaurant_lat' in restaurant && restaurant.restaurant_lat !== undefined) {
            lat = restaurant.restaurant_lat;
          } else if ('lat' in restaurant && restaurant.lat !== undefined) {
            lat = restaurant.lat;
          } else if ('latitude' in restaurant && restaurant.latitude !== undefined) {
            lat = restaurant.latitude;
          }
          
          if ('restaurant_lng' in restaurant && restaurant.restaurant_lng !== undefined) {
            lng = restaurant.restaurant_lng;
          } else if ('lng' in restaurant && restaurant.lng !== undefined) {
            lng = restaurant.lng;
          } else if ('longitude' in restaurant && restaurant.longitude !== undefined) {
            lng = restaurant.longitude;
          }
          
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
  const getEffectiveMarkers = useCallback(() => {
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
  const getEffectiveCenter = useCallback(() => {
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
        // Check all possible coordinate property names
        if ('restaurant_lat' in restaurant && 
            'restaurant_lng' in restaurant && 
            restaurant.restaurant_lat !== undefined && 
            restaurant.restaurant_lng !== undefined) {
          return {
            latitude: restaurant.restaurant_lat,
            longitude: restaurant.restaurant_lng
          };
        }
        
        if ('lat' in restaurant && 
            'lng' in restaurant && 
            restaurant.lat !== undefined && 
            restaurant.lng !== undefined) {
          return {
            latitude: restaurant.lat,
            longitude: restaurant.lng
          };
        }
        
        if ('latitude' in restaurant && 
            'longitude' in restaurant && 
            restaurant.latitude !== undefined && 
            restaurant.longitude !== undefined) {
          return {
            latitude: restaurant.latitude,
            longitude: restaurant.longitude
          };
        }
      }
    }
    
    // Default center (NYC)
    return { latitude: 40.7128, longitude: -74.0060 };
  }, [mapCenter, userLocation, restaurants]);

  // Handle find nearby restaurants
  const handleFindNearby = () => {
    if (!userLocation) {
      toast.error("Unable to determine your location. Please enable location services.");
      return;
    }
    
    if (onFindNearbyRequested) {
      onFindNearbyRequested();
      toast.success("Searching for restaurants near you...");
    } else {
      toast.info("This feature is not available yet.");
    }
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
          onMapReady={() => console.log("Map is ready")}
        />
      </div>
      
      {/* Map Control Buttons */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <Button 
          variant="secondary"
          size="sm"
          className="shadow-lg flex items-center gap-2"
          onClick={handleFindNearby}
        >
          <Search className="h-4 w-4" />
          Find Nearby Restaurants
        </Button>
        
        <Button 
          variant="secondary"
          size="sm"
          className="shadow-lg flex items-center gap-2"
          onClick={handleCenterOnMe}
          disabled={isLoadingLocation}
        >
          <Locate className="h-4 w-4" />
          {isLoadingLocation ? 'Locating...' : 'Center on Me'}
        </Button>
      </div>
    </div>
  );
};

export default RestaurantMapView;
