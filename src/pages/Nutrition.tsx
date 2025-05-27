import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import TDEECalculator from '@/components/fitness/TDEECalculator';
import { TDEEResult } from '@/components/fitness/TDEECalculator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateMealPlan } from '@/services/mealPlan/mealGenerationService';
import { MealPlan } from '@/types/food';
import NutritionDashboard from '@/components/fitness/NutritionDashboard';
import { supabase } from '@/services/supabaseClient';
import SavedMealPlans from '@/components/fitness/SavedMealPlans';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from '@/hooks/use-mobile';
import MobileContainer from '@/components/mobile/MobileContainer';
import { TouchOptimizerProvider } from '@/contexts/TouchOptimizerContext';
import TouchFriendlyButton from '@/components/mobile/TouchFriendlyButton';
import { NutritionCartProvider } from '@/contexts/NutritionCartContext';

const Nutrition = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'calculator' | 'plans' | 'saved'>('calculator');
  const [calculationResult, setCalculationResult] = useState<TDEEResult | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);

  useEffect(() => {
    // On component mount, check for notifications about expiring meal plans
    if (user) {
      // Query notifications for this user related to meal plans
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'reminder')
        .ilike('title', '%Meal Plan%')
        .eq('is_read', false)
        .then(({ data }) => {
          // If there are unread notifications about expiring meal plans, show a toast
          if (data && data.length > 0) {
            toast(`You have ${data.length} meal plan${data.length > 1 ? 's' : ''} expiring soon.`, {
              description: "Visit your saved meal plans to renew them.",
              duration: 6000
            });
          }
        });
    }
  }, [user]);

  const handleCalculationComplete = (result: TDEEResult) => {
    setCalculationResult(result);
    // Note: We no longer generate meal plan here, it's handled in the nutrition dashboard
    
    // Save TDEE to session storage
    sessionStorage.setItem('currentTDEE', JSON.stringify(result));
    
    setActiveTab('plans');
    toast.success("Calorie calculation completed! You can now create a personalized nutrition plan.");
  };

  const handleUpdateMealPlan = (updatedPlan: MealPlan) => {
    setMealPlan(updatedPlan);
    // Update in session storage
    sessionStorage.setItem('currentMealPlan', JSON.stringify(updatedPlan));
  };

  return (
    <NutritionCartProvider>
      <TouchOptimizerProvider>
        <div className="min-h-screen bg-quantum-black text-white">
          <ParticleBackground />
          <Navbar />
          
          <main className="relative z-10 pt-safe pb-safe">
            <MobileContainer className="pt-20 md:pt-28">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-5xl font-bold text-quantum-cyan mb-2 neon-text">Nutrition Plans</h1>
                <p className="text-base md:text-lg max-w-3xl mx-auto">Customize your meal plan to fuel your wellness journey</p>
              </div>
              
              <div className="max-w-5xl mx-auto">
                <ToggleGroup 
                  type="single" 
                  value={activeTab}
                  onValueChange={(value) => {
                    if (value) setActiveTab(value as 'calculator' | 'plans' | 'saved');
                  }}
                  className="justify-center bg-quantum-darkBlue/50 p-1 rounded-lg w-full max-w-md mx-auto"
                >
                  <ToggleGroupItem 
                    value="calculator" 
                    className="data-[state=on]:bg-quantum-purple data-[state=on]:text-white flex-1 text-sm touch-feedback"
                  >
                    Calorie Calculator
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="plans" 
                    className="data-[state=on]:bg-quantum-purple data-[state=on]:text-white flex-1 text-sm touch-feedback"
                  >
                    Meal Plans
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="saved" 
                    className="data-[state=on]:bg-quantum-purple data-[state=on]:text-white flex-1 text-sm touch-feedback"
                  >
                    Saved Plans
                  </ToggleGroupItem>
                </ToggleGroup>
                
                <div className="mt-6">
                  {activeTab === 'calculator' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="max-w-3xl mx-auto"
                    >
                      <TDEECalculator onCalculationComplete={handleCalculationComplete} />
                    </motion.div>
                  )}
                  
                  {activeTab === 'plans' && (
                    <>
                      {calculationResult ? (
                        <NutritionDashboard 
                          calculationResult={calculationResult}
                          onUpdateMealPlan={handleUpdateMealPlan}
                        />
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="max-w-3xl mx-auto text-center p-8"
                        >
                          <h3 className="text-2xl font-semibold text-quantum-cyan mb-4">Calculate Your Nutrition Needs</h3>
                          <p className="mb-6">Start by calculating your daily calorie and macro needs to generate a personalized meal plan.</p>
                          <TouchFriendlyButton 
                            onClick={() => setActiveTab('calculator')}
                            className="bg-quantum-purple hover:bg-quantum-purple/90"
                            touchClassName="py-3 px-6"
                          >
                            Go to Calculator
                          </TouchFriendlyButton>
                        </motion.div>
                      )}
                    </>
                  )}
                  
                  {activeTab === 'saved' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {user ? (
                        <SavedMealPlans userId={user.id} />
                      ) : (
                        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                          <CardContent className="p-6 text-center">
                            <p className="mb-4">You need to be logged in to view your saved meal plans.</p>
                            <TouchFriendlyButton 
                              onClick={() => navigate('/login')}
                              className="bg-quantum-purple hover:bg-quantum-purple/90"
                              touchClassName="py-3 px-6"
                            >
                              Log In
                            </TouchFriendlyButton>
                          </CardContent>
                        </Card>
                      )}
                    </motion.div>
                  )}
                </div>
                
                {/* Information Card */}
                {activeTab !== 'saved' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="mt-16 max-w-4xl mx-auto"
                  >
                    <Card className="bg-quantum-darkBlue/30 border-quantum-purple/20 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <h3 className="text-2xl font-bold text-quantum-purple mb-4">Need Help With Meal Planning?</h3>
                        <p className="mb-6">Contact our nutrition experts to learn more about personalized dietary advice and custom meal plans tailored to your specific needs and preferences.</p>
                        <TouchFriendlyButton 
                          onClick={() => navigate('/contact')}
                          className="bg-quantum-purple hover:bg-quantum-purple/90"
                          touchClassName="py-3 px-6"
                        >
                          Contact Us
                        </TouchFriendlyButton>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </MobileContainer>
          </main>
          
          <Footer />
        </div>
      </TouchOptimizerProvider>
    </NutritionCartProvider>
  );
};

export default Nutrition;
