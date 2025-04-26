
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
  const { nearestRestaurantId, loading: loadingRestaurant } = useNearestRestaurant();

  const { data: meals, isLoading: loadingMeals, error } = useQuery({
    queryKey: ['meals', nearestRestaurantId],
    queryFn: async () => {
      let query = supabase
        .from('meals')
        .select('*')
        .eq('is_active', true);
        
      if (nearestRestaurantId) {
        query = query.eq('restaurant_id', nearestRestaurantId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data?.map(meal => ({
        ...meal,
        image_url: meal.image_url || `https://picsum.photos/seed/${meal.id}/300/200`
      })) || [];
    },
    enabled: !loadingRestaurant
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

  if (loadingRestaurant || loadingMeals) {
    return (
      <div className="min-h-screen bg-quantum-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-24 flex items-center justify-center">
          <Loader className="h-8 w-8 text-quantum-cyan animate-spin" />
          <span className="ml-2 text-quantum-cyan">
            {loadingRestaurant ? 'Finding nearest restaurant...' : 'Loading meals...'}
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
          <div className="text-2xl text-red-500">Error loading meals</div>
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
          
          {meals?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl mb-4">No meals available from nearby restaurants</p>
              <p className="text-gray-400">Try updating your location or check back later</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {meals?.map((meal: MealType) => (
                <CustomerMealCard
                  key={meal.id}
                  meal={meal}
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
