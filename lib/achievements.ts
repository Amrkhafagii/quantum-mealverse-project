import { supabase, Achievement, WorkoutSession, PersonalRecord } from './supabase';

export interface UserAchievement {
  id: number;
  user_id: string;
  achievement_id: number;
  unlocked_at: string;
  progress?: any;
  achievement: Achievement;
}

export interface AchievementProgress {
  achievement_id: number;
  current_value: number;
  target_value: number;
  percentage: number;
  unlocked: boolean;
  achievement?: Achievement;
}

// Achievement checking functions
const checkWorkoutCountAchievements = async (userId: string, totalWorkouts: number): Promise<Achievement[]> => {
  const unlockedAchievements: Achievement[] = [];
  
  try {
    // Get user's already unlocked achievement IDs
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    if (userAchievementsError) throw userAchievementsError;

    const unlockedIds = userAchievements?.map(ua => ua.achievement_id) || [];

    // Get workout count achievements that user hasn't unlocked yet
    let query = supabase
      .from('achievements')
      .select('*')
      .eq('category', 'workout')
      .eq('is_active', true);

    if (unlockedIds.length > 0) {
      query = query.not('id', 'in', `(${unlockedIds.join(',')})`);
    }

    const { data: achievements, error } = await query;

    if (error) throw error;

    for (const achievement of achievements || []) {
      const criteria = achievement.criteria as any;
      if (criteria.type === 'workout_count' && totalWorkouts >= criteria.target) {
        await unlockAchievement(userId, achievement.id);
        unlockedAchievements.push(achievement);
      }
    }
  } catch (error) {
    console.error('Error checking workout count achievements:', error);
  }

  return unlockedAchievements;
};

const checkStreakAchievements = async (userId: string, currentStreak: number): Promise<Achievement[]> => {
  const unlockedAchievements: Achievement[] = [];
  
  try {
    // Get user's already unlocked achievement IDs
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    if (userAchievementsError) throw userAchievementsError;

    const unlockedIds = userAchievements?.map(ua => ua.achievement_id) || [];

    let query = supabase
      .from('achievements')
      .select('*')
      .eq('category', 'consistency')
      .eq('is_active', true);

    if (unlockedIds.length > 0) {
      query = query.not('id', 'in', `(${unlockedIds.join(',')})`);
    }

    const { data: achievements, error } = await query;

    if (error) throw error;

    for (const achievement of achievements || []) {
      const criteria = achievement.criteria as any;
      if (criteria.type === 'streak' && currentStreak >= criteria.target) {
        await unlockAchievement(userId, achievement.id);
        unlockedAchievements.push(achievement);
      }
    }
  } catch (error) {
    console.error('Error checking streak achievements:', error);
  }

  return unlockedAchievements;
};

const checkWeeklyWorkoutAchievements = async (userId: string): Promise<Achievement[]> => {
  const unlockedAchievements: Achievement[] = [];
  
  try {
    // Get workouts from the last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data: weeklyWorkouts, error: workoutsError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .gte('started_at', weekAgo.toISOString());

    if (workoutsError) throw workoutsError;

    const weeklyWorkoutCount = weeklyWorkouts?.length || 0;

    // Get user's already unlocked achievement IDs
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    if (userAchievementsError) throw userAchievementsError;

    const unlockedIds = userAchievements?.map(ua => ua.achievement_id) || [];

    let query = supabase
      .from('achievements')
      .select('*')
      .eq('category', 'consistency')
      .eq('is_active', true);

    if (unlockedIds.length > 0) {
      query = query.not('id', 'in', `(${unlockedIds.join(',')})`);
    }

    const { data: achievements, error } = await query;

    if (error) throw error;

    for (const achievement of achievements || []) {
      const criteria = achievement.criteria as any;
      if (criteria.type === 'weekly_workouts' && weeklyWorkoutCount >= criteria.target) {
        await unlockAchievement(userId, achievement.id);
        unlockedAchievements.push(achievement);
      }
    }
  } catch (error) {
    console.error('Error checking weekly workout achievements:', error);
  }

  return unlockedAchievements;
};

