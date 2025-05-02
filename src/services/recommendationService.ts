
import { supabase } from '@/integrations/supabase/client';
import { WorkoutRecommendation, UserProfile, UserWorkoutStats, WorkoutHistoryItem } from '@/types/fitness';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get workout recommendations for a user
 */
export async function getWorkoutRecommendations(userId: string): Promise<{ data: WorkoutRecommendation[] | null, error: any }> {
  try {
    const { data, error } = await supabase
      .from('workout_recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('dismissed', false);

    if (error) throw error;
      
    if (!data) return { data: null, error: null };
    
    // Transform data to match WorkoutRecommendation interface
    const enhancedRecommendations: WorkoutRecommendation[] = data.map(rec => ({
      id: rec.id,
      name: rec.title || 'Workout Recommendation',
      description: rec.description || '',
      difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
      target_goal: rec.type || 'fitness',
      workout_days: [],
      duration_estimate: '30-45 minutes',
      equipment_needed: [],
      dismissed: rec.dismissed || false,
      applied: rec.applied || false,
      applied_at: rec.applied_at,
      type: rec.type,
      title: rec.title,
      confidence_score: rec.confidence_score,
      reason: rec.reason,
      user_id: rec.user_id
    }));
    
    return { data: enhancedRecommendations, error: null };
  } catch (error) {
    console.error('Error fetching workout recommendations:', error);
    return { data: null, error };
  }
}

// Alias for backwards compatibility
export const getUserRecommendations = getWorkoutRecommendations;

/**
 * Get a single workout recommendation by ID
 */
export async function getWorkoutRecommendationById(recommendationId: string) {
  try {
    const { data, error } = await supabase
      .from('workout_recommendations')
      .select('*')
      .eq('id', recommendationId)
      .single();
      
    return { data, error };
  } catch (error) {
    console.error('Error fetching workout recommendation:', error);
    return { data: null, error };
  }
}

/**
 * Create a recommendation for a user
 */
export async function createRecommendation(recommendation: WorkoutRecommendation, userId: string) {
  try {
    // Add user_id to the recommendation object
    const recWithUserId = {
      ...recommendation,
      user_id: userId
    };
    
    const { data, error } = await supabase
      .from('workout_recommendations')
      .insert(recWithUserId)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating recommendation:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing workout recommendation
 */
export async function updateWorkoutRecommendation(recommendation: WorkoutRecommendation, userId: string) {
  try {
    const { data, error } = await supabase
      .from('workout_recommendations')
      .update(recommendation)
      .eq('id', recommendation.id)
      .eq('user_id', userId) // Ensure user_id is included
      .select()
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating workout recommendation:', error);
    return { data: null, error };
  }
}

/**
 * Delete a workout recommendation
 */
export async function deleteWorkoutRecommendation(recommendationId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('workout_recommendations')
      .delete()
      .eq('id', recommendationId)
      .eq('user_id', userId); // Ensure user_id is included
      
    return { success: !error, error };
  } catch (error) {
    console.error('Error deleting workout recommendation:', error);
    return { success: false, error };
  }
}

/**
 * Dismiss a recommendation
 */
export async function dismissRecommendation(recommendationId: string, userId?: string) {
  try {
    const updateObj: any = { dismissed: true };
    if (userId) updateObj.user_id = userId;
    
    const { data, error } = await supabase
      .from('workout_recommendations')
      .update(updateObj)
      .eq('id', recommendationId)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Error dismissing recommendation:', error);
    return { data: null, error, success: false };
  }
}

/**
 * Apply a workout recommendation
 */
export async function applyRecommendation(recommendationId: string, userId?: string) {
  try {
    const updateObj: any = { 
      applied: true,
      applied_at: new Date().toISOString()
    };
    if (userId) updateObj.user_id = userId;
    
    const { data, error } = await supabase
      .from('workout_recommendations')
      .update(updateObj)
      .eq('id', recommendationId)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Error applying recommendation:', error);
    return { data: null, error, success: false };
  }
}
