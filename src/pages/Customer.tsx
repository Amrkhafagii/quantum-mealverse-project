
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { CustomerMealCard } from '@/components/CustomerMealCard';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { MealType } from '@/types/meal';

const Customer = () => {
  const { data: meals, isLoading, error } = useQuery({
    queryKey: ['meals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Generate placeholder images for meals without images
      return data?.map(meal => ({
        ...meal,
        image_url: meal.image_url || `https://picsum.photos/seed/${meal.id}/300/200`
      })) || [];
    }
  });

  if (isLoading) return (
    <div className="min-h-screen bg-quantum-black text-white flex items-center justify-center">
      <div className="text-2xl text-quantum-cyan">Loading meals...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-quantum-black text-white flex items-center justify-center">
      <div className="text-2xl text-red-500">Error loading meals</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">Quantum Meals</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {meals?.map((meal: MealType) => (
              <CustomerMealCard
                key={meal.id}
                meal={meal}
              />
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Customer;
