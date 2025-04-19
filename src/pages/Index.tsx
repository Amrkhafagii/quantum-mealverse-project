
import React from 'react';
import { ParticleBackground } from '@/components/ParticleBackground';
import { FeaturedMeals } from '@/components/FeaturedMeals';

const Index = () => {
  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="h-screen flex items-center justify-center text-center px-4">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-bold text-quantum-cyan neon-text">
              Quantum Eats
            </h1>
            <p className="text-xl md:text-2xl text-galaxy-purple max-w-2xl mx-auto">
              Experience the future of food delivery with our AI-powered meal recommendations
              and augmented reality previews
            </p>
            <button className="cyber-button text-lg">
              Explore Meals
            </button>
          </div>
        </section>

        {/* Featured Meals Section */}
        <FeaturedMeals />
      </main>
    </div>
  );
};

export default Index;
