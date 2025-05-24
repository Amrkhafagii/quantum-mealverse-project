
import React, { Suspense } from 'react';
import { MealType } from '@/types/meal';
import { motion, AnimatePresence } from 'framer-motion';
import { Restaurant } from '@/hooks/useRestaurantsData';
import { Loader2, AlertCircle, MapPin, Globe, Navigation, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RestaurantSummary } from './RestaurantSummary';
import { CustomerMealGrid } from './CustomerMealGrid';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RestaurantMapView = React.lazy(() => 
  import('@/components/location/RestaurantMapView')
);

interface MainContentProps {
  isMapView: boolean;
  menuItems?: MealType[];
  isLoading: boolean;
  error?: unknown;
  nearbyRestaurants: Restaurant[];
  toggleMapView: () => void;
  onLocationRequest: () => void;
}

export const MainContent: React.FC<MainContentProps> = ({
  isMapView,
  menuItems = [],
  isLoading,
  error,
  nearbyRestaurants = [],
  toggleMapView,
  onLocationRequest
}) => {
  console.log('MainContent rendering with:', {
    isMapView,
    menuItemsCount: menuItems?.length,
    isLoading,
    error,
    nearbyRestaurantsCount: nearbyRestaurants?.length
  });

  // Show error state if there's an error
  if (error && !isLoading) {
    return (
      <Alert className="bg-red-900/20 border-red-600/30 mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-200">
          Error loading restaurants and menu items. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan mr-2" />
        <span>Loading restaurants and menu items...</span>
      </div>
    );
  }

  // Show helpful content when no location is available
  if (nearbyRestaurants.length === 0 && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Main CTA Card */}
        <Card className="bg-gradient-to-r from-quantum-darkBlue/40 to-quantum-cyan/20 border-quantum-cyan/30 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-quantum-cyan mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-3">Enable Location to Get Started</h3>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                We need your location to find nearby restaurants and show you available menu items for delivery.
              </p>
              <Button 
                onClick={onLocationRequest}
                size="lg"
                className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black font-semibold px-8 py-3"
              >
                <MapPin className="h-5 w-5 mr-2" />
                Enable Location Access
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How It Works Section */}
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader>
            <CardTitle className="text-white text-xl text-center">How Quantum Mealverse Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-quantum-cyan/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Navigation className="h-8 w-8 text-quantum-cyan" />
                </div>
                <h4 className="font-semibold text-white mb-2">1. Find Restaurants</h4>
                <p className="text-gray-400 text-sm">
                  We locate restaurants near you based on your current location
                </p>
              </div>
              <div className="text-center">
                <div className="bg-quantum-cyan/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-quantum-cyan" />
                </div>
                <h4 className="font-semibold text-white mb-2">2. Browse Menus</h4>
                <p className="text-gray-400 text-sm">
                  Explore menu items from multiple restaurants in one place
                </p>
              </div>
              <div className="text-center">
                <div className="bg-quantum-cyan/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-quantum-cyan" />
                </div>
                <h4 className="font-semibold text-white mb-2">3. Quick Delivery</h4>
                <p className="text-gray-400 text-sm">
                  Get accurate delivery times and track your order in real-time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Information */}
        <Card className="bg-quantum-darkBlue/20 border-quantum-cyan/10">
          <CardContent className="p-6">
            <div className="text-center">
              <h4 className="font-semibold text-white mb-2">Your Privacy Matters</h4>
              <p className="text-gray-400 text-sm max-w-2xl mx-auto">
                Your location data is only used to find nearby restaurants and calculate delivery times. 
                We never share your location with third parties or store it permanently on our servers.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Filter restaurants that have distance_km for map view
  const restaurantsWithDistance = nearbyRestaurants.filter(restaurant => 
    restaurant.distance_km !== undefined
  );

  return (
    <>
      <RestaurantSummary restaurants={nearbyRestaurants} />

      <AnimatePresence mode="wait">
        {isMapView ? (
          <motion.div
            key="map-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-[500px] rounded-lg overflow-hidden mb-8"
          >
            <ErrorBoundary fallback={
              <div className="flex flex-col items-center justify-center min-h-[400px] bg-quantum-darkBlue/30 rounded-lg p-6">
                <p className="text-lg mb-4">Map view could not be loaded</p>
                <Button onClick={toggleMapView}>Switch to List View</Button>
              </div>
            }>
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-quantum-darkBlue/30 rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan mb-4" />
                  <p>Loading map view...</p>
                </div>
              }>
                <RestaurantMapView 
                  restaurants={restaurantsWithDistance as any}
                />
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        ) : (
          <motion.div
            key="list-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CustomerMealGrid 
              menuItems={menuItems}
              isLoading={false}
              error={null}
              onLocationRequest={onLocationRequest}
              hasRestaurants={nearbyRestaurants.length > 0}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
