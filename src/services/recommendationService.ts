
import { supabase } from '@/integrations/supabase/client';
import { WorkoutRecommendation } from '@/types/fitness/recommendations';

/**
 * Gets personalized workout recommendations for a user
 */
export const getWorkoutRecommendations = async (userId: string): Promise<{
  data: WorkoutRecommendation[] | null;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('workout_recommendations')
      .select('*')
      .eq('workout_recommendations_user_id', userId)
      .eq('dismissed', false)
      .order('suggested_at', { ascending: false });
      
    if (error) throw error;
    
    // Transform the data to match our types
    const transformedData = data?.map(item => ({
      id: item.id,
      user_id: item.workout_recommendations_user_id,
      title: item.title || 'Workout Recommendation',
      description: item.description || '',
      type: item.type || 'general',
      reason: item.reason || 'Based on your fitness profile',
      confidence_score: item.confidence_score || 0.75,
      metadata: item.metadata || {},
      suggested_at: item.suggested_at || new Date().toISOString(),
      applied: item.applied || false,
      applied_at: item.applied_at || '',
      dismissed: item.dismissed || false,
      dismissed_at: item.dismissed_at || '',
      expires_at: item.expires_at || '',
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
      // Legacy compatibility
      difficulty: 'beginner' as const,
      duration_minutes: 30,
      target_muscle_groups: ['full body'],
      recommended_frequency: 3
    })) as WorkoutRecommendation[];
    
    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error fetching workout recommendations:', error);
    return { data: null, error };
  }
};

/**
 * Gets trending workout recommendations
 */
export const getTrendingWorkoutRecommendations = async (): Promise<{
  data: WorkoutRecommendation[] | null;
  error: any;
}> => {
  try {
    // In a real app, this would be based on popularity metrics
    const { data, error } = await supabase
      .from('workout_recommendations')
      .select('*')
      .eq('dismissed', false)
      .order('confidence_score', { ascending: false })
      .limit(10);
      
    if (error) throw error;
    
    // Transform the data to match our types
    const transformedData = data?.map(item => ({
      id: item.id,
      user_id: item.workout_recommendations_user_id,
      title: item.title || 'Trending Workout',
      description: item.description || '',
      type: item.type || 'general',
      reason: item.reason || 'Popular with other users',
      confidence_score: item.confidence_score || 0.75,
      metadata: item.metadata || {},
      suggested_at: item.suggested_at || new Date().toISOString(),
      applied: item.applied || false,
      applied_at: item.applied_at || '',
      dismissed: item.dismissed || false,
      dismissed_at: item.dismissed_at || '',
      expires_at: item.expires_at || '',
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
      // Legacy compatibility
      difficulty: 'beginner' as const,
      duration_minutes: 30,
      target_muscle_groups: ['full body'],
      recommended_frequency: 3
    })) as WorkoutRecommendation[];
    
    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error fetching trending workout recommendations:', error);
    return { data: null, error };
  }
};

/**
 * Dismisses a workout recommendation
 */
export const dismissWorkoutRecommendation = async (
  recommendationId: string,
  userId: string
): Promise<{
  success: boolean;
  error: any;
}> => {
  try {
    const { error } = await supabase
      .from('workout_recommendations')
      .update({ dismissed: true })
      .eq('id', recommendationId)
      .eq('workout_recommendations_user_id', userId);
      
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error dismissing workout recommendation:', error);
    return { success: false, error };
  }
};

/**
 * Applies a workout recommendation
 */
export const applyWorkoutRecommendation = async (
  recommendationId: string,
  userId: string
): Promise<{
  success: boolean;
  error: any;
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
      .eq('workout_recommendations_user_id', userId);
      
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error applying workout recommendation:', error);
    return { success: false, error };
  }
};

/**
 * Create a workout recommendation
 */
export const createWorkoutRecommendation = async (
  userId: string,
  recommendation: Partial<WorkoutRecommendation>
): Promise<{
  data: WorkoutRecommendation | null;
  error: any;
}> => {
  try {
    const now = new Date().toISOString();
    
    const newRecommendation = {
      id: crypto.randomUUID(),
      workout_recommendations_user_id: userId,
      title: recommendation.title || 'Workout Recommendation',
      description: recommendation.description || '',
      type: recommendation.type || 'general',
      suggested_at: now,
      reason: recommendation.reason || 'Based on your fitness profile',
      confidence_score: recommendation.confidence_score || 0.75,
      applied: false,
      dismissed: false,
    };
    
    const { data, error } = await supabase
      .from('workout_recommendations')
      .insert([newRecommendation])
      .select();
      
    if (error) throw error;
    
    // Transform result to match interface
    const result = {
      id: data[0].id,
      user_id: data[0].workout_recommendations_user_id,
      title: data[0].title,
      description: data[0].description || '',
      type: data[0].type,
      reason: data[0].reason || '',
      confidence_score: data[0].confidence_score || 0.75,
      metadata: data[0].metadata || {},
      suggested_at: data[0].suggested_at,
      applied: data[0].applied,
      applied_at: data[0].applied_at || '',
      dismissed: data[0].dismissed,
      dismissed_at: data[0].dismissed_at || '',
      expires_at: data[0].expires_at || '',
      created_at: data[0].created_at,
      updated_at: data[0].updated_at,
      // Legacy compatibility
      difficulty: 'beginner' as const,
      duration_minutes: 30,
      target_muscle_groups: ['full body'],
      recommended_frequency: 3
    } as WorkoutRecommendation;
    
    return { data: result, error: null };
  } catch (error) {
    console.error('Error creating workout recommendation:', error);
    return { data: null, error };
  }
};

/**
 * Get workout recommendations for a user
 */
export const getUserRecommendations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('workout_recommendations')
      .select('*')
      .eq('workout_recommendations_user_id', userId)
      .eq('dismissed', false)
      .order('suggested_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data?.map(item => ({
      id: item.id,
      user_id: item.workout_recommendations_user_id,
      title: item.title || 'Workout Recommendation',
      description: item.description || '',
      type: item.type || 'general',
      reason: item.reason || 'Based on your fitness profile',
      confidence_score: item.confidence_score || 0.75,
      metadata: item.metadata || {},
      suggested_at: item.suggested_at || new Date().toISOString(),
      applied: item.applied || false,
      applied_at: item.applied_at || '',
      dismissed: item.dismissed || false,
      dismissed_at: item.dismissed_at || '',
      expires_at: item.expires_at || '',
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
      // Legacy compatibility
      difficulty: 'beginner' as const,
      duration_minutes: 30,
      target_muscle_groups: ['full body'],
      recommended_frequency: 3
    })) || [];
  } catch (error) {
    console.error('Error fetching workout recommendations:', error);
    return [];
  }
};

/**
 * Apply a workout recommendation
 */
export const applyRecommendation = async (recommendationId: string, userId: string) => {
  try {
    // First, get the recommendation details
    const { data: recommendation, error: fetchError } = await supabase
      .from('workout_recommendations')
      .select('*')
      .eq('id', recommendationId)
      .single();

    if (fetchError || !recommendation) {
      throw fetchError || new Error('Recommendation not found');
    }

    // Mark as applied
    const { error: updateError } = await supabase
      .from('workout_recommendations')
      .update({ applied: true, applied_at: new Date().toISOString() })
      .eq('id', recommendationId);

    if (updateError) {
      throw updateError;
    }

    return { success: true, recommendation };
  } catch (error) {
    console.error('Error applying recommendation:', error);
    return { success: false, error };
  }
};

// Alias for backward compatibility
export const dismissRecommendation = dismissWorkoutRecommendation;
