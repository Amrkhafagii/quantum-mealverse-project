import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MealDetails from '@/components/MealDetails';
import ParticleBackground from '@/components/ParticleBackground';
import { MealType } from '@/types/meal';
import { useCart } from '@/contexts/CartContext';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

const MealDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { displayPrice } = useCurrencyConverter();
  
  const { data: meal, isLoading, error } = useQuery({
    queryKey: ['meal', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Generate placeholder image if image_url is null or empty
      if (!data.image_url) {
        data.image_url = `https://picsum.photos/seed/${data.id}/600/400`;
      }
      
      return data as MealType;
    },
    enabled: !!id
  });
  
  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', meal?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', meal?.restaurant_id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!meal?.restaurant_id
  });

  const handleAddToCart = (meal: MealType, quantity: number) => {
    addItem({
      ...meal,
      quantity
    });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-quantum-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <div className="text-2xl text-quantum-cyan animate-pulse">Loading meal details...</div>
      </div>
      <Footer />
    </div>
  );

  if (error || !meal) return (
    <div className="min-h-screen bg-quantum-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <div className="text-2xl text-red-500">Error loading meal details</div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <MealDetails 
            meal={meal} 
            onAddToCart={handleAddToCart}
            restaurantId={restaurant?.id || ''}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MealDetailsPage;
