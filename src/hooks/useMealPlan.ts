
import { useState } from "react";
import { generateMealPlan } from "@/services/mealPlan/mealGenerationService";
import { TDEEResult } from "@/components/fitness/TDEECalculator";
import { MealPlan } from "@/types/food";

/** 
 * Handles TDEE calculation result and meal plan generation.
 * Call calculateTDEE with TDEEResult when form valid.
 */
export const useMealPlan = () => {
  const [calculationResult, setCalculationResult] = useState<TDEEResult | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User triggers this after TDEE calculation
  const calculateTDEE = (result: TDEEResult) => {
    setCalculationResult(result);
    setIsLoading(true);
    setError(null);

    try {
      const generatedPlan = generateMealPlan(result);
      setMealPlan(generatedPlan);
    } catch (e: any) {
      setError(e.message || "Failed to generate meal plan");
      setMealPlan(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Optionally: User can update meal plan (e.g., after shuffle)
  const updateMealPlan = (plan: MealPlan) => setMealPlan(plan);

  return {
    calculationResult,
    mealPlan,
    isLoading,
    error,
    calculateTDEE,
    updateMealPlan,
  };
};
