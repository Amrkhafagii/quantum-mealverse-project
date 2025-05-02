
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

const Nutrition = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'calculator' | 'plans'>('calculator');
  const [calculationResult, setCalculationResult] = useState<TDEEResult | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);

  const handleCalculationComplete = (result: TDEEResult) => {
    setCalculationResult(result);
    // Generate meal plan based on TDEE results
    const generatedMealPlan = generateMealPlan(result);
    setMealPlan(generatedMealPlan);
    setActiveTab('plans');
    toast.success("Calorie calculation completed! We've generated a meal plan that fits your needs.");
  };

  const handleUpdateMealPlan = (updatedPlan: MealPlan) => {
    setMealPlan(updatedPlan);
  };

  return (
    <div className="min-h-screen bg-quantum-black text-white">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 container mx-auto px-4 py-16 pt-28">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-quantum-cyan mb-4 neon-text">Nutrition Plans</h1>
          <p className="text-xl max-w-3xl mx-auto">Customize your meal plan to fuel your wellness journey</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'calculator' | 'plans')} className="mb-8">
          <TabsList className="w-full max-w-md mx-auto">
            <TabsTrigger value="calculator">Calorie Calculator</TabsTrigger>
            <TabsTrigger value="plans">Meal Plans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator" className="max-w-3xl mx-auto mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TDEECalculator onCalculationComplete={handleCalculationComplete} />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="plans">
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
                className="max-w-3xl mx-auto text-center p-12"
              >
                <h3 className="text-2xl font-semibold text-quantum-cyan mb-4">Calculate Your Nutrition Needs</h3>
                <p className="mb-8">Start by calculating your daily calorie and macro needs to generate a personalized meal plan.</p>
                <Button 
                  onClick={() => setActiveTab('calculator')}
                  className="bg-quantum-purple hover:bg-quantum-purple/90"
                >
                  Go to Calculator
                </Button>
              </motion.div>
            )}
            
            {/* Information Card */}
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
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Nutrition;
