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
import { generateMealPlan } from '@/services/mealPlanService';
import { MealPlan } from '@/types/food';
import NutritionDashboard from '@/components/fitness/NutritionDashboard';
import { checkExpiredMealPlans, checkSoonToExpirePlans } from '@/services/scheduledTasks';
import SavedMealPlans from '@/components/fitness/SavedMealPlans';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const Nutrition = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'calculator' | 'plans' | 'saved'>('calculator');
  const [calculationResult, setCalculationResult] = useState<TDEEResult | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);

  useEffect(() => {
    // On component mount, check for expired meal plans
    if (user) {
      checkExpiredMealPlans().then(() => {
        // Check for soon-to-expire plans for the current user
        return checkSoonToExpirePlans(user.id);
      }).then(result => {
        if (result.success && result.expiringSoon > 0) {
          toast.info(`You have ${result.expiringSoon} meal plan${result.expiringSoon > 1 ? 's' : ''} expiring soon.`, {
            description: "Visit your saved meal plans to renew them.",
            duration: 6000
          });
        }
      });
    }
  }, [user]);

  const handleCalculationComplete = (result: TDEEResult) => {
    setCalculationResult(result);
    // Generate meal plan based on TDEE results
    const generatedMealPlan = generateMealPlan(result);
    setMealPlan(generatedMealPlan);
    
    // Save TDEE to session storage
    sessionStorage.setItem('currentTDEE', JSON.stringify(result));
    
    setActiveTab('plans');
    toast.success("Calorie calculation completed! We've generated a meal plan that fits your needs.");
  };

  const handleUpdateMealPlan = (updatedPlan: MealPlan) => {
    setMealPlan(updatedPlan);
    // Update in session storage
    sessionStorage.setItem('currentMealPlan', JSON.stringify(updatedPlan));
  };

  return (
    <div className="min-h-screen bg-quantum-black text-white">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 container mx-auto px-4 py-8 pt-28">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-quantum-cyan mb-2 neon-text">Nutrition Plans</h1>
          <p className="text-lg max-w-3xl mx-auto">Customize your meal plan to fuel your wellness journey</p>
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
              className="data-[state=on]:bg-quantum-purple data-[state=on]:text-white flex-1 text-sm"
            >
              Calorie Calculator
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="plans" 
              className="data-[state=on]:bg-quantum-purple data-[state=on]:text-white flex-1 text-sm"
            >
              Meal Plans
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="saved" 
              className="data-[state=on]:bg-quantum-purple data-[state=on]:text-white flex-1 text-sm"
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
                {calculationResult && mealPlan ? (
                  <NutritionDashboard 
                    calculationResult={calculationResult}
                    mealPlan={mealPlan}
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
                    <Button 
                      onClick={() => setActiveTab('calculator')}
                      className="bg-quantum-purple hover:bg-quantum-purple/90"
                    >
                      Go to Calculator
                    </Button>
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
                      <Button 
                        onClick={() => navigate('/login')}
                        className="bg-quantum-purple hover:bg-quantum-purple/90"
                      >
                        Log In
                      </Button>
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
                  <Button 
                    onClick={() => navigate('/contact')}
                    className="bg-quantum-purple hover:bg-quantum-purple/90"
                  >
                    Contact Us
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Nutrition;
