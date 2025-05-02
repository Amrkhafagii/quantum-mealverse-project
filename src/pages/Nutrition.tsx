
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { Button } from '@/components/ui/button';
import { Check, Utensils, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import TDEECalculator from '@/components/fitness/TDEECalculator';
import { TDEEResult } from '@/components/fitness/TDEECalculator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateMealPlan } from '@/services/mealPlanService';
import { MealPlan, Meal, MealFood } from '@/types/food';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const Nutrition = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'plans' | 'calculator'>('plans');
  const [calculationResult, setCalculationResult] = useState<TDEEResult | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [openMeals, setOpenMeals] = useState<string[]>([]);

  const handleCalculationComplete = (result: TDEEResult) => {
    setCalculationResult(result);
    // Generate meal plan based on TDEE results
    const generatedMealPlan = generateMealPlan(result);
    setMealPlan(generatedMealPlan);
    setActiveTab('plans');
    toast.success("Calorie calculation completed! We've generated a meal plan that fits your needs.");
  };

  const toggleMealOpen = (mealId: string) => {
    setOpenMeals(prev => 
      prev.includes(mealId) 
        ? prev.filter(id => id !== mealId) 
        : [...prev, mealId]
    );
  };

  const getMealCategoryColor = (category: string) => {
    switch (category) {
      case 'protein': return 'bg-blue-500/30 border-blue-500/50 text-blue-300';
      case 'carbs': return 'bg-green-500/30 border-green-500/50 text-green-300';
      case 'fats': return 'bg-yellow-500/30 border-yellow-500/50 text-yellow-300';
      case 'vegetables': return 'bg-purple-500/30 border-purple-500/50 text-purple-300';
      default: return 'bg-gray-500/30 border-gray-500/50 text-gray-300';
    }
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
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'plans' | 'calculator')} className="mb-8">
          <TabsList className="w-full max-w-md mx-auto">
            <TabsTrigger value="plans">Meal Plans</TabsTrigger>
            <TabsTrigger value="calculator">Calorie Calculator</TabsTrigger>
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
            {calculationResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <Card className="bg-quantum-darkBlue/30 border-quantum-purple/20 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-quantum-purple mb-3">Your Nutritional Needs</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-quantum-darkBlue/50 p-3 rounded-lg text-center">
                        <div className="text-sm text-gray-400">Daily Calories</div>
                        <div className="text-xl font-bold text-quantum-cyan">{calculationResult.adjustedCalories} kcal</div>
                      </div>
                      <div className="bg-quantum-darkBlue/50 p-3 rounded-lg text-center">
                        <div className="text-sm text-gray-400">Protein</div>
                        <div className="text-xl font-bold text-quantum-cyan">{calculationResult.proteinGrams}g</div>
                      </div>
                      <div className="bg-quantum-darkBlue/50 p-3 rounded-lg text-center">
                        <div className="text-sm text-gray-400">Carbs</div>
                        <div className="text-xl font-bold text-quantum-cyan">{calculationResult.carbsGrams}g</div>
                      </div>
                      <div className="bg-quantum-darkBlue/50 p-3 rounded-lg text-center">
                        <div className="text-sm text-gray-400">Fats</div>
                        <div className="text-xl font-bold text-quantum-cyan">{calculationResult.fatsGrams}g</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">Our meal plans can be customized to meet your specific macronutrient requirements.</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {mealPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-12"
              >
                <Card className="bg-quantum-darkBlue/30 border-quantum-purple/20 backdrop-blur-sm mb-8">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-quantum-cyan">Your Custom Meal Plan</h3>
                      <Badge className="bg-quantum-purple">{mealPlan.goal === 'maintain' ? 'Maintenance' : mealPlan.goal === 'cut' ? 'Weight Loss' : 'Muscle Gain'}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-quantum-darkBlue/50 p-3 rounded-lg text-center">
                        <div className="text-sm text-gray-400">Total Calories</div>
                        <div className="text-xl font-bold text-quantum-cyan">{mealPlan.totalCalories} kcal</div>
                      </div>
                      <div className="bg-quantum-darkBlue/50 p-3 rounded-lg text-center">
                        <div className="text-sm text-blue-400">Protein</div>
                        <div className="text-xl font-bold text-blue-300">{mealPlan.actualProtein}g</div>
                        <div className="text-xs text-gray-400">Target: {mealPlan.targetProtein}g</div>
                      </div>
                      <div className="bg-quantum-darkBlue/50 p-3 rounded-lg text-center">
                        <div className="text-sm text-green-400">Carbs</div>
                        <div className="text-xl font-bold text-green-300">{mealPlan.actualCarbs}g</div>
                        <div className="text-xs text-gray-400">Target: {mealPlan.targetCarbs}g</div>
                      </div>
                      <div className="bg-quantum-darkBlue/50 p-3 rounded-lg text-center">
                        <div className="text-sm text-yellow-400">Fats</div>
                        <div className="text-xl font-bold text-yellow-300">{mealPlan.actualFat}g</div>
                        <div className="text-xs text-gray-400">Target: {mealPlan.targetFat}g</div>
                      </div>
                    </div>
                    
                    <div className="bg-quantum-darkBlue/50 p-3 rounded-lg text-center mb-6">
                      <div className="text-sm text-blue-400">Daily Water Intake</div>
                      <div className="text-xl font-bold text-white">{mealPlan.hydrationTarget} ml</div>
                    </div>
                    
                    <div className="space-y-4">
                      {mealPlan.meals.map((meal, index) => (
                        <Collapsible 
                          key={meal.id} 
                          open={openMeals.includes(meal.id)}
                          className="border border-quantum-purple/30 rounded-lg overflow-hidden"
                        >
                          <CollapsibleTrigger 
                            className="flex items-center justify-between w-full p-4 text-left hover:bg-quantum-darkBlue/50 transition-colors"
                            onClick={() => toggleMealOpen(meal.id)}
                          >
                            <div className="flex items-center">
                              <Utensils className="h-5 w-5 mr-3 text-quantum-cyan" />
                              <span className="text-lg font-medium">{meal.name}</span>
                              <Badge className="ml-3 bg-quantum-cyan/20 text-quantum-cyan">{meal.totalCalories} kcal</Badge>
                            </div>
                            <div className="flex items-center space-x-6">
                              <span className="text-sm hidden md:inline-block">
                                <span className="text-blue-300">{meal.totalProtein}g P</span> · 
                                <span className="text-green-300 ml-2">{meal.totalCarbs}g C</span> · 
                                <span className="text-yellow-300 ml-2">{meal.totalFat}g F</span>
                              </span>
                              {openMeals.includes(meal.id) ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="p-4 bg-quantum-black/30">
                              <div className="grid gap-3">
                                {meal.foods.map((mealFood) => (
                                  <div 
                                    key={`${meal.id}-${mealFood.food.id}`} 
                                    className={`flex justify-between items-center p-3 border rounded-md ${getMealCategoryColor(mealFood.food.category)}`}
                                  >
                                    <div>
                                      <div className="font-medium">{mealFood.food.name}</div>
                                      <div className="text-sm text-gray-300">{mealFood.portionSize}g</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm">
                                        {Math.round(mealFood.food.calories * mealFood.portionSize / 100)} kcal
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        P: {Math.round(mealFood.food.protein * mealFood.portionSize / 100)}g · 
                                        C: {Math.round(mealFood.food.carbs * mealFood.portionSize / 100)}g · 
                                        F: {Math.round(mealFood.food.fat * mealFood.portionSize / 100)}g
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
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
                    onClick={() => navigate('/contact')}
                    className="w-full border-quantum-cyan text-quantum-cyan hover:bg-quantum-cyan/10"
                  >
                    Contact Us
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
                    onClick={() => navigate('/contact')}
                    className="w-full bg-quantum-purple hover:bg-quantum-purple/90"
                  >
                    Contact Us
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
                    onClick={() => navigate('/contact')}
                    className="w-full border-quantum-cyan text-quantum-cyan hover:bg-quantum-cyan/10"
                  >
                    Contact Us
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Information Card */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-16 max-w-4xl mx-auto"
            >
              <Card className="bg-quantum-darkBlue/30 border-quantum-purple/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-quantum-purple mb-4">Meal Plan Information</h3>
                  <p className="mb-4">Contact us to learn more about our meal plans and how they can be customized to meet your specific dietary needs.</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="text-quantum-purple h-5 w-5" />
                      <span>Chef-prepared meals delivered fresh</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-quantum-purple h-5 w-5" />
                      <span>Customizable based on dietary preferences</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-quantum-purple h-5 w-5" />
                      <span>All nutritional information provided</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-quantum-purple h-5 w-5" />
                      <span>Sustainable packaging used</span>
                    </li>
                  </ul>
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
