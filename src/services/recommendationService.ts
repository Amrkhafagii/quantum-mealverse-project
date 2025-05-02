
import { supabase } from '@/integrations/supabase/client';
import { WorkoutRecommendation } from '@/types/fitness';

/**
 * Get workout recommendations for a user
 */
export const getUserRecommendations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('workout_recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('confidence_score', { ascending: false })
      .returns<WorkoutRecommendation[]>();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting workout recommendations:', error);
    return { data: null, error };
  }
};

/**
 * Dismiss a workout recommendation
 */
export const dismissRecommendation = async (recommendationId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('workout_recommendations')
      .update({
        dismissed: true
      })
      .eq('id', recommendationId)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error dismissing recommendation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Apply a workout recommendation
 */
export const applyRecommendation = async (recommendationId: string, userId: string) => {
  try {
    const now = new Date();
    
    // Mark the recommendation as applied
    const { error } = await supabase
      .from('workout_recommendations')
      .update({
        applied: true,
        applied_at: now.toISOString()
      })
      .eq('id', recommendationId)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error applying recommendation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate workout recommendations based on user activity
 */
export const generateWorkoutRecommendations = async (userId: string) => {
  try {
    // Get user profile and measurements
    const { data: profileData, error: profileError } = await supabase
      .from('fitness_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (profileError && profileError.code !== 'PGRST116') throw profileError;
    
    // Get workout history
    const { data: historyData, error: historyError } = await supabase
      .from('workout_history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10);
      
    if (historyError) throw historyError;
    
    // Generate recommendations based on profile and history
    const recommendations: Partial<WorkoutRecommendation>[] = [];
    
    if (profileData) {
      // If user has a fitness goal, recommend workouts aligned with that goal
      if (profileData.fitness_goals && profileData.fitness_goals.includes('strength')) {
        recommendations.push({
          title: 'Strength Building Program',
          name: 'Strength Building Program', // Added for compatibility
          description: 'A 4-week program focused on building strength and muscle mass.',
          type: 'program',
          reason: 'Based on your fitness goals',
          confidence_score: 0.85
        });
      }
      
      if (profileData.fitness_goals && profileData.fitness_goals.includes('endurance')) {
        recommendations.push({
          title: 'Endurance Training Plan',
          name: 'Endurance Training Plan', // Added for compatibility
          description: 'Build your cardiovascular endurance with this progressive plan.',
          type: 'program',
          reason: 'Based on your fitness goals',
          confidence_score: 0.8
        });
      }
    }
    
    // If user has workout history, recommend based on patterns
    if (historyData && historyData.length > 0) {
      // Recommend trying a different workout type
      const workoutTypes = new Set(historyData.map(h => h.workout_plan_name));
      
      if (!workoutTypes.has('Full Body')) {
        recommendations.push({
          title: 'Full Body Workout',
          name: 'Full Body Workout', // Added for compatibility
          description: 'Try this full body workout to target all major muscle groups.',
          type: 'workout',
          reason: 'Add variety to your routine',
          confidence_score: 0.75
        });
      }
    }
    
    // Check if user already has these recommendations
    const { data: existingRecs, error: recsError } = await supabase
      .from('workout_recommendations')
      .select('title, name')
      .eq('user_id', userId)
      .in('title', recommendations.map(r => r.title));
      
    if (recsError) throw recsError;
    
    // Filter out recommendations that already exist
    const existingTitles = new Set(existingRecs?.map(r => r.title || r.name) || []);
    const newRecommendations = recommendations.filter(r => !existingTitles.has(r.title || ''));
    
    // Insert new recommendations
    if (newRecommendations.length > 0) {
      const recsToInsert = newRecommendations.map(rec => ({
        id: crypto.randomUUID(),
        user_id: userId,
        title: rec.title,
        name: rec.title, // Add name for compatibility
        description: rec.description,
        type: rec.type,
        reason: rec.reason,
        confidence_score: rec.confidence_score,
        suggested_at: new Date().toISOString(),
        applied: false,
        dismissed: false
      }));
      
      const { error: insertError } = await supabase
        .from('workout_recommendations')
        .insert(recsToInsert);
        
      if (insertError) throw insertError;
    }
    
    return { 
      success: true, 
      count: newRecommendations.length,
      error: null
    };
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    return { 
      success: false, 
      count: 0,
      error: error.message
    };
  }
};
