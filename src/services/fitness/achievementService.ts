
import { supabase } from '@/integrations/supabase/client';
import { Achievement, UserAchievement } from '@/types/fitness/achievements';

interface AchievementCheck {
  achievementId: string;
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;
}

export class AchievementService {
  
  static async checkAndAwardAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const checks = await this.performAchievementChecks(userId);
      const newAchievements: UserAchievement[] = [];

      for (const check of checks) {
        if (check.isCompleted) {
          const awarded = await this.awardAchievement(userId, check.achievementId);
          if (awarded) {
            newAchievements.push(awarded);
          }
        } else {
          // Update progress for incomplete achievements
          await this.updateAchievementProgress(userId, check.achievementId, check.currentProgress);
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  private static async performAchievementChecks(userId: string): Promise<AchievementCheck[]> {
    const checks: AchievementCheck[] = [];

    // Get user's workout data
    const { data: workoutLogs } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('workout_logs_user_id', userId);

    const { data: userStats } = await supabase
      .from('user_workout_stats')
      .select('*')
      .eq('user_workout_stats_user_id', userId)
      .single();

    // Check "First Steps" achievement
    const firstWorkoutCompleted = (workoutLogs?.length || 0) >= 1;
    checks.push({
      achievementId: '550e8400-e29b-41d4-a716-446655440001',
      currentProgress: workoutLogs?.length || 0,
      targetProgress: 1,
      isCompleted: firstWorkoutCompleted
    });

    // Check "Week Warrior" achievement (7-day streak)
    const currentStreak = userStats?.streak_days || 0;
    checks.push({
      achievementId: '550e8400-e29b-41d4-a716-446655440002',
      currentProgress: currentStreak,
      targetProgress: 7,
      isCompleted: currentStreak >= 7
    });

    // Check "Consistency King" achievement (30 workouts)
    const totalWorkouts = userStats?.total_workouts || workoutLogs?.length || 0;
    checks.push({
      achievementId: '550e8400-e29b-41d4-a716-446655440003',
      currentProgress: totalWorkouts,
      targetProgress: 30,
      isCompleted: totalWorkouts >= 30
    });

    // Check "Strength Builder" achievement (25% weight increase)
    const strengthProgress = await this.checkStrengthProgress(userId);
    checks.push({
      achievementId: '550e8400-e29b-41d4-a716-446655440004',
      currentProgress: strengthProgress.currentProgress,
      targetProgress: strengthProgress.targetProgress,
      isCompleted: strengthProgress.isCompleted
    });

    return checks;
  }

  private static async checkStrengthProgress(userId: string): Promise<{
    currentProgress: number;
    targetProgress: number;
    isCompleted: boolean;
  }> {
    try {
      const { data: exerciseProgress } = await supabase
        .from('exercise_progress')
        .select('*')
        .eq('exercise_progress_user_id', userId)
        .order('recorded_date', { ascending: true });

      if (!exerciseProgress || exerciseProgress.length < 2) {
        return { currentProgress: 0, targetProgress: 25, isCompleted: false };
      }

      // Check for 25% improvement in any exercise
      const exerciseGroups = exerciseProgress.reduce((acc: any, record: any) => {
        if (!acc[record.exercise_name]) {
          acc[record.exercise_name] = [];
        }
        acc[record.exercise_name].push(record);
        return acc;
      }, {});

      let maxImprovement = 0;

      Object.values(exerciseGroups).forEach((records: any) => {
        if (records.length >= 2) {
          const first = records[0];
          const latest = records[records.length - 1];
          
          if (first.max_weight && latest.max_weight && first.max_weight > 0) {
            const improvement = ((latest.max_weight - first.max_weight) / first.max_weight) * 100;
            maxImprovement = Math.max(maxImprovement, improvement);
          }
        }
      });

      return {
        currentProgress: Math.round(maxImprovement),
        targetProgress: 25,
        isCompleted: maxImprovement >= 25
      };
    } catch (error) {
      console.error('Error checking strength progress:', error);
      return { currentProgress: 0, targetProgress: 25, isCompleted: false };
    }
  }

  private static async awardAchievement(userId: string, achievementId: string): Promise<UserAchievement | null> {
    try {
      // Check if user already has this achievement
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_achievements_user_id', userId)
        .eq('achievement_id', achievementId)
        .single();

      if (existing) {
        return null; // Already awarded
      }

      // Award the achievement
      const { data: newAchievement, error } = await supabase
        .from('user_achievements')
        .insert({
          user_achievements_user_id: userId,
          achievement_id: achievementId,
          date_achieved: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: newAchievement.id,
        user_achievements_user_id: newAchievement.user_achievements_user_id,
        achievement_id: newAchievement.achievement_id,
        date_achieved: newAchievement.date_achieved,
        unlocked_at: newAchievement.date_achieved
      };
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return null;
    }
  }

  private static async updateAchievementProgress(userId: string, achievementId: string, progress: number): Promise<void> {
    try {
      await supabase
        .from('achievement_progress')
        .upsert({
          achievement_progress_user_id: userId,
          achievement_id: achievementId,
          current_progress: progress,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating achievement progress:', error);
    }
  }

  static async getAchievementProgress(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('achievement_progress')
        .select(`
          *,
          achievement:achievement_id(*)
        `)
        .eq('achievement_progress_user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching achievement progress:', error);
      return [];
    }
  }
}
