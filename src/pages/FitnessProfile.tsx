
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import UserGoals from '@/components/fitness/UserGoals';
import AchievementSystem from '@/components/fitness/AchievementSystem';
import { useAuth } from '@/hooks/useAuth';

const FitnessProfile: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <h1 className="text-3xl font-bold mb-2">Fitness Profile</h1>
        <p className="text-gray-400 mb-6">
          Track your fitness goals and achievements
        </p>
        
        {user ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserGoals />
            <AchievementSystem />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-quantum-darkBlue/30 border border-quantum-cyan/20 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Sign in to view your fitness profile</h2>
            <p className="text-gray-400 mb-6">You need to be logged in to access your fitness data.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default FitnessProfile;
