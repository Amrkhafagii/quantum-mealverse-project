import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { 
  UserStreak, 
  UserAchievement, 
  Achievement
} from '@/types/fitness/achievements';
import {
  Challenge,
  ChallengeParticipant
} from '@/types/fitness/challenges';

// Get user streak data
export async function getUserStreak(userId: string, streakType: 'workout' | 'nutrition' | 'meditation' = 'workout') {
  try {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_streaks_user_id', userId)
      .eq('streak_type', streakType)
      .maybeSingle();
      
    return { data, error };
  } catch (error) {
    console.error('Error fetching user streak:', error);
    return { data: null, error };
  }
}

// Placeholder functions for challenge-related operations
// In a real implementation, these would interact with actual tables

// Get all available challenges
export async function getChallenges() {
  try {
    // Use the real implementation now that we have the table
    const { data, error } = await supabase
      .from('challenges')
      .select('*');
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return { data: null, error };
  }
}

// Get challenges the user is participating in
export async function getUserChallenges(userId: string) {
  try {
    // Use the real implementation
    const { data, error } = await supabase
      .from('challenge_participants')
      .select(`
        *,
        challenge:challenge_id(*)
      `)
      .eq('challenge_participants_user_id', userId);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    return { data: null, error };
  }
}

// Join a challenge
export async function joinChallenge(userId: string, challengeId: string, teamId?: string) {
  try {
    const participant = {
      id: uuidv4(),
      user_id: userId,
      challenge_id: challengeId,
      team_id: teamId || null,
      joined_date: new Date().toISOString(),
      progress: 0,
      completed: false
    };
    
    const { data, error } = await supabase
      .from('challenge_participants')
      .insert(participant);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error joining challenge:', error);
    return { success: false, error };
  }
}

// Update challenge progress
export async function updateChallengeProgress(participantId: string, progress: number, completed: boolean) {
  try {
    console.log(`Mock: Updating challenge progress for participant ${participantId} to ${progress}%`);
    
    // In a real implementation, this would update the challenge_participants table
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    return { success: false, error };
  }
}

// Get user achievements
export async function getUserAchievements(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievement_id(*)
      `)
      .eq('user_achievements_user_id', userId)
      .order('date_achieved', { ascending: false });
      
    return { data, error };
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return { data: null, error };
  }
}

// Award achievement to user
export async function awardAchievement(userId: string, achievementId: string) {
  try {
    const userAchievement = {
      id: uuidv4(),
      user_id: userId,
      achievement_id: achievementId,
      date_achieved: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('user_achievements')
      .insert(userAchievement);
      
    return { success: !error, error };
  } catch (error) {
    console.error('Error awarding achievement:', error);
    return { success: false, error };
  }
}

// Update or create user streak
export async function updateStreak(userId: string, streakType: string, date: string) {
  try {
    // First, get the current streak
    const { data: existingStreak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_streaks_user_id', userId)
      .eq('streak_type', streakType)
      .maybeSingle();
      
    // If no streak exists, create one
    if (!existingStreak) {
      const newStreak: UserStreak = {
        id: uuidv4(),
        user_streaks_user_id: userId,
        currentstreak: 1,
        longeststreak: 1,
        last_activity_date: date,
        streak_type: streakType
      };
      
      const { error } = await supabase
        .from('user_streaks')
        .insert(newStreak);
        
      return { success: !error, data: newStreak, error };
    }
    
    // If streak exists, update it
    const activityDate = new Date(date);
    const lastActivityDate = new Date(existingStreak.last_activity_date);
    
    // Check if this is the same day (don't increment streak)
    if (activityDate.toDateString() === lastActivityDate.toDateString()) {
      return { success: true, data: existingStreak, error: null };
    }
    
    // Calculate days between activities
    const daysBetween = Math.floor((activityDate.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let updatedStreak: UserStreak;
    
    if (daysBetween <= 1) {
      // Increment streak if activity is the next day
      const currentstreak = existingStreak.currentstreak + 1;
      const longeststreak = Math.max(currentstreak, existingStreak.longeststreak);
      
      updatedStreak = {
        ...existingStreak,
        currentstreak,
        longeststreak,
        last_activity_date: date
      };
    } else {
      // Break the streak if more than 1 day between activities
      updatedStreak = {
        ...existingStreak,
        currentstreak: 1,
        last_activity_date: date
      };
    }
    
    const { error } = await supabase
      .from('user_streaks')
      .update(updatedStreak)
      .eq('id', existingStreak.id);
      
    return { success: !error, data: updatedStreak, error };
  } catch (error) {
    console.error('Error updating streak:', error);
    return { success: false, data: null, error };
  }
}
