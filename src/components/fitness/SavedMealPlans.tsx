
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SavedMealPlan } from '@/types/fitness';
import { Droplets } from 'lucide-react';
import { TDEEResult } from '@/components/fitness/TDEECalculator';
import { MealPlan } from '@/types/food';

interface SavedMealPlansProps {
  userId?: string;
}

const SavedMealPlans = ({ userId }: SavedMealPlansProps) => {
  const { toast } = useToast();
  const [savedPlans, setSavedPlans] = useState<SavedMealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadSavedMealPlans();
    }
  }, [userId]);

  const loadSavedMealPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_meal_plans')
        .select('*')
        .eq('user_id', userId)
        .order('date_created', { ascending: false });
        
      if (error) throw error;
      
      setSavedPlans(data || []);
    } catch (error) {
      console.error('Error loading saved meal plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load saved meal plans.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('saved_meal_plans')
        .delete()
        .eq('id', planId);
        
      if (error) throw error;
      
      // Remove from local state
      setSavedPlans(savedPlans.filter(plan => plan.id !== planId));
      
      toast({
        title: 'Plan Deleted',
        description: 'Your meal plan has been deleted.',
      });
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete meal plan.',
        variant: 'destructive',
      });
    }
  };

  // Function to save current meal plan from session storage
  const saveCurrentMealPlan = async () => {
    try {
      // Get current meal plan from session storage
      const storedMealPlan = sessionStorage.getItem('currentMealPlan');
      const storedTDEE = sessionStorage.getItem('currentTDEE');
      
      if (!storedMealPlan || !storedTDEE) {
        toast({
          title: 'No Meal Plan',
          description: 'No current meal plan found to save. Generate a meal plan first.',
          variant: 'destructive',
        });
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
      
      // Now save the meal plan
      const { error } = await supabase
        .from('saved_meal_plans')
        .insert({
          user_id: userId,
          name: planName,
          date_created: new Date().toISOString(),
          tdee_id: tdeeData.id,
          meal_plan: mealPlan,
        });
        
      if (error) throw error;
      
      toast({
        title: 'Plan Saved',
        description: 'Your meal plan has been saved successfully.',
      });
      
      // Refresh the list
      await loadSavedMealPlans();
      
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save meal plan.',
        variant: 'destructive',
      });
    }
  };

  const loadPlan = (plan: SavedMealPlan) => {
    try {
      // Store the plan in session storage
      sessionStorage.setItem('currentMealPlan', JSON.stringify(plan.meal_plan));
      
      // Redirect to the fitness page
      window.location.href = '/fitness';
      
      toast({
        title: 'Plan Loaded',
        description: 'Your saved meal plan has been loaded.',
      });
    } catch (error) {
      console.error('Error loading plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to load meal plan.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <p>Loading saved meal plans...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-quantum-cyan">Your Saved Meal Plans</h2>
        <Button 
          onClick={saveCurrentMealPlan}
          className="bg-quantum-purple hover:bg-quantum-purple/90"
        >
          Save Current Plan
        </Button>
      </div>

      {savedPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPlans.map((plan) => (
            <Card key={plan.id} className="holographic-card overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex justify-between items-center">
                  <span>{plan.name}</span>
                  <span className="text-quantum-purple">
                    {plan.meal_plan.totalCalories} kcal
                  </span>
                </CardTitle>
                <CardDescription>
                  Created {new Date(plan.date_created).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-900/30 p-2 rounded">
                      <div className="text-xs">Protein</div>
                      <div className="font-semibold">{plan.meal_plan.targetProtein}g</div>
                    </div>
                    <div className="bg-green-900/30 p-2 rounded">
                      <div className="text-xs">Carbs</div>
                      <div className="font-semibold">{plan.meal_plan.targetCarbs}g</div>
                    </div>
                    <div className="bg-yellow-900/30 p-2 rounded">
                      <div className="text-xs">Fats</div>
                      <div className="font-semibold">{plan.meal_plan.targetFat}g</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-blue-900/20 rounded">
                    <Droplets className="h-5 w-5 text-blue-400" />
                    <div className="text-sm">
                      Water: {plan.meal_plan.hydrationTarget} ml
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={() => loadPlan(plan)}
                      className="bg-quantum-cyan hover:bg-quantum-cyan/90"
                    >
                      Load Plan
                    </Button>
                    <Button 
                      onClick={() => handleDeletePlan(plan.id)}
                      variant="destructive"
                    >
                      Delete Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="pt-6 text-center">
            <p>No saved meal plans found. Create and save a meal plan to see it here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SavedMealPlans;
