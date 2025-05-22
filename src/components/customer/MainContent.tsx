
import React, { Suspense } from 'react';
import { MealType } from '@/types/meal';
import { motion, AnimatePresence } from 'framer-motion';
import { NearbyRestaurant } from '@/hooks/useNearestRestaurant';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RestaurantSummary } from './RestaurantSummary';
import { CustomerMealGrid } from './CustomerMealGrid';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy load the map component
const RestaurantMapView = React.lazy(() => 
  import('@/components/location/RestaurantMapView')
);

interface MainContentProps {
  isMapView: boolean;
  menuItems?: MealType[];
  isLoading: boolean;
  error?: unknown;
  nearbyRestaurants: NearbyRestaurant[];
  toggleMapView: () => void;
  onLocationRequest: () => void;
}

export const MainContent: React.FC<MainContentProps> = ({
  isMapView,
  menuItems,
  isLoading,
  error,
  nearbyRestaurants,
  toggleMapView,
  onLocationRequest
}) => {
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
              isLoading={isLoading}
              error={error}
              onLocationRequest={onLocationRequest}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
