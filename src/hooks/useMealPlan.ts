
import { useState } from "react";
import { generateMealPlan } from "@/services/mealPlan/mealGenerationService";
import type { MealPlan } from "@/types/food";
import type { TDEEResult } from "@/components/fitness/TDEECalculator";

/**
 * Custom hook to manage TDEE calculation, store meal plan, and expose methods.
 */
export function useMealPlan() {
  const [calculationResult, setCalculationResult] = useState<TDEEResult | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTDEEAndGeneratePlan = (tdeeInput: TDEEResult) => {
    setIsLoading(true);
    setError(null);
    try {
      setCalculationResult(tdeeInput);
      const plan = generateMealPlan(tdeeInput);
      setMealPlan(plan);
    } catch (e: any) {
      setError(e.message || "Could not generate meal plan");
    } finally {
      setIsLoading(false);
    }
  };

  // Optionally allow updating the meal plan (e.g. after shuffle)
  const updateMealPlan = (updated: MealPlan) => setMealPlan(updated);

  return {
    calculationResult,
    mealPlan,
    isLoading,
    error,
    calculateTDEEAndGeneratePlan,
    updateMealPlan,
  };
}
