
import { supabase } from '@/integrations/supabase/client';
import { WorkoutRecommendation } from '@/types/fitness/recommendations';

/**
 * Generate workout recommendations based on user history and preferences
 */
export const generateWorkoutRecommendations = async (
  userId: string // UUID from auth
): Promise<WorkoutRecommendation[]> => {
  try {
    // Get user's recent workout history
    const { data: recentWorkouts, error: workoutError } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId) // Use UUID string
      .order('date', { ascending: false })
      .limit(10);
      
    if (workoutError) throw workoutError;
    
    // Get user's workout preferences
    const { data: preferences, error: prefError } = await supabase
      .from('user_workout_preferences')
      .select('*')
      .eq('user_id', userId) // Use UUID string
      .single();
      
    if (prefError && prefError.code !== 'PGRST116') throw prefError;
    
    // Get existing recommendations to avoid duplicates
    const { data: existingRecommendations, error: recError } = await supabase
      .from('workout_recommendations')
      .select('type, metadata')
      .eq('user_id', userId) // Use UUID string
      .eq('dismissed', false)
      .eq('applied', false);
      
    if (recError) throw recError;
    
    const recommendations: Partial<WorkoutRecommendation>[] = [];
    const existingTypes = existingRecommendations?.map(r => r.type) || [];
    
    // Analyze workout frequency
    if (recentWorkouts && recentWorkouts.length < 2 && !existingTypes.includes('workout_plan')) {
      recommendations.push({
        user_id: userId,
        title: 'Start Your Fitness Journey',
        description: 'Based on your activity, we recommend starting with a beginner workout plan.',
        type: 'workout_plan',
        reason: 'Low workout frequency detected',
        confidence_score: 0.8,
        metadata: {
          suggested_frequency: 3,
          difficulty: 'beginner',
          duration: 30
        }
      });
    }
    
    // Analyze workout variety
    const workoutTypes = new Set(recentWorkouts?.map(w => w.workout_plan_id) || []);
    if (workoutTypes.size === 1 && recentWorkouts && recentWorkouts.length > 3 && !existingTypes.includes('exercise_variation')) {
      recommendations.push({
        user_id: userId,
        title: 'Mix Up Your Routine',
        description: 'Adding variety to your workouts can help prevent plateaus and keep you motivated.',
        type: 'exercise_variation',
        reason: 'Limited workout variety detected',
        confidence_score: 0.7,
        metadata: {
          current_routine: Array.from(workoutTypes)[0],
          suggested_alternatives: ['strength_training', 'cardio', 'flexibility']
        }
      });
    }
    
    // Analyze workout intensity progression
    if (recentWorkouts && recentWorkouts.length >= 5) {
      const recentDurations = recentWorkouts.slice(0, 5).map(w => w.duration || 0);
      const avgDuration = recentDurations.reduce((a, b) => a + b, 0) / recentDurations.length;
      
      if (avgDuration < 20 && !existingTypes.includes('difficulty_adjustment')) {
        recommendations.push({
          user_id: userId,
          title: 'Ready to Level Up?',
          description: 'Your consistency is great! Consider increasing workout duration or intensity.',
          type: 'difficulty_adjustment',
          reason: 'Consistent short workouts indicate readiness for progression',
          confidence_score: 0.6,
          metadata: {
            current_avg_duration: avgDuration,
            suggested_duration: Math.min(avgDuration + 10, 45),
            progression_type: 'duration'
          }
        });
      }
    }
    
    // Recovery recommendations
    if (recentWorkouts && recentWorkouts.length >= 3) {
      const lastThreeWorkouts = recentWorkouts.slice(0, 3);
      const consecutiveDays = lastThreeWorkouts.every((workout, index) => {
        if (index === 0) return true;
        const currentDate = new Date(workout.date);
        const previousDate = new Date(lastThreeWorkouts[index - 1].date);
        const diffDays = Math.abs(currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 1;
      });
      
      if (consecutiveDays && !existingTypes.includes('recovery')) {
        recommendations.push({
          user_id: userId,
          title: 'Consider a Rest Day',
          description: 'Recovery is important for muscle growth and preventing injury.',
          type: 'recovery',
          reason: 'Multiple consecutive workout days detected',
          confidence_score: 0.9,
          metadata: {
            consecutive_days: 3,
            recovery_strategies: ['light_stretching', 'walk', 'rest_day']
          }
        });
      }
    }
    
    // Save recommendations to database
    if (recommendations.length > 0) {
      const recommendationsToInsert = recommendations.map(rec => ({
        ...rec,
        suggested_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        applied: false,
        dismissed: false
      }));
      
      const { data, error } = await supabase
        .from('workout_recommendations')
        .insert(recommendationsToInsert)
        .select();
        
      if (error) throw error;
      
      return data as WorkoutRecommendation[];
    }
    
    return [];
  } catch (error) {
    console.error('Error generating workout recommendations:', error);
    return [];
  }
};

/**
 * Apply a workout recommendation
 */
export const applyWorkoutRecommendation = async (
  recommendationId: string,
  userId: string // UUID from auth
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('workout_recommendations')
      .update({ 
        applied: true,
        applied_at: new Date().toISOString()
      })
      .eq('id', recommendationId)
      .eq('user_id', userId); // Use UUID string
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error applying recommendation:', error);
    return { success: false, error };
  }
};

/**
 * Dismiss a workout recommendation
 */
export const dismissWorkoutRecommendation = async (
  recommendationId: string,
  userId: string // UUID from auth
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('workout_recommendations')
      .update({ 
        dismissed: true,
        dismissed_at: new Date().toISOString()
      })
      .eq('id', recommendationId)
      .eq('user_id', userId); // Use UUID string
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error dismissing recommendation:', error);
    return { success: false, error };
  }
};

/**
 * Get active recommendations for a user
 */
export const getActiveRecommendations = async (
  userId: string // UUID from auth
): Promise<WorkoutRecommendation[]> => {
  try {
    const { data, error } = await supabase
      .from('workout_recommendations')
      .select('*')
      .eq('user_id', userId) // Use UUID string
      .eq('applied', false)
      .eq('dismissed', false)
      .gt('expires_at', new Date().toISOString())
      .order('confidence_score', { ascending: false });
      
    if (error) throw error;
    
    return (data as WorkoutRecommendation[]) || [];
  } catch (error) {
    console.error('Error fetching active recommendations:', error);
    return [];
  }
};
