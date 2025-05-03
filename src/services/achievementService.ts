
import { supabase } from '@/integrations/supabase/client';
import { Achievement, UserAchievement, WorkoutLog } from '@/types/fitness';
import { useToast } from '@/hooks/use-toast';

/**
 * Fetches all achievements from the database
 */
export const getAchievements = async () => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('points', { ascending: true });
      
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return { data: null, error };
  }
};

/**
 * Fetches achievements earned by a specific user
 */
export const getUserAchievements = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return { data: null, error };
  }
};

/**
 * Grants an achievement to a user
 */
export const grantAchievement = async (userId: string, achievementId: string) => {
  try {
    // First check if the user already has this achievement
    const { data: existingAchievement, error: checkError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .maybeSingle();
      
    if (checkError) {
      throw checkError;
    }
    
    // If they already have it, don't grant it again
    if (existingAchievement) {
      return { success: false, alreadyGranted: true };
    }
    
    // Add the achievement
    const { data, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        date_achieved: new Date().toISOString()
      })
      .select();
      
    if (error) {
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error granting achievement:', error);
    return { success: false, error };
  }
};

/**
 * Checks if user qualifies for any achievements based on their stats
 */
export const checkAchievementProgress = async (userId: string) => {
  try {
    // Get workout stats for the user
    const { data: stats, error: statsError } = await supabase
      .from('user_workout_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (statsError && statsError.code !== 'PGRST116') {
      throw statsError;
    }
    
    // No stats found
    if (!stats) return { checked: true, granted: 0 };
    
    // Get all achievements
    const { data: achievements } = await getAchievements();
    if (!achievements) return { checked: true, granted: 0 };
    
    // Check each achievement criteria against user stats
    let achievementsGranted = 0;
    
    for (const achievement of achievements) {
      let shouldGrant = false;
      
      switch (achievement.id) {
        case '1': // First Workout
          shouldGrant = stats.total_workouts >= 1;
          break;
          
        case '7': // Dedicated Athlete (10 workouts)
          shouldGrant = stats.total_workouts >= 10;
          break;
          
        case '8': // Fitness Enthusiast (50 workouts)
          shouldGrant = stats.total_workouts >= 50;
          break;
          
        case '9': // Weekly Warrior (7 day streak)
          shouldGrant = (stats.streak || stats.streak_days || 0) >= 7;
          break;
          
        case '6': // Month Streak (30 day streak)
          shouldGrant = (stats.streak || stats.streak_days || 0) >= 30;
          break;
          
        // Add other achievement criteria checks here
      }
      
      if (shouldGrant) {
        const { success, alreadyGranted } = await grantAchievement(userId, achievement.id);
        if (success) achievementsGranted++;
      }
    }
    
    return { checked: true, granted: achievementsGranted };
  } catch (error) {
    console.error('Error checking achievements:', error);
    return { checked: false, error };
  }
};

/**
 * Check and update user workout streak
 */
export const updateWorkoutStreak = async (userId: string, workoutDate: string) => {
  try {
    // Get user's current streak data
    const { data: streakData, error: streakError } = await supabase
      .from('user_workout_stats')
      .select('streak_days, last_workout_date')
      .eq('user_id', userId)
      .single();

    if (streakError && streakError.code !== 'PGRST116') {
      throw streakError;
    }

    // Calculate if this workout continues the streak
    let newStreak = 1;
    const currentDate = new Date(workoutDate);
    
    if (streakData) {
      const lastWorkoutDate = streakData.last_workout_date ? new Date(streakData.last_workout_date) : null;
      
      if (lastWorkoutDate) {
        // Calculate days between workouts
        const timeDiff = currentDate.getTime() - lastWorkoutDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        // If worked out yesterday, increase streak
        if (daysDiff <= 1) {
          newStreak = (streakData.streak_days || 0) + 1;
        }
        // If more than a day has passed, reset streak
      }
    }
    
    // Update the streak in the database
    const { data, error } = await supabase
      .from('user_workout_stats')
      .upsert({
        user_id: userId,
        streak_days: newStreak,
        last_workout_date: currentDate.toISOString()
      })
      .select();
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error updating workout streak:', error);
    return { success: false, error };
  }
};

/**
 * Check for achievements after a workout
 */
export const checkAchievements = async (userId: string, workoutLog: WorkoutLog) => {
  try {
    // First update the workout streak
    await updateWorkoutStreak(userId, workoutLog.date);
    
    // Then check for achievements
    const result = await checkAchievementProgress(userId);
    
    return result;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return { checked: false, error };
  }
};
