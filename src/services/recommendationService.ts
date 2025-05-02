import { supabase } from '@/integrations/supabase/client';
import { WorkoutRecommendation } from '@/types/fitness';
import { Json } from '@/types/database';

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
      .eq('user_id', userId)
      .eq('dismissed', false)
      .order('suggested_at', { ascending: false });
      
    if (error) throw error;
    
    // Transform the data to match our types
    // Adding a name field that references title since our components expect it
    const transformedData = data?.map(item => ({
      ...item,
      name: item.title || 'Workout Recommendation'
    }));
    
    return { data: transformedData as WorkoutRecommendation[], error: null };
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
      ...item,
      name: item.title || 'Trending Workout'
    }));
    
    return { data: transformedData as WorkoutRecommendation[], error: null };
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
      .eq('user_id', userId);
      
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
      .eq('user_id', userId);
      
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
      user_id: userId,
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
    
    // Add name for UI compatibility
    const result = {
      ...data[0],
      name: data[0].title || 'Workout Recommendation'
    };
    
    return { data: result as WorkoutRecommendation, error: null };
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
      .eq('user_id', userId)
      .eq('dismissed', false)
      .order('suggested_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data?.map(item => ({
      ...item,
      name: item.title || 'Workout Recommendation' // Ensure name is set from title
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
