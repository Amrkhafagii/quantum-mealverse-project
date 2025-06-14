import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getUserSavedMealPlans, renewMealPlan, deleteSavedMealPlan } from '@/services/mealPlan';
import { SavedMealPlan } from '@/types/fitness/nutrition';
import PlanGrid from './PlanGrid';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import SaveCurrentPlanButton from './SaveCurrentPlanButton';

interface SavedMealPlansProps {
  userId?: string;
}

const SavedMealPlans: React.FC<SavedMealPlansProps> = ({ userId }) => {
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
      const { data, error } = await getUserSavedMealPlans(userId);
      
      if (error) throw error;
      
      if (data) {
        setSavedPlans(data);
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
      const { success, error } = await deleteSavedMealPlan(planId, userId);
      
      if (!success) throw error;
      
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
                is_active: true
              } 
            : plan
        ));
        toast.success('Meal plan renewed successfully.');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error renewing meal plan:', error);
      toast.error('Failed to renew the meal plan.');
    }
  };

  const loadPlan = (plan: SavedMealPlan) => {
    try {
      // Store the plan in session storage - using meal_plan instead of meal_plan_data
      sessionStorage.setItem('currentMealPlan', JSON.stringify(plan.meal_plan));
      
      // Redirect to the fitness page
      window.location.href = '/fitness';
      
      toast.success('Your saved meal plan has been loaded.');
    } catch (error) {
      console.error('Error loading plan:', error);
      toast.error('Failed to load meal plan.');
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-quantum-cyan">Your Saved Meal Plans</h2>
        <SaveCurrentPlanButton userId={userId} onPlanSaved={loadSavedMealPlans} />
      </div>

      {savedPlans.length > 0 ? (
        <PlanGrid 
          savedPlans={savedPlans}
          onLoadPlan={loadPlan}
          onRenewPlan={handleRenewPlan}
          onDeletePlan={handleDeletePlan}
        />
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

export default SavedMealPlans;
