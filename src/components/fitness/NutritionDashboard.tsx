
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { TDEEResult } from '@/components/fitness/TDEECalculator'; 
import { MealPlan } from '@/types/food';
import { shuffleMeal } from '@/services/mealPlan/mealGenerationService';
import { toast } from 'sonner';

// Import the newly created components
import MacroSummary from './nutrition/MacroSummary';
import NutritionControlPanel from './nutrition/NutritionControlPanel';
import MealCardGrid from './nutrition/MealCardGrid';
import ProteinWarning from './nutrition/ProteinWarning';
import SavePlanButton from './nutrition/SavePlanButton';

interface NutritionDashboardProps {
  calculationResult: TDEEResult;
  mealPlan: MealPlan;
  onUpdateMealPlan: (updatedPlan: MealPlan) => void;
}

const NutritionDashboard: React.FC<NutritionDashboardProps> = ({ 
  calculationResult,
  mealPlan,
  onUpdateMealPlan
}) => {
  const { toast: uiToast } = useToast();
  const [isAutoOptimizeProtein, setIsAutoOptimizeProtein] = useState(true);
  const [waterIntake, setWaterIntake] = useState(0);
  
  const isProteinSufficient = (mealPlan.actualProtein || 0) >= mealPlan.targetProtein * 0.95;

  // Load water intake from localStorage on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedIntake = localStorage.getItem(`water_intake_${today}`);
    if (savedIntake) {
      setWaterIntake(parseInt(savedIntake));
    }
  }, []);

  // Distribution percentages for each meal
  const mealDistribution = [
    { name: 'Breakfast', protein: 0.25, carbs: 0.25, fat: 0.25 },
    { name: 'Lunch', protein: 0.3, carbs: 0.3, fat: 0.3 },
    { name: 'Snack', protein: 0.15, carbs: 0.15, fat: 0.15 },
    { name: 'Dinner', protein: 0.3, carbs: 0.3, fat: 0.3 }
  ];

  // Calculate recommended daily water intake based on weight and activity level
  const calculateRecommendedWaterIntake = () => {
    // Default values if calculationResult doesn't have the required properties
    const weightInKg = calculationResult && 'weight' in calculationResult ? Number(calculationResult.weight) : 70;
    let baseIntake = weightInKg * 35;
    
    // Adjust for activity level if available
    if (calculationResult && 'activityLevel' in calculationResult) {
      const activityLevel = calculationResult.activityLevel;
      if (activityLevel === 'sedentary') {
        baseIntake *= 0.9;
      } else if (activityLevel === 'very-active' || activityLevel === 'extremely-active') {
        baseIntake *= 1.2;
      }
    }
    
    return Math.round(baseIntake);
  };

  useEffect(() => {
    // Update the hydration target in the meal plan with the calculated value
    if (mealPlan && (!mealPlan.hydrationTarget || mealPlan.hydrationTarget === 0)) {
      const hydrationTarget = calculateRecommendedWaterIntake();
      const updatedMealPlan = {
        ...mealPlan,
        hydrationTarget
      };
      onUpdateMealPlan(updatedMealPlan);
    }
  }, [calculationResult, mealPlan]);

  const handleShuffleMeal = (index: number) => {
    const meal = mealPlan.meals[index];
    const distribution = mealDistribution[index];
    
    const targetProteinPerMeal = mealPlan.targetProtein * distribution.protein;
    const targetCarbsPerMeal = mealPlan.targetCarbs * distribution.carbs;
    const targetFatPerMeal = mealPlan.targetFat * distribution.fat;
    
    // If auto-optimize is on, ensure protein is prioritized
    const ensureProtein = isAutoOptimizeProtein;
    
    const newMeal = shuffleMeal(
      meal, 
      targetProteinPerMeal, 
      targetCarbsPerMeal, 
      targetFatPerMeal
    );
    
    const updatedMeals = [...mealPlan.meals];
    updatedMeals[index] = newMeal;
    
    // Recalculate actual totals
    const totalCalories = updatedMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
    const actualProtein = updatedMeals.reduce((sum, meal) => sum + meal.totalProtein, 0);
    const actualCarbs = updatedMeals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
    const actualFat = updatedMeals.reduce((sum, meal) => sum + meal.totalFat, 0);
    
    const updatedMealPlan = {
      ...mealPlan,
      meals: updatedMeals,
      totalCalories,
      actualProtein,
      actualCarbs,
      actualFat
    };
    
    onUpdateMealPlan(updatedMealPlan);
    
    const proteinPercentage = Math.round((actualProtein / mealPlan.targetProtein) * 100);
    if (proteinPercentage < 95 && isAutoOptimizeProtein) {
      uiToast({
        title: "Protein Warning",
        description: `New protein level at ${proteinPercentage}% of target. Consider reshuffling.`,
        variant: "destructive"
      });
    } else {
      // Use the sonner toast API correctly
      toast(`${meal.name} updated with new meal options.`);
    }
  };

  const handleWaterIntakeChange = (newIntake: number) => {
    setWaterIntake(newIntake);
    // You can add more logic here if needed to update other parts of the app
  };

  return (
    <div className="space-y-6">
      {/* Nutritional Overview Header using MacroSummary component */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full">
          <MacroSummary
            totalCalories={mealPlan.totalCalories}
            targetProtein={mealPlan.targetProtein}
            targetCarbs={mealPlan.targetCarbs}
            targetFat={mealPlan.targetFat}
            actualProtein={mealPlan.actualProtein || 0}
            actualCarbs={mealPlan.actualCarbs || 0}
            actualFat={mealPlan.actualFat || 0}
          />
        </div>
        <div className="w-full md:w-1/3">
          <NutritionControlPanel
            isAutoOptimizeProtein={isAutoOptimizeProtein}
            setIsAutoOptimizeProtein={setIsAutoOptimizeProtein}
            hydrationTarget={mealPlan.hydrationTarget || calculateRecommendedWaterIntake()}
            waterIntake={waterIntake}
            onWaterIntakeChange={handleWaterIntakeChange}
          />
        </div>
      </div>
      
      {/* Protein Warning */}
      <ProteinWarning show={!isProteinSufficient} />
      
      {/* Meal Cards Grid */}
      <MealCardGrid
        meals={mealPlan.meals}
        onShuffleMeal={handleShuffleMeal}
        mealDistribution={mealDistribution}
        targetProtein={mealPlan.targetProtein}
      />
      
      {/* Save Meal Plan Button */}
      <SavePlanButton />
    </div>
  );
};

export default NutritionDashboard;
