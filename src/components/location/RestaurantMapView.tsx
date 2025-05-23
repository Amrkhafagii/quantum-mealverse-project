
import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Locate } from 'lucide-react';
import UnifiedMapView from '@/components/maps/UnifiedMapView';
import { Button } from '@/components/ui/button';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { NearbyRestaurant } from '@/hooks/useNearestRestaurant';
import { toast } from 'sonner';
import { getHighAccuracyLocation, isHighAccuracyLocation } from '@/utils/locationAccuracyManager';
import { AccuracyLevel } from './LocationAccuracyIndicator';

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
  const { lastLocation, getCurrentLocation, isLoadingLocation } = useCurrentLocation();
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [mapCenter, setMapCenter] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<AccuracyLevel>('unknown');
  const [showAccuracyCircle, setShowAccuracyCircle] = useState(false);

  // Convert restaurants to map markers
  const getMapLocations = useCallback(() => {
    const markers = [];
    
    // Add restaurant markers
    if (restaurants && restaurants.length > 0) {
      for (const restaurant of restaurants) {
        // Ensure we're accessing restaurant_latitude and restaurant_longitude instead of latitude/longitude
        if (restaurant.restaurant_id && restaurant.restaurant_name) {
          // Check if restaurant has restaurant_latitude/longitude or latitude/longitude
          const lat = 'restaurant_latitude' in restaurant ? restaurant.restaurant_latitude : 
                     'latitude' in restaurant ? restaurant.latitude : 0;
          const lng = 'restaurant_longitude' in restaurant ? restaurant.restaurant_longitude : 
                     'longitude' in restaurant ? restaurant.longitude : 0;
                     
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
    
    return markers;
  }, [restaurants]);

  // Update user location when lastLocation changes
  useEffect(() => {
    if (lastLocation && lastLocation.latitude && lastLocation.longitude) {
      setUserLocation({
        latitude: lastLocation.latitude,
        longitude: lastLocation.longitude
      });
      
      // If we don't have a map center yet, center on user
      if (!mapCenter) {
        setMapCenter({
          latitude: lastLocation.latitude,
          longitude: lastLocation.longitude
        });
      }
      
      // Set location accuracy level
      if (lastLocation.accuracy) {
        if (lastLocation.accuracy < 50) {
          setLocationAccuracy('high');
        } else if (lastLocation.accuracy < 200) {
          setLocationAccuracy('medium');
        } else {
          setLocationAccuracy('low');
        }
      }
    }
  }, [lastLocation, mapCenter]);

  const handleCenterOnMe = async () => {
    if (userLocation) {
      // If we already have a location, center on it immediately
      setMapCenter({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });
      setShowAccuracyCircle(true);
      
      // Then try to get a fresh location
      toast.loading('Updating your location...');
      try {
        const freshLocation = await getHighAccuracyLocation();
        if (freshLocation && isHighAccuracyLocation(freshLocation)) {
          setUserLocation({
            latitude: freshLocation.latitude,
            longitude: freshLocation.longitude
          });
          setMapCenter({
            latitude: freshLocation.latitude,
            longitude: freshLocation.longitude
          });
          
          // Update accuracy level
          if (freshLocation.accuracy < 50) {
            setLocationAccuracy('high');
          } else if (freshLocation.accuracy < 200) {
            setLocationAccuracy('medium');
          } else {
            setLocationAccuracy('low');
          }
          
          toast.success('Location updated');
        } else {
          toast.warning('Could not get a high accuracy location');
        }
      } catch (error) {
        console.error('Error updating location:', error);
        toast.error('Failed to update location');
      }
    } else {
      // If we don't have a location yet, try to get one
      toast.loading('Getting your location...');
      try {
        const location = await getCurrentLocation();
        if (location) {
          setUserLocation({
            latitude: location.latitude,
            longitude: location.longitude
          });
          setMapCenter({
            latitude: location.latitude,
            longitude: location.longitude
          });
          setShowAccuracyCircle(true);
          toast.success('Location found');
        } else {
          toast.error('Could not get your location');
        }
      } catch (error) {
        console.error('Error getting location:', error);
        toast.error('Failed to get location');
      }
    }
  };

  // Select a center point based on available data
  const getEffectiveCenter = () => {
    // If user has explicitly set a map center, use that
    if (mapCenter) {
      return mapCenter;
    }
    
    // If we have a user location, use that
    if (userLocation) {
      return userLocation;
    }
    
    // If we have restaurants, use the first one
    if (restaurants && restaurants.length > 0) {
      // Safely check for coordinates in the restaurant object
      const firstRestaurant = restaurants[0];
      
      // Check if restaurant has restaurant_latitude/longitude or latitude/longitude
      if ('restaurant_latitude' in firstRestaurant && 'restaurant_longitude' in firstRestaurant) {
        return {
          latitude: firstRestaurant.restaurant_latitude,
          longitude: firstRestaurant.restaurant_longitude
        };
      }
      
      if ('latitude' in firstRestaurant && 'longitude' in firstRestaurant) {
        return {
          latitude: firstRestaurant.latitude,
          longitude: firstRestaurant.longitude
        };
      }
    }
    
    // Default center (NYC)
    return { latitude: 40.7128, longitude: -74.0060 };
  };

  const center = getEffectiveCenter();
  const locations = getMapLocations();

  // Add user location to markers if available
  const allMarkers = [...locations];
  if (userLocation) {
    allMarkers.push({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      title: 'Your Location',
      type: 'driver' // Using 'driver' type as it represents the current user in the map component
    });
  }
  
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
