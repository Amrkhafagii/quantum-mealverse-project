
import React from 'react';
import { motion } from 'framer-motion';
import { CustomerMealCard } from '@/components/CustomerMealCard';
import { Loader2, ChefHat, Clock, Star, MapPin } from 'lucide-react';
import { MealType } from '@/types/meal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CustomerMealGridProps {
  menuItems?: MealType[];
  isLoading: boolean;
  error?: unknown;
  onLocationRequest: () => void;
  hasRestaurants?: boolean;
}

export const CustomerMealGrid: React.FC<CustomerMealGridProps> = ({
  menuItems,
  isLoading,
  error,
  onLocationRequest,
  hasRestaurants = false
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan mx-auto mb-4" />
        <p className="text-xl mb-2">Loading menu items...</p>
        <p className="text-gray-400">Please wait while we fetch items from nearby restaurants</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-600/30">
        <CardContent className="p-8 text-center">
          <div className="text-red-400 mb-4">
            <ChefHat className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Unable to Load Menu Items</h3>
          </div>
          <p className="text-red-300 mb-6">
            There was an error loading menu items from nearby restaurants. This could be due to network issues or temporary server problems.
          </p>
          <Button 
            onClick={onLocationRequest}
            variant="outline"
            className="border-red-500/50 text-red-200 hover:bg-red-500/10"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Enhanced empty state when restaurants are found but no menu items
  if (hasRestaurants && (!menuItems || menuItems.length === 0)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="p-8 text-center">
            <ChefHat className="h-16 w-16 text-quantum-cyan mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-3">No Menu Items Available</h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              We found restaurants near you, but they don't have any menu items available for delivery right now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onLocationRequest}
                className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Update Location
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-quantum-cyan/30 text-quantum-cyan hover:bg-quantum-cyan/10"
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Helpful suggestions */}
        <Card className="bg-quantum-darkBlue/20 border-quantum-cyan/10">
          <CardHeader>
            <CardTitle className="text-white text-lg text-center">What you can try:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-quantum-darkBlue/30 rounded-lg p-4">
                <Clock className="h-6 w-6 text-quantum-cyan mb-2" />
                <h4 className="font-semibold text-white mb-1">Check Back Later</h4>
                <p className="text-gray-400 text-sm">
                  Restaurants may update their menus throughout the day
                </p>
              </div>
              <div className="bg-quantum-darkBlue/30 rounded-lg p-4">
                <Star className="h-6 w-6 text-quantum-cyan mb-2" />
                <h4 className="font-semibold text-white mb-1">Try Different Area</h4>
                <p className="text-gray-400 text-sm">
                  Update your location to find more restaurants
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Show general empty state when no restaurants at all
  if (!hasRestaurants) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="p-8 text-center">
            <MapPin className="h-16 w-16 text-quantum-cyan mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-3">Location Required</h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Please enable location access to discover restaurants and menu items near you.
            </p>
            <Button
              onClick={onLocationRequest}
              size="lg"
              className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
            >
              <MapPin className="h-5 w-5 mr-2" />
              Enable Location
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Render menu items grid
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Available Menu Items ({menuItems?.length || 0})
        </h2>
      </div>

      {/* Menu items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {menuItems?.map((item: MealType, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <CustomerMealCard meal={item} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
