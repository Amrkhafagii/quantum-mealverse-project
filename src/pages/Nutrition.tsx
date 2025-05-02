
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const Nutrition = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubscribe = async (planName: string, price: number, mealsPerWeek: number, withTrial = false) => {
    try {
      // If user is not logged in, redirect to login page
      if (!user) {
        toast.info('Please log in to subscribe to a meal plan');
        navigate('/login', { state: { from: '/nutrition' } });
        return;
      }

      // Check if user already has an active subscription
      const { data: existingSubscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingSubscription) {
        // User already has an active subscription
        toast.info('You already have an active subscription. Please manage it from your profile.');
        navigate('/profile');
        return;
      }

      const now = new Date();
      let subscriptionData = {
        user_id: user.id,
        plan_name: planName,
        price: withTrial ? 0 : price,
        status: 'active',
        meals_per_week: mealsPerWeek,
        start_date: now.toISOString(),
        is_trial: withTrial,
        trial_ends_at: withTrial ? new Date(now.setMonth(now.getMonth() + 3)).toISOString() : null
      };

      // Create new subscription
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert(subscriptionData);

      if (insertError) throw insertError;

      if (withTrial) {
        toast.success(`You've successfully started a 3-month free trial of the ${planName} plan!`);
      } else {
        toast.success(`You've successfully subscribed to the ${planName} plan!`);
      }
      
      // Redirect to profile page to see subscription
      navigate('/profile');
    } catch (error) {
      console.error('Error handling subscription:', error);
      toast.error('There was an error processing your subscription. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-quantum-black text-white">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 container mx-auto px-4 py-16 pt-28">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-quantum-cyan mb-4 neon-text">Nutrition Plans</h1>
          <p className="text-xl max-w-3xl mx-auto">Choose the perfect meal plan to fuel your wellness journey</p>
          <div className="mt-4">
            <Badge className="bg-quantum-purple text-white">Now with 3-Month Free Trial!</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Basic Zenith Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-quantum-darkBlue/30 backdrop-blur-sm border border-quantum-cyan/30 rounded-lg overflow-hidden p-6 flex flex-col h-full"
          >
            <h2 className="text-3xl font-bold text-quantum-cyan mb-2">Basic Zenith</h2>
            <div className="text-2xl mb-6">Starting at <span className="text-quantum-cyan font-bold">$99/month</span></div>
            
            <ul className="mb-8 space-y-4 flex-grow">
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-quantum-cyan" />
                <span>5 meals per week delivered to your door</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-quantum-cyan" />
                <span>Basic meal tracking with our mobile app</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-quantum-cyan" />
                <span>Email support for nutrition questions</span>
              </li>
            </ul>
            
            <div className="mt-auto space-y-2">
              <Button 
                variant="outline"
                onClick={() => handleSubscribe('Basic Zenith', 0, 5, true)}
                className="w-full border-quantum-purple text-quantum-purple hover:bg-quantum-purple/10"
              >
                Start 3-Month Free Trial
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleSubscribe('Basic Zenith', 99, 5, false)}
                className="w-full border-quantum-cyan text-quantum-cyan hover:bg-quantum-cyan/10"
              >
                Subscribe Now
              </Button>
            </div>
          </motion.div>

          {/* Pro Zenith Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-quantum-darkBlue/30 backdrop-blur-sm border-2 border-quantum-purple rounded-lg overflow-hidden p-6 flex flex-col h-full relative"
          >
            <div className="absolute top-0 left-0 right-0 bg-quantum-purple text-center py-1 px-4 text-sm font-bold">
              MOST POPULAR
            </div>
            
            <h2 className="text-3xl font-bold text-quantum-purple mb-2 mt-4">Pro Zenith</h2>
            <div className="text-2xl mb-6"><span className="text-quantum-purple font-bold">$179/month</span></div>
            
            <ul className="mb-8 space-y-4 flex-grow">
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-quantum-purple" />
                <span>10 meals per week delivered to your door</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-quantum-purple" />
                <span>Advanced meal and macronutrient tracking</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-quantum-purple" />
                <span>Personalized meal plan based on your goals</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-quantum-purple" />
                <span>Priority email & chat support</span>
              </li>
            </ul>
            
            <div className="mt-auto space-y-2">
              <Button 
                onClick={() => handleSubscribe('Pro Zenith', 0, 10, true)}
                className="w-full bg-quantum-purple/20 border border-quantum-purple text-quantum-purple hover:bg-quantum-purple/30"
              >
                Start 3-Month Free Trial
              </Button>
              <Button 
                onClick={() => handleSubscribe('Pro Zenith', 179, 10, false)}
                className="w-full bg-quantum-purple hover:bg-quantum-purple/90"
              >
                Subscribe Now
              </Button>
            </div>
          </motion.div>

          {/* Ultimate Zenith Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-quantum-darkBlue/30 backdrop-blur-sm border border-quantum-cyan/30 rounded-lg overflow-hidden p-6 flex flex-col h-full"
          >
            <h2 className="text-3xl font-bold text-quantum-cyan mb-2">Ultimate Zenith</h2>
            <div className="text-2xl mb-6"><span className="text-quantum-cyan font-bold">$279/month</span></div>
            
            <ul className="mb-8 space-y-4 flex-grow">
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-quantum-cyan" />
                <span>15 meals per week delivered to your door</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-quantum-cyan" />
                <span>Complete meal and biometric tracking</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-quantum-cyan" />
                <span>1-on-1 consultation with a nutritionist</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-3 text-quantum-cyan" />
                <span>24/7 priority support</span>
              </li>
            </ul>
            
            <div className="mt-auto space-y-2">
              <Button 
                variant="outline"
                onClick={() => handleSubscribe('Ultimate Zenith', 0, 15, true)}
                className="w-full border-quantum-purple text-quantum-purple hover:bg-quantum-purple/10"
              >
                Start 3-Month Free Trial
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleSubscribe('Ultimate Zenith', 279, 15, false)}
                className="w-full border-quantum-cyan text-quantum-cyan hover:bg-quantum-cyan/10"
              >
                Subscribe Now
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Trial Information Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <Card className="bg-quantum-darkBlue/30 border-quantum-purple/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-quantum-purple mb-4">Free 3-Month Trial</h3>
              <p className="mb-4">Try any Zenith meal plan completely free for 3 months with no commitment. Experience the full benefits of our service with no risk.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="text-quantum-purple h-5 w-5" />
                  <span>No credit card required to start</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-quantum-purple h-5 w-5" />
                  <span>Cancel anytime during trial period</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-quantum-purple h-5 w-5" />
                  <span>Full access to all plan features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-quantum-purple h-5 w-5" />
                  <span>Receive reminders before trial ends</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Nutrition;
