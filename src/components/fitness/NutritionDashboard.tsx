
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Droplets, Utensils, ShoppingCart, Shuffle } from 'lucide-react';
import { TDEEResult } from './TDEECalculator';
import { useNutritionCart } from '@/contexts/NutritionCartContext';
import { generateNutritionMealPlan } from '@/services/mealPlan/nutritionMealGenerationService';
import { shuffleNutritionPlan } from '@/services/mealPlan/nutritionShuffleService';
import { useToast } from '@/hooks/use-toast';
import NutritionCartDisplay from './nutrition/NutritionCartDisplay';
import CartConversionModal from './nutrition/CartConversionModal';

interface NutritionDashboardProps {
  calculationResult: TDEEResult;
  onUpdateMealPlan?: (updatedPlan: any) => void;
}

const NutritionDashboard: React.FC<NutritionDashboardProps> = ({
  calculationResult,
  onUpdateMealPlan
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const { 
    items, 
    totalCalories, 
    totalProtein, 
    totalCarbs, 
    totalFat,
    addItem, 
    clearCart 
  } = useNutritionCart();
  const { toast } = useToast();

  // Calculate daily hydration target based on activity level and weight
  const calculateHydrationTarget = () => {
    const baseWater = calculationResult.weight * 35; // 35ml per kg
    const activityMultiplier = calculationResult.activityLevel === 'very_active' ? 1.3 :
                               calculationResult.activityLevel === 'active' ? 1.2 :
                               calculationResult.activityLevel === 'moderately_active' ? 1.1 : 1.0;
    return Math.round(baseWater * activityMultiplier);
  };

  const hydrationTarget = calculateHydrationTarget();

  const handleGenerateMealPlan = async () => {
    try {
      // Clear existing items
      await clearCart();
      
      // Generate nutrition meal plan items
      const nutritionItems = generateNutritionMealPlan(calculationResult);
      
      // Add each item to the nutrition cart
      for (const item of nutritionItems) {
        await addItem(item);
      }
      
      toast({
        title: "Meal plan generated!",
        description: `Added ${nutritionItems.length} nutrition items to your plan.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Error generating meal plan",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleShuffleMealPlan = async () => {
    if (items.length === 0) {
      toast({
        title: "No items to shuffle",
        description: "Generate a meal plan first before shuffling.",
        variant: "destructive"
      });
      return;
    }

    setIsShuffling(true);
    try {
      // Clear existing items
      await clearCart();
      
      // Generate shuffled nutrition meal plan items
      const shuffledItems = shuffleNutritionPlan(items, calculationResult);
      
      // Add each shuffled item to the nutrition cart
      for (const item of shuffledItems) {
        await addItem(item);
      }
      
      toast({
        title: "Meal plan shuffled!",
        description: `Generated ${shuffledItems.length} new nutrition items for variety.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error shuffling meal plan:', error);
      toast({
        title: "Error shuffling meal plan",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsShuffling(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header with key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Daily Calories</p>
                <p className="text-2xl font-bold text-quantum-cyan">{calculationResult.adjustedCalories}</p>
                <p className="text-xs text-gray-500">Current: {Math.round(totalCalories)}</p>
              </div>
              <Badge variant="outline" className="bg-quantum-cyan/10 text-quantum-cyan border-quantum-cyan/30">
                {calculationResult.goal}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-quantum-darkBlue/30 border-green-500/20">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-400">Protein</p>
              <p className="text-2xl font-bold text-green-400">{calculationResult.proteinGrams}g</p>
              <p className="text-xs text-gray-500">Current: {Math.round(totalProtein)}g</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-quantum-darkBlue/30 border-blue-500/20">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-400">Carbs</p>
              <p className="text-2xl font-bold text-blue-400">{calculationResult.carbsGrams}g</p>
              <p className="text-xs text-gray-500">Current: {Math.round(totalCarbs)}g</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-quantum-darkBlue/30 border-yellow-500/20">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-400">Fats</p>
              <p className="text-2xl font-bold text-yellow-400">{calculationResult.fatsGrams}g</p>
              <p className="text-xs text-gray-500">Current: {Math.round(totalFat)}g</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-quantum-darkBlue/50 w-full justify-start">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Nutrition Plan
          </TabsTrigger>
          <TabsTrigger value="cart" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            My Plan ({items.length})
          </TabsTrigger>
          <TabsTrigger value="hydration" className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            Hydration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle className="text-quantum-cyan flex items-center justify-between">
                <span>Your Personalized Nutrition Plan</span>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleGenerateMealPlan}
                    className="bg-quantum-purple hover:bg-quantum-purple/90"
                  >
                    Generate Meal Plan
                  </Button>
                  {items.length > 0 && (
                    <Button 
                      onClick={handleShuffleMealPlan}
                      disabled={isShuffling}
                      variant="outline"
                      className="border-quantum-cyan/30 text-quantum-cyan hover:bg-quantum-cyan/10"
                    >
                      <Shuffle className="h-4 w-4 mr-2" />
                      {isShuffling ? "Shuffling..." : "Shuffle Plan"}
                    </Button>
                  )}
                </div>
              </CardTitle>
              <p className="text-gray-400">
                Create a nutrition plan optimized for your {calculationResult.goal.toLowerCase()} goal
              </p>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No nutrition items in your plan yet.</p>
                  <Button 
                    onClick={handleGenerateMealPlan}
                    className="bg-quantum-purple hover:bg-quantum-purple/90"
                  >
                    Generate Your First Meal Plan
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Current plan: {items.length} items</span>
                    <Button 
                      onClick={() => setShowConversionModal(true)}
                      variant="outline"
                      className="border-quantum-cyan/30 text-quantum-cyan hover:bg-quantum-cyan/10"
                    >
                      Convert to Restaurant Order
                    </Button>
                  </div>
                  <NutritionCartDisplay />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cart" className="mt-6">
          <NutritionCartDisplay />
        </TabsContent>

        <TabsContent value="hydration" className="mt-6">
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle className="text-quantum-cyan flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-400" />
                Daily Hydration Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    {hydrationTarget} ml
                  </div>
                  <p className="text-gray-400">
                    Recommended daily water intake based on your activity level and goals
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Conversion Modal */}
      <CartConversionModal 
        open={showConversionModal}
        onOpenChange={setShowConversionModal}
      />
    </motion.div>
  );
};

export default NutritionDashboard;
