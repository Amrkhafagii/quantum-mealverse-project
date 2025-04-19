
import React from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { SubscriptionPlan } from '@/components/SubscriptionPlan';
import { CartProvider } from '@/contexts/CartContext';

const Subscription = () => {
  return (
    <CartProvider>
      <div className="min-h-screen bg-quantum-black text-white relative">
        <ParticleBackground />
        <Navbar />
        
        <main className="relative z-10 pt-24 pb-12 container mx-auto px-4">
          <h1 className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">Meal Subscriptions</h1>
          <p className="text-xl mb-8 max-w-3xl">Subscribe to regular meal deliveries and save. Choose the plan that fits your lifestyle.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SubscriptionPlan 
              title="Weekly Essentials"
              price={499.99}
              currency="EGP"
              features={[
                "5 meals per week",
                "Free delivery",
                "Meal customization",
                "Weekly menu rotation"
              ]}
            />
            <SubscriptionPlan 
              title="Quantum Family"
              price={899.99}
              currency="EGP"
              features={[
                "10 meals per week",
                "Free delivery",
                "Meal customization",
                "Weekly menu rotation",
                "Family-sized portions"
              ]}
              highlighted={true}
            />
            <SubscriptionPlan 
              title="Quantum Pro"
              price={1299.99}
              currency="EGP"
              features={[
                "15 meals per week",
                "Free priority delivery",
                "Premium meal customization",
                "Weekly menu rotation",
                "Nutritionist consultation",
                "Exclusive recipes"
              ]}
            />
          </div>
        </main>
        
        <Footer />
      </div>
    </CartProvider>
  );
};

export default Subscription;
