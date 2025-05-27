
import { useState, useEffect } from 'react';
import { MealCustomizationService } from '@/services/mealCustomization/mealCustomizationService';
import { 
  MealCustomizationOption, 
  IngredientSubstitution, 
  MealPlanCustomization,
  MealCustomizationSummary 
} from '@/types/mealCustomization';
import { useToast } from '@/components/ui/use-toast';

export const useMealCustomization = (mealId: string, userId: string) => {
  const [customizationOptions, setCustomizationOptions] = useState<MealCustomizationOption[]>([]);
  const [ingredientSubstitutions, setIngredientSubstitutions] = useState<IngredientSubstitution[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Customization state
  const [servingsCount, setServingsCount] = useState(1);
  const [portionMultiplier, setPortionMultiplier] = useState(1.0);
  const [selectedSubstitutions, setSelectedSubstitutions] = useState<IngredientSubstitution[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<MealCustomizationOption[]>([]);
  const [selectedDietaryPreferences, setSelectedDietaryPreferences] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [customizationSummary, setCustomizationSummary] = useState<MealCustomizationSummary | null>(null);
  
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    if (mealId) {
      loadMealCustomizationData();
    }
  }, [mealId]);

  // Recalculate summary when customizations change
  useEffect(() => {
    if (mealId && (servingsCount !== 1 || portionMultiplier !== 1.0 || selectedSubstitutions.length > 0 || selectedOptions.length > 0)) {
      calculateSummary();
    }
  }, [mealId, servingsCount, portionMultiplier, selectedSubstitutions, selectedOptions]);

  const loadMealCustomizationData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [options, substitutions, preferences] = await Promise.all([
        MealCustomizationService.getMealCustomizationOptions(mealId),
        MealCustomizationService.getIngredientSubstitutions(),
        MealCustomizationService.getDietaryPreferences()
      ]);

      setCustomizationOptions(options);
      setIngredientSubstitutions(substitutions);
      setDietaryPreferences(preferences);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load customization data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = async () => {
    try {
      const summary = await MealCustomizationService.calculateCustomizationSummary(
        mealId,
        servingsCount,
        portionMultiplier,
        selectedSubstitutions,
        selectedOptions
      );
      setCustomizationSummary(summary);
    } catch (err) {
      console.error('Error calculating customization summary:', err);
    }
  };

  const addSubstitution = (substitution: IngredientSubstitution) => {
    if (!selectedSubstitutions.find(s => s.id === substitution.id)) {
      setSelectedSubstitutions(prev => [...prev, substitution]);
    }
  };

  const removeSubstitution = (substitutionId: string) => {
    setSelectedSubstitutions(prev => prev.filter(s => s.id !== substitutionId));
  };

  const addOption = (option: MealCustomizationOption) => {
    if (!selectedOptions.find(o => o.id === option.id)) {
      setSelectedOptions(prev => [...prev, option]);
    }
  };

  const removeOption = (optionId: string) => {
    setSelectedOptions(prev => prev.filter(o => o.id !== optionId));
  };

  const toggleDietaryPreference = (preference: string) => {
    setSelectedDietaryPreferences(prev =>
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const saveCustomization = async (mealPlanId: string): Promise<MealPlanCustomization | null> => {
    setLoading(true);
    setError(null);

    try {
      const customization = await MealCustomizationService.saveMealPlanCustomization({
        meal_plan_id: mealPlanId,
        meal_id: mealId,
        user_id: userId,
        servings_count: servingsCount,
        portion_size_multiplier: portionMultiplier,
        dietary_preferences: selectedDietaryPreferences,
        ingredient_substitutions: selectedSubstitutions,
        special_instructions: specialInstructions,
        total_price_adjustment: customizationSummary?.total_cost ? 
          customizationSummary.total_cost - customizationSummary.base_price : 0
      });

      if (customization) {
        toast({
          title: "Success",
          description: "Meal customization saved successfully"
        });
      }

      return customization;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save customization';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resetCustomization = () => {
    setServingsCount(1);
    setPortionMultiplier(1.0);
    setSelectedSubstitutions([]);
    setSelectedOptions([]);
    setSelectedDietaryPreferences([]);
    setSpecialInstructions('');
    setCustomizationSummary(null);
  };

  return {
    // Data
    customizationOptions,
    ingredientSubstitutions,
    dietaryPreferences,
    
    // State
    loading,
    error,
    servingsCount,
    portionMultiplier,
    selectedSubstitutions,
    selectedOptions,
    selectedDietaryPreferences,
    specialInstructions,
    customizationSummary,
    
    // Actions
    setServingsCount,
    setPortionMultiplier,
    setSpecialInstructions,
    addSubstitution,
    removeSubstitution,
    addOption,
    removeOption,
    toggleDietaryPreference,
    saveCustomization,
    resetCustomization,
    refreshData: loadMealCustomizationData
  };
};
