
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import RestaurantMenu from '@/components/restaurant/RestaurantMenu';

const Restaurant = () => {
  const { id } = useParams<{ id: string }>();
  
  // Check if location data needs to be refreshed
  useEffect(() => {
    const cachedLocationString = localStorage.getItem('userLocation');
    if (cachedLocationString) {
      try {
        const parsedLocation = JSON.parse(cachedLocationString);
        const timestamp = parsedLocation.timestamp || 0;
        const now = new Date().getTime();
        const twoHoursMs = 2 * 60 * 60 * 1000;
        
        // If location is more than 2 hours old, we'll want to refresh it next time
        if (now - timestamp > twoHoursMs) {
          console.log('Location data is stale, will refresh on next location request');
        }
      } catch (e) {
        console.error('Error parsing cached location:', e);
      }
    }
  }, []);

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
