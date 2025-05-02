
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GlobalMapboxConfig from '@/components/maps/GlobalMapboxConfig';

const Home = () => {
  const navigate = useNavigate();

  const exploreSolutions = () => {
    navigate('/customer');
  };

  const exploreFitness = () => {
    navigate('/fitness');
  };

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-20">
        <section className="h-screen flex items-center justify-center text-center px-4">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-bold text-quantum-cyan neon-text">
              HealthAndFix
            </h1>
            <p className="text-xl md:text-2xl text-galaxy-purple max-w-2xl mx-auto">
              Experience the future of health and wellness with our smart personalized solutions
              and holistic wellness approach
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="cyber-button text-lg"
                onClick={exploreSolutions}
              >
                Order Food
              </button>
              
              <button 
                className="cyber-button text-lg bg-quantum-purple"
                onClick={exploreFitness}
              >
                Fitness Planner
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <GlobalMapboxConfig />
    </div>
  );
};

export default Home;
