
import { supabase } from '@/integrations/supabase/client';
import { UserWorkoutStats } from '@/types/fitness/workouts';

export class WorkoutRecommendationService {
  static async getUserWorkoutStats(userId: string): Promise<UserWorkoutStats> {
    try {
      const { data, error } = await supabase
        .from('user_workout_stats')
        .select('*')
        .eq('user_workout_stats_user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Transform database fields to match UserWorkoutStats interface
      const stats: UserWorkoutStats = {
        total_workouts: data?.total_workouts || 0,
        streak_days: data?.streak_days || 0,
        streak: data?.streak_days || 0, // alias
        most_active_day: data?.most_active_day || 'Monday',
        recent_workouts: [],
        achievements: 0,
        calories_burned: data?.calories_burned || 0,
        calories_burned_total: data?.calories_burned || 0,
        workout_time_total: data?.total_time || 0,
        favorite_workout_type: 'general_fitness'
      };

      return stats;
    } catch (error) {
      console.error('Error fetching user workout stats:', error);
      // Return default stats
      return {
        total_workouts: 0,
        streak_days: 0,
        streak: 0,
        most_active_day: 'Monday',
        recent_workouts: [],
        achievements: 0,
        calories_burned: 0,
        calories_burned_total: 0,
        workout_time_total: 0,
        favorite_workout_type: 'general_fitness'
      };
    }
  }

  static async generateRecommendations(userId: string) {
    try {
      const stats = await this.getUserWorkoutStats(userId);
      
      // Simple recommendation logic based on stats
      const recommendations = [];
      
      if (stats.total_workouts === 0) {
        recommendations.push({
          type: 'beginner_friendly',
          title: 'Start Your Fitness Journey',
          description: 'Begin with bodyweight exercises to build a foundation',
          workouts: ['Full Body Beginner', 'Basic Cardio']
        });
      } else if (stats.streak_days < 7) {
        recommendations.push({
          type: 'consistency',
          title: 'Build Your Streak',
          description: 'Focus on consistency with shorter, manageable workouts',
          workouts: ['Quick 15-min Workout', 'Active Recovery']
        });
      } else {
        recommendations.push({
          type: 'progressive',
          title: 'Level Up Your Training',
          description: 'Time to increase intensity and challenge yourself',
          workouts: ['Intermediate Strength', 'HIIT Challenge']
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }
}
