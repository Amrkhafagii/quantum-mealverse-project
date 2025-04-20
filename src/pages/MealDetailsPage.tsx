
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

const MealDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  
  const { data: meal, isLoading, error } = useQuery({
    queryKey: ['meal', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
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
        .single();
      
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
        <div className="text-2xl text-quantum-cyan">Loading meal details...</div>
      </div>
    </div>
  );

  if (error || !meal) return (
    <div className="min-h-screen bg-quantum-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <div className="text-2xl text-red-500">Error loading meal details</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-24 pb-16 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MealDetails 
              meal={meal} 
              onAddToCart={handleAddToCart}
              restaurantId={restaurant?.id || ''}
            />
          </div>
          
          <div className="bg-quantum-black text-white relative p-6 rounded-2xl border border-quantum-cyan/30 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6 neon-text">Currency Exchange</h2>
            <div className="space-y-4">
              <CurrencyDisplay price={meal.price} />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Currency display component
const CurrencyDisplay = ({ price }: { price: number }) => {
  // For now, we'll hard-code a few exchange rates
  // In a real app, you would fetch these from an API
  const exchangeRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.78,
    JPY: 109.25,
    CAD: 1.35
  };
  
  return (
    <div className="space-y-3">
      <p className="text-gray-400">Price in different currencies:</p>
      <ul className="space-y-2">
        {Object.entries(exchangeRates).map(([currency, rate]) => (
          <li key={currency} className="flex justify-between">
            <span>{currency}:</span>
            <span className="font-semibold text-quantum-cyan">
              {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 
               currency === 'GBP' ? '£' : currency === 'JPY' ? '¥' : 'CA$'}
              {(price * rate).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-gray-500 mt-4">
        * Exchange rates are approximate and for informational purposes only
      </p>
    </div>
  );
};

export default MealDetailsPage;
