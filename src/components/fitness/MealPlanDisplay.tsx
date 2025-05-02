import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MealPlan, Meal } from '@/types/food';
import { Shuffle, Droplets, AlertCircle, Info, Shield, Utensils } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { shuffleMeal } from '@/services/mealPlanService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";

interface MealCardProps {
  meal: Meal;
  onShuffle: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onShuffle }) => {
  // Function to render an appropriate meal icon based on meal name
  const renderMealIcon = () => {
    if (meal.name.toLowerCase().includes('breakfast')) {
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
    } else if (meal.name.toLowerCase().includes('lunch')) {
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2"/><path d="M18 15V2"/><path d="M21 15a3 3 0 1 1-6 0"/></svg>;
    } else if (meal.name.toLowerCase().includes('dinner')) {
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M8.21 13.89 7 23l-3-3-2-4-1-7 9.21 4.89Z"/><path d="M14 13.5V22l4 1 3-3 1-6-8-1Z"/><path d="M10.53 9.33 8.57 7.37A1.45 1.45 0 0 1 9.17 4.5a5.07 5.07 0 0 1 5.66 5.66 1.45 1.45 0 0 1-2.87.6l-1.96-1.96Z"/><path d="M14 6.5v.5"/></svg>;
    } else {
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>;
    }
  };

  return (
    <Card className="holographic-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-quantum-cyan flex items-center gap-2">
            {renderMealIcon()}
            {meal.name}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-quantum-purple"
            onClick={onShuffle}
            title="Shuffle meal options"
          >
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="flex gap-2 text-xs">
          <span>{meal.totalCalories} kcal</span>
          <span>•</span>
          <span>P: {meal.totalProtein}g</span>
          <span>•</span>
          <span>C: {meal.totalCarbs}g</span>
          <span>•</span>
          <span>F: {meal.totalFat}g</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ul className="space-y-2">
          {meal.foods.map((item) => (
            <li key={item.food.id} className="flex justify-between py-1 border-b border-quantum-cyan/10 last:border-0">
              <div>
                <div className="text-sm font-medium flex items-center">
                  {item.food.name}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-1 inline-flex">
                          <Info className="h-3.5 w-3.5 text-gray-400" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs mb-1">
                          {item.food.cookingState === "cooked" 
                            ? "Values based on cooked weight" 
                            : "Values based on raw/uncooked weight"}
                        </p>
                        {item.food.mealSuitability && (
                          <p className="text-xs">
                            Suitable for: {item.food.mealSuitability.join(', ')}
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-xs text-gray-400">
                  {Math.round((item.food.calories * item.portionSize) / 100)} kcal
                </div>
              </div>
              <div className="text-sm">{item.portionSize}g</div>
            </li>
          ))}
        </ul>

        <div className="mt-4 text-xs text-gray-400 flex items-center gap-1">
          <Utensils className="h-3.5 w-3.5" />
          <span>Culturally appropriate for {meal.name.toLowerCase()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

interface MealPlanDisplayProps {
  mealPlan: MealPlan;
  onUpdateMealPlan: (mealPlan: MealPlan) => void;
}

const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({
  mealPlan,
  onUpdateMealPlan
}) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleShuffleMeal = (index: number) => {
    const meal = mealPlan.meals[index];
    const targetProteinPerMeal = mealPlan.targetProtein * [0.25, 0.3, 0.15, 0.3][index];
    const targetCarbsPerMeal = mealPlan.targetCarbs * [0.25, 0.3, 0.15, 0.3][index];
    const targetFatPerMeal = mealPlan.targetFat * [0.25, 0.3, 0.15, 0.3][index];
    
    const newMeal = shuffleMeal(meal, targetProteinPerMeal, targetCarbsPerMeal, targetFatPerMeal);
    
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
    
    toast({
      title: `${meal.name} Updated`,
      description: "New culturally appropriate meal options generated.",
    });
  };

  // Calculate the percentage of actual vs target for macros
  const proteinPercent = Math.round((mealPlan.actualProtein || 0) / mealPlan.targetProtein * 100);
  const carbsPercent = Math.round((mealPlan.actualCarbs || 0) / mealPlan.targetCarbs * 100);
  const fatPercent = Math.round((mealPlan.actualFat || 0) / mealPlan.targetFat * 100);

  // Check if there's a significant variance in any macro
  const hasSignificantVariance = 
    Math.abs(proteinPercent - 100) > 15 || 
    Math.abs(carbsPercent - 100) > 15 || 
    Math.abs(fatPercent - 100) > 15;

  // Check specifically for protein being below 95%
  const lowProtein = proteinPercent < 95;

  const handleSaveMealPlan = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save your meal plan.",
        variant: "destructive",
      });
      return;
    }
    
    // Get TDEE result from session storage
    const storedTDEE = sessionStorage.getItem('currentTDEE');
    if (!storedTDEE) {
      toast({
        title: "Error",
        description: "Missing TDEE data. Try refreshing the page and recalculating.",
        variant: "destructive",
      });
      return;
    }
    
    const tdeeResult = JSON.parse(storedTDEE) as TDEEResult;
    
    try {
      // Save to session storage as well
      sessionStorage.setItem('currentMealPlan', JSON.stringify(mealPlan));
      
      // Save to database with expiration (14 days from now)
      const result = await saveMealPlan(user.id, mealPlan, tdeeResult);
      
      if (result.success) {
        toast({
          title: "Meal Plan Saved",
          description: "Your personalized meal plan has been saved for 14 days.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to save meal plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-quantum-cyan/30 bg-quantum-darkBlue/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Your Personalized Meal Plan</span>
          <span className="text-quantum-purple">
            {mealPlan.totalCalories} kcal
          </span>
        </CardTitle>
        <CardDescription>
          Based on your {mealPlan.goal} goal with culturally familiar foods
        </CardDescription>
        
        <div className="mt-2 grid grid-cols-3 gap-1 text-sm">
          <div className={`${lowProtein ? 'bg-red-900/30' : 'bg-blue-900/30'} rounded-md p-2 text-center`}>
            <div className="text-blue-400 font-medium flex items-center justify-center gap-1">
              Protein
              {proteinPercent >= 95 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">
                        <Shield className="h-3.5 w-3.5 text-green-400" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Meeting at least 95% of target protein</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div>
              <span className="text-lg font-bold">{mealPlan.actualProtein || 0}g</span>
              <span className="text-gray-400 text-xs"> / {mealPlan.targetProtein}g</span>
            </div>
            <div className={`text-xs ${lowProtein ? 'text-red-400' : 'text-gray-400'}`}>
              {proteinPercent}% of target
            </div>
          </div>
          <div className="bg-green-900/30 rounded-md p-2 text-center">
            <div className="text-green-400 font-medium">Carbs</div>
            <div>
              <span className="text-lg font-bold">{mealPlan.actualCarbs || 0}g</span>
              <span className="text-gray-400 text-xs"> / {mealPlan.targetCarbs}g</span>
            </div>
            <div className="text-xs text-gray-400">{carbsPercent}% of target</div>
          </div>
          <div className="bg-yellow-900/30 rounded-md p-2 text-center">
            <div className="text-yellow-400 font-medium">Fats</div>
            <div>
              <span className="text-lg font-bold">{mealPlan.actualFat || 0}g</span>
              <span className="text-gray-400 text-xs"> / {mealPlan.targetFat}g</span>
            </div>
            <div className="text-xs text-gray-400">{fatPercent}% of target</div>
          </div>
        </div>
        
        {hasSignificantVariance && (
          <div className="mt-2 text-amber-400 text-xs flex items-center gap-1 bg-amber-900/20 p-2 rounded">
            <AlertCircle className="h-4 w-4" />
            <span>The actual macros may vary from targets due to real food portion constraints.</span>
          </div>
        )}
        
        {lowProtein && (
          <div className="mt-2 text-red-400 text-xs flex items-center gap-1 bg-red-900/20 p-2 rounded">
            <AlertCircle className="h-4 w-4" />
            <span>Protein is below 95% of your target. Consider reshuffling meals to increase protein intake.</span>
          </div>
        )}

        <div className="mt-2 bg-blue-900/20 p-2 rounded">
          <p className="text-sm text-blue-300">
            <span className="font-medium">🍽️ Culturally Appropriate:</span> This meal plan uses foods traditionally associated with each meal time to make your plan more familiar and enjoyable.
          </p>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {mealPlan.meals.map((meal, index) => (
            <MealCard 
              key={meal.id} 
              meal={meal}
              onShuffle={() => handleShuffleMeal(index)}
            />
          ))}
        </div>
        
        <div className="mt-6 flex items-center gap-2 p-4 bg-blue-900/20 rounded-lg">
          <Droplets className="h-8 w-8 text-blue-400" />
          <div>
            <div className="font-medium">Daily Water Target</div>
            <div className="text-2xl font-bold text-blue-400">
              {mealPlan.hydrationTarget} ml
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <Button 
            className="w-full bg-quantum-purple hover:bg-quantum-purple/90"
            onClick={handleSaveMealPlan}
          >
            Save This Meal Plan (Valid for 14 Days)
          </Button>
          {user ? null : (
            <p className="text-xs text-center mt-2 text-gray-400">
              You must be logged in to save meal plans
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MealPlanDisplay;
