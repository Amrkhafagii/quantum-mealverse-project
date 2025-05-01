
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import TDEECalculator, { TDEEResult } from '@/components/fitness/TDEECalculator';
import MealPlanDisplay from '@/components/fitness/MealPlanDisplay';
import { MealPlan } from '@/types/food';
import { generateMealPlan } from '@/services/mealPlanService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeartPulse, Utensils, TrendingUp, Zap } from 'lucide-react';

const Fitness = () => {
  const [tdeeResult, setTdeeResult] = useState<TDEEResult | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  
  const handleCalculationComplete = (result: TDEEResult) => {
    setTdeeResult(result);
    const newMealPlan = generateMealPlan(result);
    setMealPlan(newMealPlan);
  };
  
  const handleUpdateMealPlan = (updatedPlan: MealPlan) => {
    setMealPlan(updatedPlan);
  };
  
  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-quantum-cyan mb-4 neon-text">
            HealthAndFix Fitness
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your personalized nutrition and fitness journey starts here. 
            Calculate your needs, generate meal plans, and achieve your goals.
          </p>
        </div>
        
        <Tabs defaultValue="calculator" className="mb-12">
          <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4" /> Calculator
            </TabsTrigger>
            <TabsTrigger value="meal-plan" className="flex items-center gap-2" disabled={!mealPlan}>
              <Utensils className="h-4 w-4" /> Meal Plan
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2" disabled>
              <TrendingUp className="h-4 w-4" /> Progress
            </TabsTrigger>
            <TabsTrigger value="workouts" className="flex items-center gap-2" disabled>
              <Zap className="h-4 w-4" /> Workouts
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator" className="mt-8">
            <div className="max-w-2xl mx-auto">
              <TDEECalculator onCalculationComplete={handleCalculationComplete} />
            </div>
            
            {mealPlan && (
              <div className="mt-12" id="meal-plan-section">
                <MealPlanDisplay 
                  mealPlan={mealPlan}
                  onUpdateMealPlan={handleUpdateMealPlan}
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="meal-plan" className="mt-8">
            {mealPlan ? (
              <MealPlanDisplay 
                mealPlan={mealPlan}
                onUpdateMealPlan={handleUpdateMealPlan}
              />
            ) : (
              <div className="text-center p-12">
                Please calculate your TDEE first to generate a meal plan.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="progress">
            <div className="text-center p-12">
              <p>Progress tracking coming soon!</p>
            </div>
          </TabsContent>
          
          <TabsContent value="workouts">
            <div className="text-center p-12">
              <p>Workout plans coming soon!</p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-quantum-darkBlue/30 rounded-lg p-6 border border-quantum-cyan/20">
            <h3 className="text-xl font-bold text-quantum-cyan mb-3">Martin Berkhan's LeanGains</h3>
            <p className="text-gray-300">
              Our calculator is based on the LeanGains formula, which provides precise caloric needs
              based on your body's unique requirements.
            </p>
          </div>
          
          <div className="bg-quantum-darkBlue/30 rounded-lg p-6 border border-quantum-cyan/20">
            <h3 className="text-xl font-bold text-quantum-cyan mb-3">30/35/35 Macro Split</h3>
            <p className="text-gray-300">
              Our recommended macro distribution optimizes 30% protein, 35% carbs, and 35% fats
              to support muscle growth and healthy metabolism.
            </p>
          </div>
          
          <div className="bg-quantum-darkBlue/30 rounded-lg p-6 border border-quantum-cyan/20">
            <h3 className="text-xl font-bold text-quantum-cyan mb-3">Restaurant Integration</h3>
            <p className="text-gray-300">
              Connect with nearby restaurants that can prepare meals according to your plan,
              making it easier to stay on track even when eating out.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Fitness;
