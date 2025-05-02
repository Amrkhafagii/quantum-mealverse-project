
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SavedMealPlan } from '@/types/fitness';
import { Droplets, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { TDEEResult } from '@/components/fitness/TDEECalculator';
import { MealPlan } from '@/types/food';
import { getDaysRemaining, renewMealPlan } from '@/services/mealPlanService';
import { Badge } from "@/components/ui/badge";

interface SavedMealPlansProps {
  userId?: string;
}

const SavedMealPlans = ({ userId }: SavedMealPlansProps) => {
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
      
      if (data) {
        // Convert database JSON to our type
        const typedData = data.map(item => ({
          ...item,
          meal_plan: item.meal_plan as unknown as MealPlan,
          expires_at: item.expires_at || null,
          is_active: item.is_active !== false // Default to true if not present
        })) as SavedMealPlan[];
        
        setSavedPlans(typedData);
      } else {
        setSavedPlans([]);
      }
    } catch (error) {
      console.error('Error loading saved meal plans:', error);
      toast.error('Failed to load saved meal plans.');
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
      
      toast.success('Your meal plan has been deleted.');
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      toast.error('Failed to delete meal plan.');
    }
  };

  const handleRenewPlan = async (planId: string) => {
    try {
      const result = await renewMealPlan(planId);
      
      if (result.success) {
        // Update the local state
        setSavedPlans(savedPlans.map(plan => 
          plan.id === planId 
            ? {
                ...plan, 
                expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                is_active: true
              } 
            : plan
        ));
        toast.success('Meal plan renewed for another 2 weeks.');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error renewing meal plan:', error);
      toast.error('Failed to renew the meal plan.');
    }
  };

  // Function to save current meal plan from session storage
  const saveCurrentMealPlan = async () => {
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
      
      // Calculate expiration date (14 days from now)
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      
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
      const { data, error } = await supabase
        .from('saved_meal_plans')
        .insert({
          user_id: userId,
          name: planName,
          date_created: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          is_active: true,
          tdee_id: tdeeData.id,
          meal_plan: JSON.parse(JSON.stringify(mealPlan)), // Convert to plain object
        });
        
      if (error) throw error;
      
      toast.success('Your meal plan has been saved successfully.');
      
      // Refresh the list
      await loadSavedMealPlans();
      
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast.error('Failed to save meal plan.');
    }
  };

  const loadPlan = (plan: SavedMealPlan) => {
    try {
      // Store the plan in session storage
      sessionStorage.setItem('currentMealPlan', JSON.stringify(plan.meal_plan));
      
      // Redirect to the fitness page
      window.location.href = '/fitness';
      
      toast.success('Your saved meal plan has been loaded.');
    } catch (error) {
      console.error('Error loading plan:', error);
      toast.error('Failed to load meal plan.');
    }
  };

  const getStatusBadge = (plan: SavedMealPlan) => {
    if (!plan.expires_at) return null;
    
    const daysRemaining = getDaysRemaining(plan.expires_at);
    
    if (!plan.is_active || daysRemaining <= 0) {
      return <Badge variant="destructive" className="flex gap-1 items-center"><AlertCircle className="h-3.5 w-3.5" /> Expired</Badge>;
    }
    
    if (daysRemaining <= 3) {
      return <Badge variant="warning" className="flex gap-1 items-center bg-amber-500"><Clock className="h-3.5 w-3.5" /> Expires soon</Badge>;
    }
    
    return <Badge variant="success" className="flex gap-1 items-center bg-green-600"><Clock className="h-3.5 w-3.5" /> Active</Badge>;
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
            <Card key={plan.id} className={`holographic-card overflow-hidden ${!plan.is_active || getDaysRemaining(plan.expires_at || '') <= 0 ? 'opacity-70' : ''}`}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex justify-between items-center">
                    <span>{plan.name}</span>
                  </CardTitle>
                  {getStatusBadge(plan)}
                </div>
                <CardDescription className="flex flex-col gap-1">
                  <span>Created {new Date(plan.date_created).toLocaleDateString()}</span>
                  {plan.expires_at && (
                    <span className="flex items-center gap-1">
                      {getDaysRemaining(plan.expires_at) <= 0 
                        ? "Expired" 
                        : `Expires in ${getDaysRemaining(plan.expires_at)} days`}
                    </span>
                  )}
                </CardDescription>
                <div className="text-quantum-purple text-xl font-medium mt-1">
                  {plan.meal_plan.totalCalories} kcal
                </div>
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
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  onClick={() => loadPlan(plan)}
                  className="w-full bg-quantum-cyan hover:bg-quantum-cyan/90"
                  disabled={!plan.is_active && plan.expires_at && getDaysRemaining(plan.expires_at) <= 0}
                >
                  Load Plan
                </Button>
                <div className="flex gap-2 w-full">
                  {plan.expires_at && (
                    <Button 
                      onClick={() => handleRenewPlan(plan.id)}
                      variant="outline"
                      className="flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Renew
                    </Button>
                  )}
                  <Button 
                    onClick={() => handleDeletePlan(plan.id)}
                    variant="destructive"
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </CardFooter>
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
