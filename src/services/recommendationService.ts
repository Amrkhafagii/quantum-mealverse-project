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
      
    return { data, error };
  } catch (error) {
    console.error('Error fetching workout recommendations:', error);
    return { data: null, error };
  }
}

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

export async function dismissRecommendation(recommendationId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('workout_recommendations')
      .update({ 
        dismissed: true,
        user_id: userId // Ensure user_id is included
      })
      .eq('id', recommendationId)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error dismissing recommendation:', error);
    return { data: null, error };
  }
}

/**
 * Apply a workout recommendation
 */
export async function applyRecommendation(recommendationId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('workout_recommendations')
      .update({ 
        applied: true,
        applied_at: new Date().toISOString(),
        user_id: userId // Ensure user_id is included
      })
      .eq('id', recommendationId)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error applying recommendation:', error);
    return { data: null, error };
  }
}
