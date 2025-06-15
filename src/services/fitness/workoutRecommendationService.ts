
import { supabase } from '@/integrations/supabase/client';
import { WorkoutPlan, Exercise, UserWorkoutStats } from '@/types/fitness';
import { WorkoutRecommendation } from '@/types/fitness/recommendations';

interface UserFitnessProfile {
  level: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  preferences: {
    workoutDuration: number;
    frequency: number;
    equipment: string[];
  };
  limitations: string[];
  stats: UserWorkoutStats;
}

export class WorkoutRecommendationService {
  
  /**
   * Generate personalized workout recommendations based on user profile and history
   */
  static async generateRecommendations(userId: string): Promise<WorkoutRecommendation[]> {
    try {
      const userProfile = await this.getUserFitnessProfile(userId);
      const workoutHistory = await this.getRecentWorkoutHistory(userId);
      const progressData = await this.getUserProgressData(userId);
      
      const recommendations: WorkoutRecommendation[] = [];
      
      // Generate different types of recommendations
      recommendations.push(...this.generateProgressBasedRecommendations(userProfile, progressData));
      recommendations.push(...this.generateVarietyRecommendations(userProfile, workoutHistory));
      recommendations.push(...this.generateGoalBasedRecommendations(userProfile));
      recommendations.push(...this.generateRecoveryRecommendations(userProfile, workoutHistory));
      
      // Score and sort recommendations
      return this.scoreAndSortRecommendations(recommendations, userProfile);
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Get user fitness profile including preferences and stats
   */
  private static async getUserFitnessProfile(userId: string): Promise<UserFitnessProfile> {
    // Get user workout stats
    const { data: stats } = await supabase
      .from('user_workout_stats')
      .select('*')
      .eq('user_workout_stats_user_id', userId)
      .single();

    // Get user workout plans to understand preferences
    const { data: plans } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('workout_plans_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Analyze user level based on stats and history
    const level = this.determineUserLevel(stats, plans);
    
    return {
      level,
      goals: plans?.map(p => p.goal) || ['general_fitness'],
      preferences: {
        workoutDuration: 45, // Default 45 minutes
        frequency: plans?.[0]?.frequency || 3,
        equipment: ['bodyweight'] // Default to bodyweight
      },
      limitations: [],
      stats: stats || {
        total_workouts: 0,
        streak_days: 0,
        longest_streak: 0,
        total_calories_burned: 0,
        total_duration_minutes: 0,
        most_active_day: 'Monday'
      }
    };
  }

  /**
   * Get recent workout history to analyze patterns
   */
  private static async getRecentWorkoutHistory(userId: string) {
    const { data } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('workout_logs_user_id', userId)
      .order('date', { ascending: false })
      .limit(10);
    
    return data || [];
  }

  /**
   * Get user progress data for strength/endurance tracking
   */
  private static async getUserProgressData(userId: string) {
    const { data } = await supabase
      .from('exercise_progress')
      .select('*')
      .eq('exercise_progress_user_id', userId)
      .order('recorded_date', { ascending: false })
      .limit(20);
    
    return data || [];
  }

  /**
   * Determine user fitness level based on stats and history
   */
  private static determineUserLevel(stats: any, plans: any[]): 'beginner' | 'intermediate' | 'advanced' {
    if (!stats || stats.total_workouts < 10) return 'beginner';
    if (stats.total_workouts < 50 || stats.longest_streak < 14) return 'intermediate';
    return 'advanced';
  }

  /**
   * Generate recommendations based on progress and plateaus
   */
  private static generateProgressBasedRecommendations(
    profile: UserFitnessProfile, 
    progressData: any[]
  ): WorkoutRecommendation[] {
    const recommendations: WorkoutRecommendation[] = [];
    
    // Check for plateaus in specific exercises
    const exerciseProgress = this.analyzeExerciseProgress(progressData);
    
    for (const [exerciseName, progress] of Object.entries(exerciseProgress)) {
      if ((progress as any).isPlateaued) {
        recommendations.push({
          id: `plateau-${exerciseName}`,
          user_id: '',
          title: `Break Your ${exerciseName} Plateau`,
          description: `Try progressive overload techniques or exercise variations for ${exerciseName}`,
          type: 'exercise_variation',
          reason: 'Your progress has stalled on this exercise',
          confidence_score: 0.8,
          metadata: {
            exercise: exerciseName,
            suggestion: 'increase_reps',
            target_muscle: (progress as any).muscle
          },
          suggested_at: new Date().toISOString(),
          applied: false,
          dismissed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }
    
    return recommendations;
  }

  /**
   * Generate recommendations for workout variety
   */
  private static generateVarietyRecommendations(
    profile: UserFitnessProfile,
    workoutHistory: any[]
  ): WorkoutRecommendation[] {
    const recommendations: WorkoutRecommendation[] = [];
    
    // Analyze muscle group frequency
    const muscleGroupFrequency = this.analyzeMuscleGroupFrequency(workoutHistory);
    
    // Find underworked muscle groups
    const allMuscleGroups = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'];
    const underworkedGroups = allMuscleGroups.filter(
      group => (muscleGroupFrequency[group] || 0) < 2
    );
    
    if (underworkedGroups.length > 0) {
      recommendations.push({
        id: 'muscle-balance',
        user_id: '',
        title: 'Balance Your Training',
        description: `Focus more on ${underworkedGroups.join(', ')} to create a balanced physique`,
        type: 'muscle_balance',
        reason: 'Some muscle groups are being neglected',
        confidence_score: 0.7,
        metadata: {
          underworked_muscles: underworkedGroups,
          suggestion: 'add_exercises'
        },
        suggested_at: new Date().toISOString(),
        applied: false,
        dismissed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    return recommendations;
  }

  /**
   * Generate goal-specific recommendations
   */
  private static generateGoalBasedRecommendations(profile: UserFitnessProfile): WorkoutRecommendation[] {
    const recommendations: WorkoutRecommendation[] = [];
    
    // Generate recommendations based on primary goal
    const primaryGoal = profile.goals[0] || 'general_fitness';
    
    switch (primaryGoal) {
      case 'strength':
        recommendations.push({
          id: 'strength-focus',
          user_id: '',
          title: 'Strength Building Protocol',
          description: 'Focus on compound movements with heavy weight and low reps',
          type: 'training_protocol',
          reason: 'Optimized for your strength goals',
          confidence_score: 0.9,
          metadata: {
            protocol: 'strength',
            rep_range: '3-6',
            rest_time: '3-5 minutes'
          },
          suggested_at: new Date().toISOString(),
          applied: false,
          dismissed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        break;
        
      case 'endurance':
        recommendations.push({
          id: 'endurance-focus',
          user_id: '',
          title: 'Endurance Training Plan',
          description: 'Incorporate higher reps and circuit training',
          type: 'training_protocol',
          reason: 'Tailored for endurance improvement',
          confidence_score: 0.9,
          metadata: {
            protocol: 'endurance',
            rep_range: '15-25',
            rest_time: '30-60 seconds'
          },
          suggested_at: new Date().toISOString(),
          applied: false,
          dismissed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        break;
    }
    
    return recommendations;
  }

  /**
   * Generate recovery and rest recommendations
   */
  private static generateRecoveryRecommendations(
    profile: UserFitnessProfile,
    workoutHistory: any[]
  ): WorkoutRecommendation[] {
    const recommendations: WorkoutRecommendation[] = [];
    
    // Check for overtraining signs
    const recentWorkouts = workoutHistory.filter(w => 
      new Date(w.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    if (recentWorkouts.length > 6) {
      recommendations.push({
        id: 'recovery-reminder',
        user_id: '',
        title: 'Take a Rest Day',
        description: 'You\'ve been training hard! Consider taking a rest day for optimal recovery',
        type: 'recovery',
        reason: 'High training frequency detected',
        confidence_score: 0.8,
        metadata: {
          workouts_this_week: recentWorkouts.length,
          suggestion: 'rest_day'
        },
        suggested_at: new Date().toISOString(),
        applied: false,
        dismissed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    return recommendations;
  }

  /**
   * Analyze exercise progress to detect plateaus
   */
  private static analyzeExerciseProgress(progressData: any[]) {
    const exerciseGroups = progressData.reduce((acc, entry) => {
      if (!acc[entry.exercise_name]) {
        acc[entry.exercise_name] = [];
      }
      acc[entry.exercise_name].push(entry);
      return acc;
    }, {});
    
    const analysis: Record<string, any> = {};
    
    for (const [exercise, entries] of Object.entries(exerciseGroups)) {
      const sortedEntries = (entries as any[]).sort((a, b) => 
        new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime()
      );
      
      // Check if progress has stalled (no improvement in last 3 entries)
      const recent = sortedEntries.slice(-3);
      const isPlateaued = recent.length >= 3 && 
        recent.every(entry => entry.max_weight === recent[0].max_weight);
      
      analysis[exercise] = {
        isPlateaued,
        entries: sortedEntries.length,
        muscle: sortedEntries[0]?.target_muscle || 'unknown'
      };
    }
    
    return analysis;
  }

  /**
   * Analyze muscle group training frequency
   */
  private static analyzeMuscleGroupFrequency(workoutHistory: any[]) {
    const frequency: Record<string, number> = {};
    
    workoutHistory.forEach(workout => {
      try {
        const exercises = JSON.parse(workout.completed_exercises || '[]');
        exercises.forEach((exercise: any) => {
          const muscle = exercise.target_muscle || exercise.muscle_group;
          if (muscle) {
            frequency[muscle] = (frequency[muscle] || 0) + 1;
          }
        });
      } catch (error) {
        console.error('Error parsing workout exercises:', error);
      }
    });
    
    return frequency;
  }

  /**
   * Score and sort recommendations by relevance
   */
  private static scoreAndSortRecommendations(
    recommendations: WorkoutRecommendation[],
    profile: UserFitnessProfile
  ): WorkoutRecommendation[] {
    return recommendations
      .sort((a, b) => b.confidence_score - a.confidence_score)
      .slice(0, 5); // Return top 5 recommendations
  }
}
