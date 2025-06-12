
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Apply a workout recommendation and mark it as applied
 */
export const applyWorkoutRecommendation = async (recommendationId: string, userId: string): Promise<boolean> => {
  try {
    // Mark the recommendation as applied
    const { error: updateError } = await supabase
      .from('workout_recommendations')
      .update({ 
        applied: true,
        applied_at: new Date().toISOString()
      })
      .eq('id', recommendationId);
      
    if (updateError) throw updateError;
    
    // Get the recommendation details
    const { data: recommendation, error: fetchError } = await supabase
      .from('workout_recommendations')
      .select('*')
      .eq('id', recommendationId)
      .single();
      
    if (fetchError) throw fetchError;

    // Create a default workout plan based on the recommendation
    if (recommendation) {
      const defaultPlan = {
        name: recommendation.title || 'Recommended Plan',
        description: recommendation.description || 'Plan created from recommendation',
        goal: recommendation.type || 'fitness',
        user_id: userId, // Now expects UUID string
        difficulty: 'intermediate',
        frequency: 3,
        duration_weeks: 4,
        workout_days: [
          {
            day_name: 'Day 1',
            exercises: [
              {
                name: 'Warm Up',
                target_muscle: 'full body',
                sets: 1,
                reps: '5 minutes',
                rest: 60
              },
              {
                name: 'Main Exercise',
                target_muscle: 'core',
                sets: 3,
                reps: 12,
                rest: 90
              },
              {
                name: 'Cool Down',
                target_muscle: 'full body',
                sets: 1,
                reps: '5 minutes',
                rest: 0
              }
            ]
          }
        ]
      };
      
      // Insert the default plan into the database
      const { error: planError } = await supabase
        .from('workout_plans')
        .insert([{
          ...defaultPlan,
          workout_days: JSON.stringify(defaultPlan.workout_days)
        }]);
        
      if (planError) throw planError;
    }
    
    toast.success("Workout recommendation applied successfully");
    return true;
  } catch (error) {
    console.error('Error applying workout recommendation:', error);
    toast.error("Failed to apply workout recommendation");
    return false;
  }
};
