
import { supabase } from '../integrations/supabase/client';
import { 
  Achievement, 
  UserAchievement, 
  UserStreak, 
  WorkoutLog,
  DailyQuest,
  Team,
  Challenge,
  ChallengeParticipant
} from '@/types/fitness';

/**
 * Fetches all available achievements
 */
export const getAchievements = async (): Promise<{ data: Achievement[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*');
    
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Fetches achievements for a specific user
 */
export const getUserAchievements = async (userId: string): Promise<{ data: UserAchievement[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievement:achievement_id(*)')
      .eq('user_id', userId);
    
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Awards an achievement to a user
 */
export const awardAchievement = async (
  userId: string, 
  achievementId: string
): Promise<{ success: boolean, error: any }> => {
  try {
    // Check if user already has this achievement
    const { data, error: checkError } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    // If user already has this achievement, do nothing
    if (data) {
      return { success: true, error: null };
    }
    
    // Award the achievement
    const { error } = await supabase
      .from('user_achievements')
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
 * Checks user's activity against achievement criteria and awards achievements
 * if criteria are met
 */
export const checkAndAwardAchievements = async (userId: string, activityType: string, data?: any): Promise<void> => {
  try {
    // This is where you would implement logic to check various achievement criteria
    // For now, we'll just demonstrate the pattern
    
    if (activityType === 'workout_completed') {
      const workoutLog = data as WorkoutLog;
      
      // Example: Award achievement for completing a workout over 30 minutes
      if (workoutLog.duration >= 30) {
        await awardAchievement(userId, 'achievement_id_for_30min_workout');
      }
      
      // Example: Award achievement for high intensity workout
      if (workoutLog.calories_burned && workoutLog.calories_burned >= 300) {
        await awardAchievement(userId, 'achievement_id_for_high_intensity');
      }
    }
    else if (activityType === 'streak_updated') {
      const streak = data as UserStreak;
      
      // Award streak-based achievements
      if (streak.currentstreak >= 7) {
        await awardAchievement(userId, 'achievement_id_for_7day_streak');
      }
      
      if (streak.currentstreak >= 30) {
        await awardAchievement(userId, 'achievement_id_for_30day_streak');
      }
    }
    // Add more achievement checks here
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
};

/**
 * Gets user's streak information
 */
export const getUserStreak = async (userId: string, streakType = 'workout'): Promise<{ data: UserStreak | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('streak_type', streakType)
      .maybeSingle();
    
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Updates user's streak based on activity
 */
export const updateUserStreak = async (userId: string, date: string, streakType = 'workout'): Promise<{ data: UserStreak | null, error: any }> => {
  try {
    // First, get the current streak
    const { data: currentStreak, error: streakError } = await getUserStreak(userId, streakType);
    
    if (streakError) throw streakError;
    
    const activityDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format dates for comparison (YYYY-MM-DD)
    const activityDateStr = activityDate.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (!currentStreak) {
      // Create new streak if it doesn't exist
      const newStreak: Partial<UserStreak> = {
        user_id: userId,
        currentstreak: 1,
        longeststreak: 1,
        last_activity_date: todayStr,
        streak_type: streakType
      };
      
      const { data, error } = await supabase
        .from('user_streaks')
        .insert(newStreak)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } else {
      // Update existing streak
      let newCurrentStreak = currentStreak.currentstreak;
      let newLongestStreak = currentStreak.longeststreak;
      const lastActivityDate = currentStreak.last_activity_date.split('T')[0];
      
      // If activity was done today, don't increment the streak
      if (lastActivityDate === todayStr) {
        return { data: currentStreak, error: null };
      }
      
      // If activity was done yesterday, increment streak
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
      const { data, error } = await supabase
        .from('user_streaks')
        .update({
          currentstreak: newCurrentStreak,
          longeststreak: newLongestStreak,
          last_activity_date: todayStr
        })
        .eq('id', currentStreak.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Check for streak-based achievements
      await checkAndAwardAchievements(userId, 'streak_updated', data);
      
      return { data, error: null };
    }
  } catch (error) {
    console.error('Error updating user streak:', error);
    return { data: null, error };
  }
};

/**
 * Gets daily quests for a user
 */
export const getDailyQuests = async (userId: string): Promise<{ data: DailyQuest[] | null, error: any }> => {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('daily_quests')
      .select('*')
      .eq('user_id', userId)
      .gte('expires_at', today.toISOString());
    
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Updates a daily quest status
 */
export const updateQuestStatus = async (
  questId: string, 
  completed: boolean
): Promise<{ success: boolean, error: any }> => {
  try {
    const { error } = await supabase
      .from('daily_quests')
      .update({ completed })
      .eq('id', questId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating quest status:', error);
    return { success: false, error };
  }
};

/**
 * Gets teams that the user is a member of
 */
export const getUserTeams = async (userId: string): Promise<{ data: Team[] | null, error: any }> => {
  try {
    // First get team memberships
    const { data: memberships, error: memberError } = await supabase
      .from('team_members')
      .select('team_id, role, joined_at, contribution_points')
      .eq('user_id', userId);
    
    if (memberError) throw memberError;
    
    if (!memberships || memberships.length === 0) {
      return { data: [], error: null };
    }
    
    // Get team details
    const teamIds = memberships.map(m => m.team_id);
    
    const { data: teams, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds);
    
    if (teamError) throw teamError;
    
    // Merge team data with membership data
    const enhancedTeams = teams?.map(team => {
      const membership = memberships.find(m => m.team_id === team.id);
      return {
        ...team,
        user_role: membership?.role,
        joined_at: membership?.joined_at,
        contribution_points: membership?.contribution_points
      };
    });
    
    return { data: enhancedTeams, error: null };
  } catch (error) {
    console.error('Error fetching user teams:', error);
    return { data: null, error };
  }
};

/**
 * Gets challenges that are available to the user
 */
export const getAvailableChallenges = async (): Promise<{ data: Challenge[] | null, error: any }> => {
  try {
    const today = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .lte('start_date', today)
      .gte('end_date', today)
      .order('end_date', { ascending: true });
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching available challenges:', error);
    return { data: null, error };
  }
};

/**
 * Gets challenges that the user is participating in
 */
export const getUserChallenges = async (userId: string): Promise<{ data: Challenge[] | null, error: any }> => {
  try {
    // First get challenge participations
    const { data: participations, error: partError } = await supabase
      .from('challenge_participants')
      .select('challenge_id, current_progress, completed, completed_at, team_id')
      .eq('user_id', userId);
    
    if (partError) throw partError;
    
    if (!participations || participations.length === 0) {
      return { data: [], error: null };
    }
    
    // Get challenge details
    const challengeIds = participations.map(p => p.challenge_id);
    
    const { data: challenges, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .in('id', challengeIds);
    
    if (challengeError) throw challengeError;
    
    // Merge challenge data with participation data
    const enhancedChallenges = challenges?.map(challenge => {
      const participation = participations.find(p => p.challenge_id === challenge.id);
      return {
        ...challenge,
        current_progress: participation?.current_progress,
        completed: participation?.completed,
        completed_at: participation?.completed_at,
        team_id: participation?.team_id
      };
    });
    
    return { data: enhancedChallenges, error: null };
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    return { data: null, error };
  }
};

/**
 * Joins a user to a team
 */
export const joinTeam = async (userId: string, teamId: string): Promise<{ success: boolean, error: any }> => {
  try {
    const { error } = await supabase
      .from('team_members')
      .insert({
        user_id: userId,
        team_id: teamId,
        joined_at: new Date().toISOString(),
        role: 'member',
        contribution_points: 0
      });
    
    if (error) throw error;
    
    // Update team members count
    await supabase.rpc('increment_team_members_count', {
      p_team_id: teamId,
      p_increment: 1
    });
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error joining team:', error);
    return { success: false, error };
  }
};

/**
 * Joins a challenge
 */
export const joinChallenge = async (
  userId: string, 
  challengeId: string, 
  teamId?: string
): Promise<{ success: boolean, error: any }> => {
  try {
    const { error } = await supabase
      .from('challenge_participants')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        team_id: teamId,
        joined_at: new Date().toISOString(),
        current_progress: 0,
        completed: false
      });
    
    if (error) throw error;
    
    // Update challenge participants count
    await supabase.rpc('increment_challenge_participants_count', {
      p_challenge_id: challengeId,
      p_increment: 1
    });
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error joining challenge:', error);
    return { success: false, error };
  }
};

/**
 * Updates user's challenge progress
 */
export const updateChallengeProgress = async (
  userId: string, 
  challengeId: string, 
  progress: number
): Promise<{ success: boolean, completed: boolean, error: any }> => {
  try {
    // Get challenge info first to check if completed
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('goal_type, goal_value')
      .eq('id', challengeId)
      .maybeSingle();
    
    if (challengeError) throw challengeError;
    
    if (!challenge) {
      throw new Error('Challenge not found');
    }
    
    // Get current participation
    const { data: participation, error: partError } = await supabase
      .from('challenge_participants')
      .select('current_progress, completed')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .maybeSingle();
    
    if (partError) throw partError;
    
    if (!participation) {
      throw new Error('User is not participating in this challenge');
    }
    
    const newProgress = participation.current_progress + progress;
    const isCompleted = newProgress >= challenge.goal_value;
    
    const updateData: any = {
      current_progress: newProgress
    };
    
    if (isCompleted && !participation.completed) {
      updateData.completed = true;
      updateData.completed_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('challenge_participants')
      .update(updateData)
      .eq('user_id', userId)
      .eq('challenge_id', challengeId);
    
    if (error) throw error;
    
    return { 
      success: true, 
      completed: isCompleted && !participation.completed, 
      error: null 
    };
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    return { success: false, completed: false, error };
  }
};
