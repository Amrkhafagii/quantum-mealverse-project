
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { CustomerMealCard } from '@/components/CustomerMealCard';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { MealType } from '@/types/meal';
import { useNearestRestaurant } from '@/hooks/useNearestRestaurant';
import { useLocationTracker } from '@/hooks/useLocationTracker';
import { Button } from '@/components/ui/button';
import { MapPin, Loader } from 'lucide-react';

const Customer = () => {
  const { location, getCurrentLocation } = useLocationTracker();
  const { nearbyRestaurants, loading: loadingRestaurants } = useNearestRestaurant();

  const { data: menuItems, isLoading: loadingMenuItems, error } = useQuery({
    queryKey: ['menuItems', nearbyRestaurants],
    queryFn: async () => {
      if (!nearbyRestaurants.length) return [];
      
      // Extract restaurant IDs from nearby restaurants
      const restaurantIds = nearbyRestaurants.map(restaurant => restaurant.restaurant_id);
      
      let query = supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .in('restaurant_id', restaurantIds);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Convert menu_items to MealType structure
      return data?.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        calories: item.nutritional_info?.calories || 0,
        protein: item.nutritional_info?.protein || 0,
        carbs: item.nutritional_info?.carbs || 0,
        fat: item.nutritional_info?.fat || 0,
        image_url: item.image_url || `https://picsum.photos/seed/${item.id}/300/200`,
        is_active: item.is_available,
        restaurant_id: item.restaurant_id,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];
    },
    enabled: nearbyRestaurants.length > 0
  });

  if (!location) {
    return (
      <div className="min-h-screen bg-quantum-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-quantum-cyan" />
          <h2 className="text-2xl font-bold mb-4">Location Required</h2>
          <p className="mb-6">Please enable location services to see meals from restaurants near you</p>
          <Button 
            onClick={() => getCurrentLocation()}
            className="bg-quantum-cyan hover:bg-quantum-cyan/90"
          >
            Share Location
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (loadingRestaurants || loadingMenuItems) {
    return (
      <div className="min-h-screen bg-quantum-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-24 flex items-center justify-center">
          <Loader className="h-8 w-8 text-quantum-cyan animate-spin" />
          <span className="ml-2 text-quantum-cyan">
            {loadingRestaurants ? 'Finding nearby restaurants...' : 'Loading menu items...'}
          </span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-quantum-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-24 flex items-center justify-center">
          <div className="text-2xl text-red-500">Error loading menu items</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">Quantum Meals</h1>
          
          {nearbyRestaurants.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-quantum-purple">
                {nearbyRestaurants.length} {nearbyRestaurants.length === 1 ? 'Restaurant' : 'Restaurants'} Found Nearby
              </h2>
              <div className="flex flex-wrap gap-4">
                {nearbyRestaurants.map((restaurant) => (
                  <div key={restaurant.restaurant_id} className="bg-quantum-darkBlue/70 rounded-lg p-3 inline-flex items-center">
                    <span className="text-quantum-cyan mr-2">{restaurant.restaurant_name}</span>
                    <span className="text-xs text-gray-400">{restaurant.distance_km.toFixed(2)} km away</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {menuItems?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl mb-4">No menu items available from nearby restaurants</p>
              <p className="text-gray-400 mb-6">Try updating your location or check back later</p>
              <Button
                onClick={() => getCurrentLocation()}
                className="bg-quantum-cyan hover:bg-quantum-cyan/90"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Update Location
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {menuItems?.map((item: MealType) => (
                <CustomerMealCard
                  key={item.id}
                  meal={item}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Customer;
