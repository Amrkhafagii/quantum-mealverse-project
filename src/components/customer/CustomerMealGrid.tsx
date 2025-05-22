
import React from 'react';
import { motion } from 'framer-motion';
import { CustomerMealCard } from '@/components/CustomerMealCard';
import { Loader2 } from 'lucide-react';
import { MealType } from '@/types/meal';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface CustomerMealGridProps {
  menuItems?: MealType[];
  isLoading: boolean;
  error?: unknown;
  onLocationRequest: () => void;
}

export const CustomerMealGrid: React.FC<CustomerMealGridProps> = ({
  menuItems,
  isLoading,
  error,
  onLocationRequest
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
      <div className="text-center py-12">
        <p className="text-xl text-red-500 mb-4">Error loading menu items</p>
        <Button 
          onClick={onLocationRequest}
          className="bg-quantum-cyan hover:bg-quantum-cyan/90"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!menuItems?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-xl mb-4">No menu items available from nearby restaurants</p>
        <p className="text-gray-400 mb-6">Try updating your location or check back later</p>
        <Button
          onClick={onLocationRequest}
          className="bg-quantum-cyan hover:bg-quantum-cyan/90"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Update Location
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {menuItems.map((item: MealType, index) => (
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
  );
};
