
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TDEEResult } from '@/components/fitness/TDEECalculator';
import { MealPlan } from '@/types/food';
import { saveMealPlan } from '@/services/mealPlan';

interface SaveCurrentPlanButtonProps {
  userId: string;
  onPlanSaved: () => Promise<void>;
}

const SaveCurrentPlanButton: React.FC<SaveCurrentPlanButtonProps> = ({ userId, onPlanSaved }) => {
  const handleSaveCurrentMealPlan = async () => {
    try {
      // Get current meal plan from session storage
      const storedMealPlan = sessionStorage.getItem('currentMealPlan');
      const storedTDEE = sessionStorage.getItem('currentTDEE');
      
      if (!storedMealPlan || !storedTDEE) {
        toast.error('No current meal plan found to save. Generate a meal plan first.');
        return;
      }
      
      const mealPlan = JSON.parse(storedMealPlan) as MealPlan;
      const tdeeResult = JSON.parse(storedTDEE) as TDEEResult;
      
      // Save the plan name
      const planName = `${tdeeResult.goal} plan (${tdeeResult.adjustedCalories} cal)`;
      
      // First create or get TDEE record
      const { data: tdeeData, error: tdeeError } = await supabase
        .from('user_tdee')
        .insert({
          user_id: userId,
          date: new Date().toISOString(),
          tdee: tdeeResult.tdee,
          bmr: tdeeResult.bmr,
          goal: tdeeResult.goal,
          activity_level: 'moderate', // Default value as it's not stored in TDEEResult
          protein_target: tdeeResult.proteinGrams,
          carbs_target: tdeeResult.carbsGrams,
          fat_target: tdeeResult.fatsGrams,
        })
        .select('id')
        .single();
        
      if (tdeeError) throw tdeeError;
      
      // Now save the meal plan with expiration date
      const result = await saveMealPlan(userId, planName, mealPlan, tdeeData.id);
      
      if (result.error) throw result.error;
      
      toast.success('Your meal plan has been saved successfully.');
      
      // Refresh the list
      await onPlanSaved();
      
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast.error('Failed to save meal plan.');
    }
  };

  return (
    <Button 
      onClick={handleSaveCurrentMealPlan}
      className="bg-quantum-purple hover:bg-quantum-purple/90"
    >
      Save Current Plan
    </Button>
  );
};

export default SaveCurrentPlanButton;
