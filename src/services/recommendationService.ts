
import { supabase } from '@/integrations/supabase/client';
import { WorkoutRecommendation } from '@/types/fitness';

/**
 * Gets workout recommendations for a user
 */
export const getUserRecommendations = async (userId: string): Promise<{ 
  data: WorkoutRecommendation[] | null;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('workout_recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('dismissed', false)
      .order('confidence_score', { ascending: false });
    
    if (error) throw error;
    
    if (!data) return { data: null, error: null };
    
    // Convert database records to WorkoutRecommendation objects
    const recommendations: WorkoutRecommendation[] = data.map(rec => ({
      id: rec.id,
      name: rec.title || 'Workout Recommendation',
      title: rec.title,
      description: rec.description,
      type: rec.type || 'general',
      difficulty: 'intermediate', // Default
      target_goal: rec.reason || 'general fitness',
      workout_days: [],
      equipment_needed: [],
      duration_estimate: '30-45 minutes',
      reason: rec.reason,
      confidence_score: rec.confidence_score,
      dismissed: rec.dismissed,
      applied: rec.applied,
      applied_at: rec.applied_at,
      user_id: rec.user_id
    }));
    
    return { data: recommendations, error: null };
  } catch (error) {
    console.error('Error fetching workout recommendations:', error);
    return { data: null, error };
  }
};

/**
 * Dismisses a workout recommendation
 */
export const dismissRecommendation = async (recommendationId: string, userId: string): Promise<{ 
  success: boolean;
  error?: string;
}> => {
  try {
    const { error } = await supabase
      .from('workout_recommendations')
      .update({ dismissed: true })
      .eq('id', recommendationId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error dismissing recommendation:', error);
    return { 
      success: false,
      error: error.message 
    };
  }
};

/**
 * Marks a recommendation as applied
 */
export const applyRecommendation = async (recommendationId: string, userId: string): Promise<{ 
  success: boolean;
  error?: string;
}> => {
  try {
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from('workout_recommendations')
      .update({
        applied: true,
        applied_at: now
      })
      .eq('id', recommendationId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error applying recommendation:', error);
    return { 
      success: false,
      error: error.message 
    };
  }
};

/**
 * Creates a new recommendation (typically called by the backend)
 */
export const createRecommendation = async (recommendation: Partial<WorkoutRecommendation>): Promise<{
  data: WorkoutRecommendation | null;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('workout_recommendations')
      .insert({
        user_id: recommendation.user_id,
        title: recommendation.title || recommendation.name,
        description: recommendation.description,
        type: recommendation.type,
        reason: recommendation.reason,
        confidence_score: recommendation.confidence_score || 0.5,
        suggested_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Convert to WorkoutRecommendation
    const typedData: WorkoutRecommendation = {
      id: data.id,
      name: data.title || 'Workout Recommendation',
      title: data.title,
      description: data.description,
      difficulty: 'intermediate', // Default
      target_goal: data.reason || 'general fitness',
      workout_days: [],
      type: data.type || 'general',
      equipment_needed: [],
      duration_estimate: '30-45 minutes',
      reason: data.reason,
      confidence_score: data.confidence_score,
      dismissed: data.dismissed,
      applied: data.applied,
      applied_at: data.applied_at,
      user_id: data.user_id
    };
    
    return { data: typedData, error: null };
  } catch (error) {
    console.error('Error creating recommendation:', error);
    return { data: null, error };
  }
};
