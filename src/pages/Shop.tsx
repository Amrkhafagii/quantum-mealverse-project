
import React from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { CartProvider } from '@/contexts/CartContext';

const Shop = () => {
  return (
    <CartProvider>
      <div className="min-h-screen bg-quantum-black text-white relative">
        <ParticleBackground />
        <Navbar />
        
        <main className="relative z-10 pt-24 pb-12 container mx-auto px-4">
          <h1 className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">Shop</h1>
          <p className="text-xl mb-4">Browse our full catalog of quantum meals and products.</p>
          
          <div className="p-8 text-center">
            <p className="text-galaxy-purple text-lg">Shop page content coming soon...</p>
          </div>
        </main>
        
        <Footer />
      </div>
    </CartProvider>
  );
};

export default Shop;
