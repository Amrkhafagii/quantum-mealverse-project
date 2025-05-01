
import { fromTable, supabase } from './supabaseClient';
import { Achievement, UserAchievement, WorkoutLog } from '@/types/fitness';
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
export const checkAchievements = async (userId: string, workoutLog?: WorkoutLog): Promise<void> => {
  try {
    // Get the user's workout history
    const { data: workoutHistory } = await fromTable('workout_history')
      .select('*')
      .eq('user_id', userId);
    
    if (!workoutHistory) return;
    
    const workoutCount = workoutHistory.length;
    
    // Get the user's current streak
    const { data: userStreak } = await fromTable('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('streak_type', 'workout')
      .single();
    
    // First workout achievement
    if (workoutCount === 1) {
      await awardAchievement(userId, '1'); // First workout achievement ID
    }
    
    // 10 workouts achievement
    if (workoutCount === 10) {
      await awardAchievement(userId, '7'); // 10 workouts achievement ID
    }
    
    // 50 workouts achievement
    if (workoutCount === 50) {
      await awardAchievement(userId, '8'); // 50 workouts achievement ID
    }
    
    // Check for streak-based achievements
    if (userStreak) {
      // Week streak achievement - 7 days
      if (userStreak.currentstreak >= 7) {
        await awardAchievement(userId, '9'); // Week streak achievement ID
      }
      
      // Month streak achievement - 30 days
      if (userStreak.currentstreak >= 30) {
        await awardAchievement(userId, '6'); // Month streak achievement ID
      }
    }
    
    // If we have a specific workout log, check for workout-specific achievements
    if (workoutLog) {
      // Long workout achievement (60+ minutes)
      if (workoutLog.duration >= 60) {
        await awardAchievement(userId, '10'); // Long workout achievement ID
      }
      
      // High intensity workout (500+ calories)
      if (workoutLog.calories_burned && workoutLog.calories_burned >= 500) {
        await awardAchievement(userId, '11'); // High intensity workout achievement ID
      }
      
      // Complete workout achievement (all exercises completed)
      const totalExercises = workoutLog.completed_exercises.length;
      const completedSets = workoutLog.completed_exercises.reduce(
        (total, exercise) => total + getCompletedSetsCount(exercise.sets_completed), 0
      );
      
      if (completedSets >= 20) {
        await awardAchievement(userId, '12'); // 20+ sets in one workout achievement ID
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
};

/**
 * Helper function to safely get the count of completed sets, handling both number and array types
 */
function getCompletedSetsCount(sets: number | { set_number: number; weight: number; reps: number; }[]): number {
  if (typeof sets === 'number') {
    return sets;
  }
  return sets.length;
}

// Helper function to check and update streak after a workout is logged
export const updateWorkoutStreak = async (userId: string, workoutDate: string): Promise<void> => {
  try {
    // Get the user's current streak
    const { data, error } = await fromTable('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('streak_type', 'workout')
      .maybeSingle();
    
    if (error) throw error;
    
    const today = new Date(workoutDate);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format dates for comparison (YYYY-MM-DD)
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (!data) {
      // Create a new streak record
      const { error: insertError } = await fromTable('user_streaks').insert({
        user_id: userId,
        currentstreak: 1,
        longeststreak: 1,
        last_activity_date: todayStr,
        streak_type: 'workout'
      });
      
      if (insertError) throw insertError;
    } else {
      const lastActivityDate = data.last_activity_date.split('T')[0];
      
      // Check if the workout was done today (don't increment)
      if (lastActivityDate === todayStr) {
        return;
      }
      
      let newCurrentStreak = data.currentstreak;
      let newLongestStreak = data.longeststreak;
      
      // If workout was yesterday, increment streak
      if (lastActivityDate === yesterdayStr) {
        newCurrentStreak += 1;
        
        // Update longest streak if needed
        if (newCurrentStreak > newLongestStreak) {
          newLongestStreak = newCurrentStreak;
        }
      } else {
        // Streak broken, start a new one
        newCurrentStreak = 1;
      }
      
      // Update the streak
      const { error: updateError } = await fromTable('user_streaks').update({
        currentstreak: newCurrentStreak,
        longeststreak: newLongestStreak,
        last_activity_date: todayStr
      }).eq('id', data.id);
      
      if (updateError) throw updateError;
    }
  } catch (error) {
    console.error('Error updating workout streak:', error);
  }
};

