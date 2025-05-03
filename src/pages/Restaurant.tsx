
import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import RestaurantMenu from '@/components/restaurant/RestaurantMenu';

const Restaurant = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      <main className="relative z-10 pt-20 pb-12">
        <RestaurantMenu />
      </main>
      <Footer />
    </div>
  );
};

export default Restaurant;
