
import React, { Suspense } from 'react';
import { MealType } from '@/types/meal';
import { motion, AnimatePresence } from 'framer-motion';
import { Restaurant } from '@/hooks/useRestaurantsData';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RestaurantSummary } from './RestaurantSummary';
import { CustomerMealGrid } from './CustomerMealGrid';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
                  restaurants={nearbyRestaurants}
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
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
