
import React from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import SubscriptionPlan from '@/components/SubscriptionPlan';

const Subscription = () => {
  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-quantum-cyan mb-4 neon-text">Subscription Plans</h1>
          <p className="text-xl mb-12 text-gray-300">Choose the perfect nutrition plan for your goals</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SubscriptionPlan
              title="Basic Quantum"
              price={99}
              period="month"
              description="Perfect for individuals starting their fitness journey"
              features={[
                { text: "5 Meals Per Week", included: true },
                { text: "Basic Nutrition Tracking", included: true },
                { text: "Standard Menu Selection", included: true },
                { text: "Email Support", included: true },
                { text: "Personalized Meal Plans", included: false }
              ]}
              onSubscribe={() => alert('Basic plan selected')}
            />
            
            <SubscriptionPlan
              title="Power Quantum"
              price={179}
              period="month"
              description="Our most popular plan for serious fitness enthusiasts"
              features={[
                { text: "10 Meals Per Week", included: true },
                { text: "Advanced Nutrition Tracking", included: true },
                { text: "Extended Menu Selection", included: true },
                { text: "Priority Email Support", included: true },
                { text: "Personalized Meal Plans", included: true }
              ]}
              highlighted={true}
              onSubscribe={() => alert('Power plan selected')}
            />
            
            <SubscriptionPlan
              title="Ultimate Quantum"
              price={279}
              period="month"
              description="The ultimate nutrition solution for maximum results"
              features={[
                { text: "15 Meals Per Week", included: true },
                { text: "Premium Nutrition Tracking", included: true },
                { text: "Full Menu Access", included: true },
                { text: "24/7 Phone and Email Support", included: true },
                { text: "Personalized Meal Plans", included: true },
                { text: "Nutritionist Consultation", included: true }
              ]}
              onSubscribe={() => alert('Ultimate plan selected')}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Subscription;
