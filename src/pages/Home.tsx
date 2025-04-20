import React from 'react';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Home = () => {
  const navigate = useNavigate();

  const exploreMeals = () => {
    navigate('/customer');
  };

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-20">
        <section className="h-screen flex items-center justify-center text-center px-4">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-bold text-quantum-cyan neon-text">
              Zenith Meals
            </h1>
            <p className="text-xl md:text-2xl text-galaxy-purple max-w-2xl mx-auto">
              Experience the future of food delivery with our smart meal recommendations
              and real-time meal previews
            </p>
            <button 
              className="cyber-button text-lg"
              onClick={exploreMeals}
            >
              Explore Meals
            </button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
