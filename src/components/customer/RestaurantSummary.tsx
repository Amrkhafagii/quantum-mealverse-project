
import React from 'react';
import { motion } from 'framer-motion';
import { NearbyRestaurant } from '@/hooks/useNearestRestaurant';

interface RestaurantSummaryProps {
  restaurants: NearbyRestaurant[];
}

export const RestaurantSummary: React.FC<RestaurantSummaryProps> = ({ 
  restaurants 
}) => {
  if (!restaurants || restaurants.length === 0) return null;

  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-semibold mb-4 text-quantum-purple">
        {restaurants.length} {restaurants.length === 1 ? 'Restaurant' : 'Restaurants'} Found Nearby
      </h2>
      <div className="flex flex-wrap gap-4">
        {restaurants.map((restaurant, index) => (
          <motion.div 
            key={restaurant.restaurant_id} 
            className="bg-quantum-darkBlue/70 rounded-lg p-3 inline-flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(108, 92, 231, 0.2)' }}
          >
            <span className="text-quantum-cyan mr-2">{restaurant.restaurant_name}</span>
            <span className="text-xs text-gray-400">{restaurant.distance_km.toFixed(2)} km away</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
