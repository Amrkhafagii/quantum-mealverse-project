
import React from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import SubscriptionPlan from '@/components/SubscriptionPlan';
import { toast } from 'sonner';
import { useCustomerLogger } from '@/hooks/useCustomerLogger';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const Subscription = () => {
  const { logEvent } = useCustomerLogger();
  const { user } = useAuth();
  
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

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="min-h-screen bg-quantum-black text-white relative overflow-hidden">
      <ParticleBackground />
      <Navbar />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-quantum-purple/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-quantum-cyan/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
      
      <main className="relative z-10 pt-28 pb-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-quantum-cyan mb-4 neon-text">Zenith Meal Plans</h1>
            <p className="text-xl max-w-3xl mx-auto text-gray-300">
              Choose the perfect nutrition plan to fuel your wellness journey and transform your lifestyle
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
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
                ctaText="Subscribe Now"
                onSubscribe={() => handleSubscribe('Basic Zenith')}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
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
                ctaText="Subscribe Now"
                onSubscribe={() => handleSubscribe('Pro Zenith')}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
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
                ctaText="Subscribe Now"
                onSubscribe={() => handleSubscribe('Ultimate Zenith')}
              />
            </motion.div>
          </motion.div>
          
          {/* Additional Info Section */}
          <motion.div 
            className="mt-20 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-quantum-cyan mb-4">Why Choose Zenith?</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="text-quantum-cyan h-5 w-5" />
                    <span>Chef-crafted meals with premium ingredients</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-quantum-cyan h-5 w-5" />
                    <span>Nutrition optimized for your wellness goals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-quantum-cyan h-5 w-5" />
                    <span>Flexible scheduling with no long-term commitment</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-quantum-cyan mb-4">How It Works</h3>
                <ol className="space-y-3">
                  <li className="flex gap-2">
                    <span className="bg-quantum-cyan text-quantum-black rounded-full h-6 w-6 flex items-center justify-center font-bold shrink-0">1</span>
                    <span>Select your preferred meal plan</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="bg-quantum-cyan text-quantum-black rounded-full h-6 w-6 flex items-center justify-center font-bold shrink-0">2</span>
                    <span>Customize your meals based on preferences</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="bg-quantum-cyan text-quantum-black rounded-full h-6 w-6 flex items-center justify-center font-bold shrink-0">3</span>
                    <span>Enjoy fresh deliveries on your schedule</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Subscription;
