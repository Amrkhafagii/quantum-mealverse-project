
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import TDEECalculator, { TDEEResult } from '@/components/fitness/TDEECalculator';
import MealPlanDisplay from '@/components/fitness/MealPlanDisplay';
import { MealPlan } from '@/types/food';
import { generateMealPlan } from '@/services/mealPlanService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeartPulse, Utensils, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Fitness = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tdeeResult, setTdeeResult] = useState<TDEEResult | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    // Try to load meal plan from session storage on initial render
    const storedMealPlan = sessionStorage.getItem('currentMealPlan');
    const storedTDEE = sessionStorage.getItem('currentTDEE');
    
    if (storedMealPlan && storedTDEE) {
      try {
        setMealPlan(JSON.parse(storedMealPlan));
        setTdeeResult(JSON.parse(storedTDEE));
      } catch (error) {
        console.error('Error parsing stored meal plan:', error);
      }
    }
  }, []);
  
  const handleCalculationComplete = (result: TDEEResult) => {
    setTdeeResult(result);
    const newMealPlan = generateMealPlan(result);
    setMealPlan(newMealPlan);
    
    // Save to session storage
    sessionStorage.setItem('currentTDEE', JSON.stringify(result));
    sessionStorage.setItem('currentMealPlan', JSON.stringify(newMealPlan));
  };
  
  const handleUpdateMealPlan = (updatedPlan: MealPlan) => {
    setMealPlan(updatedPlan);
    // Update session storage
    sessionStorage.setItem('currentMealPlan', JSON.stringify(updatedPlan));
  };
  
  const saveMealPlan = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to save your meal plan.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!mealPlan || !tdeeResult) {
      toast({
        title: 'No Meal Plan',
        description: 'Please generate a meal plan first.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // First save the TDEE calculation
      const { data: tdeeData, error: tdeeError } = await supabase
        .from('user_tdee')
        .insert({
          user_id: user.id,
          date: new Date().toISOString(),
          tdee: tdeeResult.tdee,
          bmr: tdeeResult.bmr,
          goal: tdeeResult.goal as 'maintain' | 'cut' | 'bulk',
          activity_level: 'moderate', // Default value
          protein_target: tdeeResult.proteinGrams,
          carbs_target: tdeeResult.carbsGrams,
          fat_target: tdeeResult.fatsGrams,
        })
        .select('id')
        .single();
        
      if (tdeeError) throw tdeeError;
      
      // Now save the meal plan
      const planName = `${tdeeResult.goal} plan (${tdeeResult.adjustedCalories} cal)`;
      
      // Convert MealPlan to a format Supabase can handle
      const mealPlanJson = JSON.parse(JSON.stringify(mealPlan));
      
      const { error } = await supabase
        .from('saved_meal_plans')
        .insert({
          user_id: user.id,
          name: planName,
          date_created: new Date().toISOString(),
          tdee_id: tdeeData.id,
          meal_plan: mealPlanJson,
        });
        
      if (error) throw error;
      
      toast({
        title: 'Plan Saved',
        description: 'Your meal plan has been saved successfully.',
      });
      
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save meal plan.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  const goToProfile = () => {
    navigate('/fitness-profile');
  };
  
  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-quantum-cyan neon-text">
            HealthAndFix Fitness
          </h1>
          {user && (
            <Button 
              onClick={goToProfile}
              className="bg-quantum-purple hover:bg-quantum-purple/90"
            >
              My Fitness Profile
            </Button>
          )}
        </div>
        
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
          Your personalized nutrition and fitness journey starts here. 
          Calculate your needs, generate meal plans, and achieve your goals.
        </p>
        
        <Tabs defaultValue="calculator" className="mb-12">
          <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4" /> Calculator
            </TabsTrigger>
            <TabsTrigger value="meal-plan" className="flex items-center gap-2" disabled={!mealPlan}>
              <Utensils className="h-4 w-4" /> Meal Plan
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2" onClick={() => navigate('/fitness-profile')}>
              <TrendingUp className="h-4 w-4" /> Progress
            </TabsTrigger>
            <TabsTrigger value="workouts" className="flex items-center gap-2" onClick={() => navigate('/workouts')}>
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
                
                {user && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      onClick={saveMealPlan}
                      disabled={saving}
                      className="bg-quantum-purple hover:bg-quantum-purple/90"
                    >
                      {saving ? 'Saving...' : 'Save This Meal Plan'}
                    </Button>
                  </div>
                )}
                
                {!user && (
                  <div className="mt-6 text-center">
                    <p className="text-gray-400 mb-2">Log in to save your meal plan</p>
                    <Button
                      onClick={() => navigate('/auth')}
                      variant="outline"
                    >
                      Log In / Register
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="meal-plan" className="mt-8">
            {mealPlan ? (
              <>
                <MealPlanDisplay 
                  mealPlan={mealPlan}
                  onUpdateMealPlan={handleUpdateMealPlan}
                />
                
                {user && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      onClick={saveMealPlan}
                      disabled={saving}
                      className="bg-quantum-purple hover:bg-quantum-purple/90"
                    >
                      {saving ? 'Saving...' : 'Save This Meal Plan'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-12">
                <p>Please calculate your TDEE first to generate a meal plan.</p>
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
