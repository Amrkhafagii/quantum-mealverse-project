
import { fromTable, supabase } from './supabaseClient';
import { Achievement, UserAchievement } from '@/types/fitness';
import { useToast } from '@/hooks/use-toast';

/**
 * Gets all available achievements
 */
export const getAchievements = async (): Promise<{ data: Achievement[] | null, error: any }> => {
  try {
    const { data, error } = await fromTable('achievements')
      .select('*');
    
    if (error) throw error;
    
    return { data: data as Achievement[], error: null };
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return { data: null, error };
  }
};

/**
 * Gets achievements for a specific user
 */
export const getUserAchievements = async (userId: string): Promise<{ data: UserAchievement[] | null, error: any }> => {
  try {
    const { data, error } = await fromTable('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Transform the data to match our expected format
    const transformedData = data.map(item => ({
      id: item.id,
      user_id: item.user_id,
      achievement_id: item.achievement_id,
      date_achieved: item.date_achieved,
      achievement: item.achievements
    }));
    
    return { data: transformedData as UserAchievement[], error: null };
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return { data: null, error };
  }
};

/**
 * Awards an achievement to a user
 */
export const awardAchievement = async (userId: string, achievementId: string): Promise<{ success: boolean, error: any }> => {
  try {
    // Check if the user already has this achievement
    const { data: existingAchievement, error: checkError } = await fromTable('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    // If the user already has the achievement, do nothing
    if (existingAchievement) {
      return { success: true, error: null };
    }
    
    // Award the achievement
    const { error } = await fromTable('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        date_achieved: new Date().toISOString()
      });
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error awarding achievement:', error);
    return { success: false, error };
  }
};

/**
 * Checks for achievements that can be awarded based on the user's activity
 * This function should be called after key actions like logging a workout
 */
export const checkAchievements = async (userId: string): Promise<void> => {
  try {
    // Get the user's workout history
    const { data: workoutHistory } = await fromTable('workout_history')
      .select('*')
      .eq('user_id', userId);
    
    if (!workoutHistory || workoutHistory.length === 0) return;
    
    // Get the user's current streak
    const { data: userStreak } = await fromTable('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('streak_type', 'workout')
      .single();
    
    // Check for first workout achievement
    if (workoutHistory.length === 1) {
      await awardAchievement(userId, '1'); // First workout achievement ID
    }
    
    // Check for streak-based achievements
    if (userStreak) {
      // Month streak achievement - 30 days
      if (userStreak.currentstreak >= 30) {
        await awardAchievement(userId, '6'); // Month streak achievement ID
      }
    }
    
    // Additional achievement checks can be added here
    
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
};
