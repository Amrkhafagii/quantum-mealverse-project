
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SavedMealPlan {
  id: string;
  name: string;
  meal_plan: any; // JSON data containing the meal plan
  date_created: string;
  saved_meal_plans_user_id: string;
  tdee_id: string;
  expires_at?: string;
  is_active?: boolean;
}

const SavedMealPlans = () => {
  const { user } = useAuth();
  const [savedPlans, setSavedPlans] = useState<SavedMealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedMealPlans();
    }
  }, [user]);

  const fetchSavedMealPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_meal_plans')
        .select('*')
        .eq('saved_meal_plans_user_id', user.id) // Updated field name
        .order('date_created', { ascending: false });

      if (error) throw error;
      setSavedPlans(data || []);
    } catch (error) {
      console.error('Error fetching saved meal plans:', error);
      toast.error('Failed to load saved meal plans');
    } finally {
      setLoading(false);
    }
  };

  const deleteMealPlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('saved_meal_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
      
      setSavedPlans(prev => prev.filter(plan => plan.id !== planId));
      toast.success('Meal plan deleted successfully');
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      toast.error('Failed to delete meal plan');
    }
  };

  const calculateTDEE = async () => {
    if (!user) return;

    try {
      // This would typically use user profile data to calculate TDEE
      const mockTDEEData = {
        user_tdee_user_id: user.id, // Updated field name
        bmr: 1500,
        tdee: 2000,
        activity_level: 'moderate',
        goal: 'maintain',
        protein_target: 150,
        carbs_target: 200,
        fat_target: 67,
        date: new Date().toISOString().split('T')[0]
      };

      const { error } = await supabase
        .from('user_tdee')
        .insert(mockTDEEData);

      if (error) throw error;
      
      toast.success('TDEE calculation saved');
    } catch (error) {
      console.error('Error calculating TDEE:', error);
      toast.error('Failed to calculate TDEE');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading saved meal plans...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Saved Meal Plans</h1>
        <button
          onClick={calculateTDEE}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Calculate TDEE
        </button>
      </div>

      {savedPlans.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No saved meal plans yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Create a meal plan to see it saved here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {new Date(plan.date_created).toLocaleDateString()}
                </span>
                <button
                  onClick={() => deleteMealPlan(plan.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedMealPlans;
