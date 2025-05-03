
import { supabase } from "@/integrations/supabase/client";
import { addDays, isBefore } from "date-fns";
import { SavedMealPlanWithExpiry } from "@/types/webhook";

export const markExpiredMealPlansInactive = async () => {
  try {
    const today = new Date();
    
    // Fetch all active meal plans
    const { data: mealPlans, error } = await supabase
      .from('saved_meal_plans')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    
    if (!mealPlans || mealPlans.length === 0) {
      console.log('No active meal plans found to check for expiration');
      return;
    }
    
    // Check each meal plan and update if expired
    for (const plan of mealPlans as SavedMealPlanWithExpiry[]) {
      // If expires_at exists and is before today
      if (plan.expires_at && isBefore(new Date(plan.expires_at), today)) {
        console.log(`Marking meal plan ${plan.id} as inactive (expired)`);
        
        const { error: updateError } = await supabase
          .from('saved_meal_plans')
          .update({ 
            is_active: false
          })
          .eq('id', plan.id);
        
        if (updateError) {
          console.error('Error updating expired meal plan:', updateError);
        }
      }
    }
    
    console.log('Finished checking for expired meal plans');
  } catch (error) {
    console.error('Error in markExpiredMealPlansInactive:', error);
  }
};

export const generateWeeklyMealPlans = async () => {
  try {
    const today = new Date();
    const expiryDate = addDays(today, 7); // Plans expire in 7 days
    
    // Get all users with fitness profiles
    const { data: users, error } = await supabase
      .from('fitness_profiles')
      .select('user_id')
      .not('user_id', 'is', null);
    
    if (error) throw error;
    
    if (!users || users.length === 0) {
      console.log('No users found to generate meal plans');
      return;
    }
    
    console.log(`Generating weekly meal plans for ${users.length} users`);
    
    for (const user of users) {
      // Check if user already has an active meal plan
      const { data: existingPlans } = await supabase
        .from('saved_meal_plans')
        .select('*')
        .eq('user_id', user.user_id)
        .eq('is_active', true);
      
      if (existingPlans && existingPlans.length > 0) {
        console.log(`User ${user.user_id} already has active meal plans. Skipping.`);
        continue;
      }
      
      // Generate a new default meal plan
      const newPlan = {
        user_id: user.user_id,
        name: `Weekly Plan - ${today.toLocaleDateString()}`,
        date_created: today.toISOString(),
        meal_plan: generateDefaultMealPlan(),
        expires_at: expiryDate.toISOString(),
        is_active: true
      };
      
      const { error: insertError } = await supabase
        .from('saved_meal_plans')
        .insert(newPlan);
      
      if (insertError) {
        console.error(`Error creating meal plan for user ${user.user_id}:`, insertError);
      } else {
        console.log(`Created new meal plan for user ${user.user_id}`);
      }
    }
    
    console.log('Finished generating weekly meal plans');
  } catch (error) {
    console.error('Error in generateWeeklyMealPlans:', error);
  }
};

// Helper function to generate a default meal plan
function generateDefaultMealPlan() {
  // Very simple default meal plan
  return {
    meals: [
      {
        name: "Breakfast",
        time: "08:00",
        foods: [
          { name: "Oatmeal", quantity: 1, calories: 150, protein: 5, carbs: 27, fat: 2.5 },
          { name: "Banana", quantity: 1, calories: 105, protein: 1.3, carbs: 27, fat: 0.3 }
        ]
      },
      {
        name: "Lunch",
        time: "12:00",
        foods: [
          { name: "Chicken Salad", quantity: 1, calories: 350, protein: 25, carbs: 10, fat: 20 }
        ]
      },
      {
        name: "Dinner",
        time: "18:00",
        foods: [
          { name: "Salmon", quantity: 1, calories: 206, protein: 22, carbs: 0, fat: 13 },
          { name: "Brown Rice", quantity: 1, calories: 216, protein: 5, carbs: 45, fat: 1.8 },
          { name: "Steamed Vegetables", quantity: 1, calories: 50, protein: 2, carbs: 10, fat: 0 }
        ]
      }
    ],
    totalCalories: 1077,
    total_protein: 60.3,
    total_carbs: 119,
    total_fat: 37.6
  };
}

// Add the missing functions that are being imported in Nutrition.tsx
export const checkExpiredMealPlans = async () => {
  try {
    await markExpiredMealPlansInactive();
    return { success: true };
  } catch (error) {
    console.error('Error checking expired meal plans:', error);
    return { success: false, error };
  }
};

export const checkSoonToExpirePlans = async (userId: string) => {
  try {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    // Find plans that expire in the next 7 days
    const { data: mealPlans, error } = await supabase
      .from('saved_meal_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .lt('expires_at', nextWeek.toISOString())
      .gt('expires_at', today.toISOString());
    
    if (error) throw error;
    
    return { 
      success: true, 
      expiringSoon: mealPlans ? mealPlans.length : 0 
    };
  } catch (error) {
    console.error('Error checking soon to expire plans:', error);
    return { success: false, error, expiringSoon: 0 };
  }
};
