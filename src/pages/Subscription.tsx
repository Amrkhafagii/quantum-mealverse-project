
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import SubscriptionPlan from '@/components/SubscriptionPlan';
import { toast } from 'sonner';
import { useCustomerLogger } from '@/hooks/useCustomerLogger';
import { testLogger } from '@/services/loggerService';
import { useAuth } from '@/hooks/useAuth';

const Subscription = () => {
  const { logEvent } = useCustomerLogger();
  const { user } = useAuth();
  
  useEffect(() => {
    // Test log on component mount
    const runTest = async () => {
      const result = await testLogger(user?.id);
      console.log('Logger test result:', result);
    };
    
    runTest();
  }, [user]);

  const handleSubscribe = (plan: string) => {
    // Log subscription selection
    logEvent('subscription_selected', { plan, price: getPlanPrice(plan) });
    
    toast.success(`You've selected the ${plan} plan. Redirecting to checkout...`);
  };
  
  const getPlanPrice = (plan: string): number => {
    switch (plan) {
      case 'Basic Zenith': return 99;
      case 'Pro Zenith': return 179;
      case 'Ultimate Zenith': return 279;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-quantum-cyan mb-4 neon-text">Subscription Plans</h1>
          <p className="text-xl mb-12 text-gray-300">Choose the perfect meal plan for your lifestyle</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SubscriptionPlan
              title="Basic Zenith"
              price={99}
              period="month"
              description="Perfect for individuals starting their wellness journey"
              features={[
                { text: "5 Meals Per Week", included: true },
                { text: "Basic Meal Tracking", included: true },
                { text: "Standard Menu Selection", included: true },
                { text: "Email Support", included: true },
                { text: "Personalized Meal Plans", included: false }
              ]}
              onSubscribe={() => handleSubscribe('Basic Zenith')}
            />
            
            <SubscriptionPlan
              title="Pro Zenith"
              price={179}
              period="month"
              description="Our most popular plan for health enthusiasts"
              features={[
                { text: "10 Meals Per Week", included: true },
                { text: "Advanced Meal Tracking", included: true },
                { text: "Extended Menu Selection", included: true },
                { text: "Priority Email Support", included: true },
                { text: "Personalized Meal Plans", included: true }
              ]}
              highlighted={true}
              onSubscribe={() => handleSubscribe('Pro Zenith')}
            />
            
            <SubscriptionPlan
              title="Ultimate Zenith"
              price={279}
              period="month"
              description="The ultimate nutrition solution for maximum results"
              features={[
                { text: "15 Meals Per Week", included: true },
                { text: "Premium Meal Tracking", included: true },
                { text: "Full Menu Access", included: true },
                { text: "24/7 Phone and Email Support", included: true },
                { text: "Personalized Meal Plans", included: true },
                { text: "Nutritionist Consultation", included: true }
              ]}
              onSubscribe={() => handleSubscribe('Ultimate Zenith')}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Subscription;
