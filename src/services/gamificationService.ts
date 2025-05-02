
import { supabase } from '../integrations/supabase/client';
import { 
  Achievement, 
  UserAchievement, 
  UserStreak, 
  WorkoutLog,
  DailyQuest,
  Team,
  Challenge,
  ChallengeParticipant,
  TeamMember,
  StreakReward
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
      const newStreak: UserStreak = {
        user_id: userId,
        currentstreak: 1,
        longeststreak: 1,
        last_activity_date: todayStr,
        streak_type: streakType,
        id: crypto.randomUUID()
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
 * Since the daily_quests table doesn't exist,
 * we'll mock this functionality
 */
export const getDailyQuests = async (userId: string): Promise<{ data: DailyQuest[] | null, error: any }> => {
  try {
    // Mock data since the table doesn't exist
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const quests: DailyQuest[] = [
      {
        id: crypto.randomUUID(),
        user_id: userId,
        title: "Complete a workout today",
        description: "Log at least one workout session",
        points: 10,
        completed: false,
        created_at: today.toISOString(),
        expires_at: tomorrow.toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        title: "Record your measurements",
        description: "Update your body measurements",
        points: 5,
        completed: false,
        created_at: today.toISOString(),
        expires_at: tomorrow.toISOString()
      },
      {
        id: crypto.randomUUID(),
        user_id: userId,
        title: "Complete 5000 steps",
        description: "Walk at least 5000 steps today",
        points: 15,
        completed: false,
        created_at: today.toISOString(),
        expires_at: tomorrow.toISOString()
      }
    ];
    
    return { data: quests, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Updates a daily quest status
 * Since the daily_quests table doesn't exist,
 * this is a mock function
 */
export const updateQuestStatus = async (
  questId: string, 
  completed: boolean
): Promise<{ success: boolean, error: any }> => {
  try {
    // This would normally update the database
    console.log(`Quest ${questId} marked as ${completed ? 'completed' : 'incomplete'}`);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating quest status:', error);
    return { success: false, error };
  }
};

/**
 * Gets teams that the user is a member of
 * Since the teams and team_members tables don't exist,
 * this is a mock function
 */
export const getUserTeams = async (userId: string): Promise<{ data: Team[] | null, error: any }> => {
  try {
    // Mock data for teams
    const teams: Team[] = [
      {
        id: crypto.randomUUID(),
        name: "Fitness Warriors",
        description: "A team focused on consistent daily workouts",
        creator_id: userId,
        created_at: new Date().toISOString(),
        avatar_url: "https://example.com/avatar.jpg",
        members_count: 5,
        total_points: 1250
      },
      {
        id: crypto.randomUUID(),
        name: "Weight Loss Champions",
        description: "Supporting each other in weight loss goals",
        creator_id: "other-user-id",
        created_at: new Date().toISOString(),
        avatar_url: "https://example.com/avatar2.jpg",
        members_count: 8,
        total_points: 2300
      }
    ];
    
    return { data: teams, error: null };
  } catch (error) {
    console.error('Error fetching user teams:', error);
    return { data: null, error };
  }
};

/**
 * Gets challenges that are available to the user
 * Since the challenges table doesn't exist,
 * this is a mock function
 */
export const getAvailableChallenges = async (): Promise<{ data: Challenge[] | null, error: any }> => {
  try {
    const today = new Date().toISOString();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    const endDateStr = endDate.toISOString();
    
    // Mock data for challenges
    const challenges: Challenge[] = [
      {
        id: crypto.randomUUID(),
        title: "30-Day Running Challenge",
        description: "Run at least 2km every day for 30 days",
        start_date: today,
        end_date: endDateStr,
        type: "individual",
        status: "active",
        goal_type: "distance",
        goal_value: 60,
        reward_points: 500,
        participants_count: 48
      },
      {
        id: crypto.randomUUID(),
        title: "Weight Loss Challenge",
        description: "Lose 5kg in 30 days",
        start_date: today,
        end_date: endDateStr,
        type: "team",
        status: "active",
        goal_type: "weight",
        goal_value: 5,
        reward_points: 1000,
        participants_count: 120
      }
    ];
    
    return { data: challenges, error: null };
  } catch (error) {
    console.error('Error fetching available challenges:', error);
    return { data: null, error };
  }
};

/**
 * Gets challenges that the user is participating in
 * Since the challenges and challenge_participants tables don't exist,
 * this is a mock function
 */
export const getUserChallenges = async (userId: string): Promise<{ data: Challenge[] | null, error: any }> => {
  try {
    const today = new Date().toISOString();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 15);
    const endDateStr = endDate.toISOString();
    
    // Mock data for user challenges
    const challenges: Challenge[] = [
      {
        id: crypto.randomUUID(),
        title: "Team Step Challenge",
        description: "Accumulate the most steps as a team",
        start_date: today,
        end_date: endDateStr,
        type: "team",
        status: "active",
        goal_type: "steps",
        goal_value: 1000000,
        reward_points: 2000,
        participants_count: 35
      }
    ];
    
    return { data: challenges, error: null };
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    return { data: null, error };
  }
};

/**
 * Joins a user to a team
 * Since the team_members table doesn't exist,
 * this is a mock function
 */
export const joinTeam = async (userId: string, teamId: string): Promise<{ success: boolean, error: any }> => {
  try {
    // This would normally update the database
    console.log(`User ${userId} joined team ${teamId}`);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error joining team:', error);
    return { success: false, error };
  }
};

/**
 * Joins a challenge
 * Since the challenge_participants table doesn't exist,
 * this is a mock function
 */
export const joinChallenge = async (
  userId: string, 
  challengeId: string, 
  teamId?: string
): Promise<{ success: boolean, error: any }> => {
  try {
    // This would normally update the database
    console.log(`User ${userId} joined challenge ${challengeId}${teamId ? ` with team ${teamId}` : ''}`);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error joining challenge:', error);
    return { success: false, error };
  }
};

/**
 * Updates user's challenge progress
 * Since the challenge_participants table doesn't exist,
 * this is a mock function
 */
export const updateChallengeProgress = async (
  userId: string, 
  challengeId: string, 
  progress: number
): Promise<{ success: boolean, completed: boolean, error: any }> => {
  try {
    // This would normally update the database
    console.log(`User ${userId} made progress of ${progress} in challenge ${challengeId}`);
    
    // Mock completion check
    const completed = Math.random() > 0.8; // 20% chance of completion for demo
    
    return { 
      success: true, 
      completed, 
      error: null 
    };
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    return { success: false, completed: false, error };
  }
};

/**
 * Gets streak rewards for a user
 */
export const getStreakRewards = async (userId: string, currentStreak: number): Promise<{ data: StreakReward[] | null, error: any }> => {
  try {
    // Mock data for streak rewards
    const rewards: StreakReward[] = [
      { days: 3, points: 15, description: 'Three-day streak', claimed: currentStreak >= 3 },
      { days: 7, points: 50, description: 'One week consistency', claimed: currentStreak >= 7 },
      { days: 14, points: 100, description: 'Two week dedication', claimed: currentStreak >= 14 },
      { days: 30, points: 200, description: 'One month commitment', claimed: currentStreak >= 30 },
      { days: 60, points: 350, description: 'Two month mastery', claimed: currentStreak >= 60 },
      { days: 90, points: 500, description: 'Three month transformation', claimed: false },
    ];
    
    return { data: rewards, error: null };
  } catch (error) {
    console.error('Error getting streak rewards:', error);
    return { data: null, error };
  }
};

/**
 * Claims a streak reward
 */
export const claimStreakReward = async (userId: string, days: number, points: number): Promise<{ success: boolean, error: any }> => {
  try {
    // This would normally update the database and add points to user account
    console.log(`User ${userId} claimed streak reward for ${days} days, earning ${points} points`);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error claiming streak reward:', error);
    return { success: false, error };
  }
};
