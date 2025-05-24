
import React, { Suspense, memo, useMemo } from 'react';
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
import { LazyComponentLoader } from '@/components/performance/LazyComponentLoader';
import { AnimatedContainer } from '@/components/performance/AnimatedContainer';

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

const LoadingSpinner = memo(() => (
  <AnimatedContainer animation="fadeIn" className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan mr-2" />
    <span>Loading restaurants and menu items...</span>
  </AnimatedContainer>
));

const ErrorAlert = memo(({ error }: { error: unknown }) => (
  <AnimatedContainer animation="slideUp">
    <Alert className="bg-red-900/20 border-red-600/30 mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="text-red-200">
        {typeof error === 'string' ? error : 'Error loading restaurants and menu items. Please try again later.'}
      </AlertDescription>
    </Alert>
  </AnimatedContainer>
));

const HowItWorksSection = memo(() => (
  <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
    <CardHeader>
      <CardTitle className="text-white text-xl text-center">How Quantum Mealverse Works</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: Navigation, title: "1. Browse Restaurants", desc: "Explore all available restaurants and their menus" },
          { icon: Globe, title: "2. Order Easily", desc: "Browse menu items from multiple restaurants in one place" },
          { icon: Clock, title: "3. Quick Delivery", desc: "Get accurate delivery times when you provide your location" }
        ].map((item, index) => (
          <AnimatedContainer key={item.title} animation="slideUp" delay={index * 0.1}>
            <div className="text-center">
              <div className="bg-quantum-cyan/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <item.icon className="h-8 w-8 text-quantum-cyan" />
              </div>
              <h4 className="font-semibold text-white mb-2">{item.title}</h4>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          </AnimatedContainer>
        ))}
      </div>
    </CardContent>
  </Card>
));

const LocationOptionalBanner = memo(({ onLocationRequest }: { onLocationRequest: () => void }) => (
  <AnimatedContainer animation="slideUp">
    <Card className="bg-gradient-to-r from-quantum-darkBlue/40 to-quantum-cyan/20 border-quantum-cyan/30 shadow-lg mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <MapPin className="h-8 w-8 text-quantum-cyan" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Enable Location for Better Experience</h3>
              <p className="text-gray-300 text-sm">
                Share your location to see nearby restaurants first and get accurate delivery estimates.
              </p>
            </div>
          </div>
          <Button 
            onClick={onLocationRequest}
            variant="outline"
            className="border-quantum-cyan/30 text-quantum-cyan hover:bg-quantum-cyan/10"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Enable Location
          </Button>
        </div>
      </CardContent>
    </Card>
  </AnimatedContainer>
));

export const MainContent: React.FC<MainContentProps> = memo(({
  isMapView,
  menuItems = [],
  isLoading,
  error,
  nearbyRestaurants = [],
  toggleMapView,
  onLocationRequest
}) => {
  // Memoize filtered restaurants to prevent unnecessary recalculations
  const restaurantsWithDistance = useMemo(() => 
    nearbyRestaurants.filter(restaurant => restaurant.distance_km !== undefined),
    [nearbyRestaurants]
  );

  // Convert unknown error to Error type or null
  const processedError = useMemo(() => {
    if (!error) return null;
    if (error instanceof Error) return error;
    if (typeof error === 'string') {
      const err = new Error(error);
      err.name = 'CustomerError';
      return err;
    }
    const err = new Error('An unknown error occurred');
    err.name = 'UnknownError';
    return err;
  }, [error]);

  console.log('MainContent rendering with:', {
    isMapView,
    menuItemsCount: menuItems?.length,
    isLoading,
    error,
    nearbyRestaurantsCount: nearbyRestaurants?.length
  });

  // Show error state if there's an error and not loading
  if (processedError && !isLoading) {
    return <ErrorAlert error={processedError} />;
  }

  // Optimized loading state - only show spinner during meaningful loading
  if (isLoading && nearbyRestaurants.length === 0) {
    return <LoadingSpinner />;
  }

  // Show content with restaurants available
  if (nearbyRestaurants.length > 0) {
    // Check if user has location (restaurants have distance info)
    const hasLocationData = restaurantsWithDistance.length > 0;
    
    return (
      <>
        {!hasLocationData && <LocationOptionalBanner onLocationRequest={onLocationRequest} />}
        
        <AnimatedContainer animation="slideUp">
          <RestaurantSummary restaurants={nearbyRestaurants} />
        </AnimatedContainer>

        <AnimatePresence mode="wait">
          {isMapView ? (
            <motion.div
              key="map-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="min-h-[500px] rounded-lg overflow-hidden mb-8"
            >
              <ErrorBoundary fallback={
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-quantum-darkBlue/30 rounded-lg p-6">
                  <p className="text-lg mb-4">Map view could not be loaded</p>
                  <Button onClick={toggleMapView}>Switch to List View</Button>
                </div>
              }>
                <LazyComponentLoader className="min-h-[400px]">
                  <RestaurantMapView 
                    restaurants={restaurantsWithDistance as any}
                  />
                </LazyComponentLoader>
              </ErrorBoundary>
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <CustomerMealGrid 
                menuItems={menuItems}
                isLoading={isLoading}
                error={processedError}
                onLocationRequest={onLocationRequest}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // No restaurants available - show helpful content
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <AnimatedContainer animation="slideUp">
        <Card className="bg-gradient-to-r from-quantum-darkBlue/40 to-quantum-cyan/20 border-quantum-cyan/30 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <Globe className="h-16 w-16 text-quantum-cyan mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-3">No Restaurants Available</h3>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                We're currently working on adding restaurants to your area. Please check back soon!
              </p>
              <Button 
                onClick={() => window.location.reload()}
                size="lg"
                className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black font-semibold px-8 py-3"
              >
                <Navigation className="h-5 w-5 mr-2" />
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>

      <AnimatedContainer animation="slideUp" delay={0.2}>
        <HowItWorksSection />
      </AnimatedContainer>
    </motion.div>
  );
});

MainContent.displayName = 'MainContent';
