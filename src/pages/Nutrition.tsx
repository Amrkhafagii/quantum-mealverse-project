import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Apple, Coffee, Utensils, Droplets, Target, TrendingUp, Award, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { useMobile } from '@/hooks/use-mobile';
import MobileContainer from '@/components/mobile/MobileContainer';
import { FitnessOverview } from '@/components/fitness/FitnessOverview';
import TouchFriendlyButton from '@/components/mobile/TouchFriendlyButton';
import ProteinWarning from '@/components/fitness/nutrition/ProteinWarning';
import SavePlanButton from '@/components/fitness/nutrition/SavePlanButton';
import LoadingState from '@/components/fitness/SavedMealPlans/LoadingState';
import EmptyState from '@/components/fitness/SavedMealPlans/EmptyState';
import PlanGrid from '@/components/fitness/SavedMealPlans/PlanGrid';

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
}

const NutritionPage = () => {
  const { user } = useAuth();
  const isMobile = useMobile();
  
  const [activeView, setActiveView] = useState<'meal-planning' | 'calorie-tracking' | 'hydration'>('meal-planning');
  const [mealPlan, setMealPlan] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedPlans, setSavedPlans] = useState([]);
  const [isRenewing, setIsRenewing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProteinLow, setIsProteinLow] = useState(false);
  const [hydrationLevel, setHydrationLevel] = useState(60);
  const [hydrationTarget, setHydrationTarget] = useState(100);
  const [isHydrationLow, setIsHydrationLow] = useState(hydrationLevel < (hydrationTarget * 0.95));
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const generateMealPlan = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newMealPlan: Meal[] = [
        { name: 'Oatmeal with Berries', calories: 300, protein: 10, carbs: 50, fat: 5, ingredients: ['oats', 'berries', 'nuts'] },
        { name: 'Chicken Salad Sandwich', calories: 400, protein: 30, carbs: 40, fat: 15, ingredients: ['chicken', 'bread', 'lettuce'] },
        { name: 'Salmon with Quinoa', calories: 500, protein: 40, carbs: 30, fat: 25, ingredients: ['salmon', 'quinoa', 'vegetables'] },
      ];
      
      setMealPlan(newMealPlan);
      setLastUpdated(new Date());
      
      // Check protein levels
      const totalProtein = newMealPlan.reduce((sum, meal) => sum + meal.protein, 0);
      setIsProteinLow(totalProtein < 95);
      
      toast.success("Meal Plan Generated", {
        description: "A personalized meal plan has been generated for you."
      });
    } catch (error) {
      console.error("Error generating meal plan:", error);
      toast.error("Failed to Generate Meal Plan", {
        description: "There was an error generating your meal plan. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleHydrationChange = (newLevel: number) => {
    setHydrationLevel(newLevel);
    setIsHydrationLow(newLevel < (hydrationTarget * 0.95));
  };

  useEffect(() => {
    // Simulate fetching saved meal plans and hydration data
    const fetchSavedData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockSavedPlans = [
          { id: '1', name: 'High Protein Plan', description: 'A plan focused on high protein intake', lastUsed: new Date() },
          { id: '2', name: 'Low Carb Plan', description: 'A plan focused on low carbohydrate intake', lastUsed: new Date() },
        ];
        
        setSavedPlans(mockSavedPlans);
        setHydrationLevel(75);
        setHydrationTarget(100);
        setIsHydrationLow(75 < (100 * 0.95));
      } catch (error) {
        console.error("Error fetching saved data:", error);
        toast.error("Failed to Load Saved Data", {
          description: "There was an error loading your saved meal plans and hydration data. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSavedData();
  }, []);
  
  const handleLoadPlan = (plan: any) => {
    toast.success("Meal Plan Loaded", {
      description: `Loaded meal plan: ${plan.name}`
    });
  };
  
  const handleRenewPlan = async (planId: string) => {
    setIsRenewing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Meal Plan Renewed", {
        description: "Your meal plan has been renewed."
      });
    } catch (error) {
      console.error("Error renewing meal plan:", error);
      toast.error("Failed to Renew Meal Plan", {
        description: "There was an error renewing your meal plan. Please try again."
      });
    } finally {
      setIsRenewing(false);
    }
  };
  
  const handleDeletePlan = async (planId: string) => {
    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSavedPlans(savedPlans.filter(plan => plan.id !== planId));
      toast.success("Meal Plan Deleted", {
        description: "Your meal plan has been deleted."
      });
    } catch (error) {
      console.error("Error deleting meal plan:", error);
      toast.error("Failed to Delete Meal Plan", {
        description: "There was an error deleting your meal plan. Please try again."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-quantum-black text-white">
      <ParticleBackground />
      <Navbar />
      
      <MobileContainer className="pt-20 sm:pt-24 pb-4 sm:pb-8 lg:pb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-quantum-cyan mb-4 sm:mb-6 neon-text">
          Nutrition Dashboard
        </h1>
        
        <p className="text-gray-400 mb-6">
          Stay on top of your nutrition and hydration goals with personalized meal plans and tracking tools.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <TouchFriendlyButton
            onClick={() => setActiveView('meal-planning')}
            className={`p-6 text-left transition-all duration-300 ${
              activeView === 'meal-planning' 
                ? 'bg-quantum-purple border-quantum-cyan' 
                : 'bg-quantum-darkBlue/50 hover:bg-quantum-darkBlue/70'
            }`}
          >
            AI Meal Planning
          </TouchFriendlyButton>
          
          <TouchFriendlyButton
            onClick={() => setActiveView('calorie-tracking')}
            className={`p-6 text-left transition-all duration-300 ${
              activeView === 'calorie-tracking' 
                ? 'bg-quantum-purple border-quantum-cyan' 
                : 'bg-quantum-darkBlue/50 hover:bg-quantum-darkBlue/70'
            }`}
          >
            Calorie Tracking
          </TouchFriendlyButton>
          
          <TouchFriendlyButton
            onClick={() => setActiveView('hydration')}
            className={`p-6 text-left transition-all duration-300 ${
              activeView === 'hydration' 
                ? 'bg-quantum-purple border-quantum-cyan' 
                : 'bg-quantum-darkBlue/50 hover:bg-quantum-darkBlue/70'
            }`}
          >
            Hydration Tracking
          </TouchFriendlyButton>
        </div>
        
        {activeView === 'meal-planning' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader>
                <CardTitle className="text-xl">AI Meal Planning</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-400 mb-4">
                  Generate a personalized meal plan based on your dietary preferences and fitness goals.
                </p>
                
                <ProteinWarning show={isProteinLow} />
                
                {mealPlan.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Your Meal Plan</h3>
                    <ul className="list-disc pl-5">
                      {mealPlan.map((meal, index) => (
                        <li key={index} className="text-gray-300">
                          {meal.name} - {meal.calories} calories
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-gray-500">
                      Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400">No meal plan generated yet.</p>
                )}
                
                <Button 
                  className="bg-quantum-purple hover:bg-quantum-purple/90 mt-4 w-full"
                  onClick={generateMealPlan}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Meal Plan"
                  )}
                </Button>
                
                {mealPlan.length > 0 && <SavePlanButton />}
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {activeView === 'calorie-tracking' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader>
                <CardTitle className="text-xl">Calorie Tracking</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-400 mb-4">
                  Track your daily calorie intake and macronutrient breakdown to stay on track with your fitness goals.
                </p>
                <p className="text-gray-400">Calorie tracking functionality coming soon...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {activeView === 'hydration' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader>
                <CardTitle className="text-xl">Hydration Tracking</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Hydration Level</span>
                  <span className="text-gray-300">{hydrationLevel}%</span>
                </div>
                
                <Progress value={hydrationLevel} className="mb-4" />
                
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>0%</span>
                  <span>100%</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Target Hydration</span>
                  <span className="text-gray-300">{hydrationTarget}%</span>
                </div>
                
                {isHydrationLow && (
                  <Badge variant="destructive" className="mb-4">
                    <Droplets className="h-3 w-3 mr-1" />
                    Hydration is below 95% of your target!
                  </Badge>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Adjust Hydration Level</span>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleHydrationChange(Math.max(0, hydrationLevel - 10))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleHydrationChange(Math.min(100, hydrationLevel + 10))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle className="text-xl">Saved Meal Plans</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <LoadingState />
              ) : savedPlans.length === 0 ? (
                <EmptyState />
              ) : (
                <PlanGrid
                  savedPlans={savedPlans}
                  onLoadPlan={handleLoadPlan}
                  onRenewPlan={handleRenewPlan}
                  onDeletePlan={handleDeletePlan}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </MobileContainer>
      
      <Footer />
    </div>
  );
};

export default NutritionPage;
