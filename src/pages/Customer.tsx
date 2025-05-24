
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { MainContent } from '@/components/customer/MainContent';

const CustomerPage = () => {
  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-20">
        <CustomerHeader />
        <MainContent />
      </main>
      
      <Footer />
    </div>
  );
};

export default CustomerPage;