const checkPersonalRecordAchievements = async (userId: string): Promise<Achievement[]> => {
  const unlockedAchievements: Achievement[] = [];
  
  try {
    // Get total personal records count
    const { data: personalRecords, error: prError } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', userId);

    if (prError) throw prError;

    const totalPRs = personalRecords?.length || 0;

    // Get user's already unlocked achievement IDs
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    if (userAchievementsError) throw userAchievementsError;

    const unlockedIds = userAchievements?.map(ua => ua.achievement_id) || [];

    let query = supabase
      .from('achievements')
      .select('*')
      .eq('category', 'strength')
      .eq('is_active', true);

    if (unlockedIds.length > 0) {
      query = query.not('id', 'in', `(${unlockedIds.join(',')})`);
    }

    const { data: achievements, error } = await query;

    if (error) throw error;

    for (const achievement of achievements || []) {
      const criteria = achievement.criteria as any;
      if (criteria.type === 'personal_records' && totalPRs >= criteria.target) {
        await unlockAchievement(userId, achievement.id);
        unlockedAchievements.push(achievement);
      }
    }
  } catch (error) {
    console.error('Error checking personal record achievements:', error);
  }

  return unlockedAchievements;
};

const checkCardioAchievements = async (userId: string): Promise<Achievement[]> => {
  const unlockedAchievements: Achievement[] = [];
  
  try {
    // Get cardio workouts count
    const { data: cardioWorkouts, error: workoutsError } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        workout:workouts(workout_type)
      `)
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .eq('workout.workout_type', 'cardio');

    if (workoutsError) throw workoutsError;

    const cardioCount = cardioWorkouts?.length || 0;

    // Get user's already unlocked achievement IDs
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    if (userAchievementsError) throw userAchievementsError;

    const unlockedIds = userAchievements?.map(ua => ua.achievement_id) || [];

    let query = supabase
      .from('achievements')
      .select('*')
      .eq('category', 'workout')
      .eq('is_active', true);

    if (unlockedIds.length > 0) {
      query = query.not('id', 'in', `(${unlockedIds.join(',')})`);
    }

    const { data: achievements, error } = await query;

    if (error) throw error;

    for (const achievement of achievements || []) {
      const criteria = achievement.criteria as any;
      if (criteria.type === 'cardio_workouts' && cardioCount >= criteria.target) {
        await unlockAchievement(userId, achievement.id);
        unlockedAchievements.push(achievement);
      }
    }
  } catch (error) {
    console.error('Error checking cardio achievements:', error);
  }

  return unlockedAchievements;
};

const checkMonthlyWorkoutAchievements = async (userId: string): Promise<Achievement[]> => {
  const unlockedAchievements: Achievement[] = [];
  
  try {
    // Get workouts from the last 30 days
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    
    const { data: monthlyWorkouts, error: workoutsError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .gte('started_at', monthAgo.toISOString());

    if (workoutsError) throw workoutsError;

    const monthlyWorkoutCount = monthlyWorkouts?.length || 0;

    // Get user's already unlocked achievement IDs
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    if (userAchievementsError) throw userAchievementsError;

    const unlockedIds = userAchievements?.map(ua => ua.achievement_id) || [];

    let query = supabase
      .from('achievements')
      .select('*')
      .eq('category', 'consistency')
      .eq('is_active', true);

    if (unlockedIds.length > 0) {
      query = query.not('id', 'in', `(${unlockedIds.join(',')})`);
    }

    const { data: achievements, error } = await query;

    if (error) throw error;

    for (const achievement of achievements || []) {
      const criteria = achievement.criteria as any;
      if (criteria.type === 'monthly_workouts' && monthlyWorkoutCount >= criteria.target) {
        await unlockAchievement(userId, achievement.id);
        unlockedAchievements.push(achievement);
      }
    }
  } catch (error) {
    console.error('Error checking monthly workout achievements:', error);
  }

  return unlockedAchievements;
};

// Main achievement checking function
export const checkAllAchievements = async (userId: string): Promise<Achievement[]> => {
  const allUnlockedAchievements: Achievement[] = [];
  
  try {
    // Get user's workout statistics
    const { data: workoutSessions, error: sessionsError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .not('completed_at', 'is', null);

    if (sessionsError) throw sessionsError;

    const totalWorkouts = workoutSessions?.length || 0;

    // Get user's current streak
    const { data: streakData, error: streakError } = await supabase
      .from('workout_streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .single();

    const currentStreak = streakData?.current_streak || 0;

    // Check all achievement types
    const workoutCountAchievements = await checkWorkoutCountAchievements(userId, totalWorkouts);
    const streakAchievements = await checkStreakAchievements(userId, currentStreak);
    const weeklyAchievements = await checkWeeklyWorkoutAchievements(userId);
    const prAchievements = await checkPersonalRecordAchievements(userId);
    const cardioAchievements = await checkCardioAchievements(userId);
    const monthlyAchievements = await checkMonthlyWorkoutAchievements(userId);

    allUnlockedAchievements.push(
      ...workoutCountAchievements,
      ...streakAchievements,
      ...weeklyAchievements,
      ...prAchievements,
      ...cardioAchievements,
      ...monthlyAchievements
    );
  } catch (error) {
    console.error('Error checking all achievements:', error);
  }

  return allUnlockedAchievements;
};

// Unlock achievement function
const unlockAchievement = async (userId: string, achievementId: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error unlocking achievement:', error);
  }
};

// Get user's achievement progress
export const getUserAchievementProgress = async (userId: string): Promise<AchievementProgress[]> => {
  const progressList: AchievementProgress[] = [];
  
  try {
    // Get all active achievements
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('points', { ascending: true });

    if (error) throw error;

    // Get user's unlocked achievements
    const { data: userAchievements, error: userError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    if (userError) throw userError;

    const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);

    // Get user statistics
    const { data: workoutSessions } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .not('completed_at', 'is', null);

    const { data: streakData } = await supabase
      .from('workout_streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .single();

    const { data: personalRecords } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', userId);

    const totalWorkouts = workoutSessions?.length || 0;
    const currentStreak = streakData?.current_streak || 0;
    const totalPRs = personalRecords?.length || 0;

    // Calculate progress for each achievement
    for (const achievement of achievements || []) {
      const criteria = achievement.criteria as any;
      let currentValue = 0;
      let targetValue = criteria.target;

      switch (criteria.type) {
        case 'workout_count':
          currentValue = totalWorkouts;
          break;
        case 'streak':
          currentValue = currentStreak;
          break;
        case 'personal_records':
          currentValue = totalPRs;
          break;
        case 'weekly_workouts':
          // Calculate current week's workouts
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          currentValue = workoutSessions?.filter(ws => 
            new Date(ws.started_at) >= weekAgo
          ).length || 0;
          break;
        case 'monthly_workouts':
          // Calculate current month's workouts
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          currentValue = workoutSessions?.filter(ws => 
            new Date(ws.started_at) >= monthAgo
          ).length || 0;
          break;
        case 'cardio_workouts':
          // This would require joining with workouts table to check workout_type
          currentValue = 0; // Simplified for now
          break;
        default:
          currentValue = 0;
      }

      const percentage = Math.min((currentValue / targetValue) * 100, 100);
      const unlocked = unlockedIds.has(achievement.id);

      progressList.push({
        achievement_id: achievement.id,
        current_value: currentValue,
        target_value: targetValue,
        percentage,
        unlocked,
        achievement,
      });
    }
  } catch (error) {
    console.error('Error getting achievement progress:', error);
  }

  return progressList;
};

// Get user's unlocked achievements
export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
};