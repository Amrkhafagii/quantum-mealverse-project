
import { supabase } from '@/integrations/supabase/client';

export interface RecommendationContext {
  userId: string;
  workoutHistory: any[];
  exerciseProgress: any[];
  userPreferences: any;
  fitnessGoals: any[];
  currentWorkoutPlan: any;
}

export class IntelligentRecommendationEngine {
  static async generatePersonalizedRecommendations(userId: string) {
    const context = await this.gatherUserContext(userId);
    const recommendations: any[] = [];

    // Analyze workout frequency
    const frequencyRecommendation = this.analyzeWorkoutFrequency(context);
    if (frequencyRecommendation) recommendations.push(frequencyRecommendation);

    // Analyze muscle group balance
    const balanceRecommendation = this.analyzeMuscleGroupBalance(context);
    if (balanceRecommendation) recommendations.push(balanceRecommendation);

    // Analyze progression patterns
    const progressionRecommendation = this.analyzeProgressionPatterns(context);
    if (progressionRecommendation) recommendations.push(progressionRecommendation);

    // Analyze recovery patterns
    const recoveryRecommendation = this.analyzeRecoveryPatterns(context);
    if (recoveryRecommendation) recommendations.push(recoveryRecommendation);

    // Save recommendations to database
    if (recommendations.length > 0) {
      for (const rec of recommendations) {
        await supabase
          .from('workout_recommendations')
          .insert({
            user_id: rec.user_id,
            title: rec.title,
            description: rec.description,
            type: rec.type,
            reason: rec.reason,
            confidence_score: rec.confidence_score,
            metadata: rec.metadata
          });
      }
    }

    return recommendations;
  }

  private static async gatherUserContext(userId: string): Promise<RecommendationContext> {
    // Get workout history (last 30 days)
    const { data: workoutHistory } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: false });

    // Get exercise progress
    const { data: exerciseProgress } = await supabase
      .from('exercise_progress')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // Get user preferences
    const { data: userPreferences } = await supabase
      .from('user_workout_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get fitness goals
    const { data: fitnessGoals } = await supabase
      .from('workout_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    // Get current workout plan
    const { data: currentWorkoutPlan } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return {
      userId,
      workoutHistory: workoutHistory || [],
      exerciseProgress: exerciseProgress || [],
      userPreferences: userPreferences || {},
      fitnessGoals: fitnessGoals || [],
      currentWorkoutPlan
    };
  }

  private static analyzeWorkoutFrequency(context: RecommendationContext) {
    const { workoutHistory, userPreferences } = context;
    const targetFrequency = userPreferences?.preferred_workout_frequency || 3;
    const actualFrequency = Array.isArray(workoutHistory) ? workoutHistory.length : 0;
    const weeklyTarget = targetFrequency;

    if (actualFrequency < weeklyTarget * 0.7) { // Less than 70% of target
      return {
        user_id: context.userId,
        title: "Increase Workout Frequency",
        description: `You've been working out ${actualFrequency} times in the last 30 days. Try to aim for ${weeklyTarget} workouts per week.`,
        type: 'workout_plan',
        reason: "Low workout frequency detected",
        confidence_score: 0.8,
        metadata: { 
          current_frequency: actualFrequency,
          target_frequency: weeklyTarget,
          suggestion: 'increase_frequency'
        }
      };
    }

    if (actualFrequency > weeklyTarget * 1.5) { // More than 150% of target
      return {
        user_id: context.userId,
        title: "Consider Adding Recovery Days",
        description: "You've been very active! Make sure to include adequate rest days for optimal recovery.",
        type: 'recovery',
        reason: "High workout frequency detected",
        confidence_score: 0.7,
        metadata: { 
          current_frequency: actualFrequency,
          target_frequency: weeklyTarget,
          suggestion: 'add_recovery'
        }
      };
    }

    return null;
  }

  private static analyzeMuscleGroupBalance(context: RecommendationContext) {
    const { exerciseProgress } = context;
    
    // Add proper type checking
    if (!Array.isArray(exerciseProgress) || exerciseProgress.length === 0) {
      return null;
    }
    
    // Categorize exercises by muscle groups
    const muscleGroups = {
      chest: ['bench press', 'push up', 'chest press', 'incline press'],
      back: ['pull up', 'row', 'lat pulldown', 'deadlift'],
      legs: ['squat', 'lunge', 'leg press', 'calf raise'],
      shoulders: ['shoulder press', 'lateral raise', 'front raise'],
      arms: ['bicep curl', 'tricep extension', 'hammer curl']
    };

    const groupActivity = Object.keys(muscleGroups).reduce((acc, group) => {
      acc[group] = 0;
      return acc;
    }, {} as Record<string, number>);

    exerciseProgress.forEach(exercise => {
      const exerciseName = exercise.exercise_name?.toLowerCase() || '';
      Object.entries(muscleGroups).forEach(([group, exercises]) => {
        if (exercises.some(ex => exerciseName.includes(ex))) {
          groupActivity[group]++;
        }
      });
    });

    // Find imbalances
    const avgActivity = Object.values(groupActivity).reduce((sum, count) => sum + count, 0) / Object.keys(groupActivity).length;
    const underworkedGroups = Object.entries(groupActivity)
      .filter(([group, count]) => count < avgActivity * 0.5)
      .map(([group]) => group);

    if (underworkedGroups.length > 0) {
      return {
        user_id: context.userId,
        title: `Focus on ${underworkedGroups.join(' and ').toUpperCase()}`,
        description: `Your ${underworkedGroups.join(' and ')} could use more attention for better muscle balance.`,
        type: 'exercise_variation',
        reason: "Muscle group imbalance detected",
        confidence_score: 0.75,
        metadata: { 
          underworked_groups: underworkedGroups,
          activity_breakdown: groupActivity
        }
      };
    }

    return null;
  }

  private static analyzeProgressionPatterns(context: RecommendationContext) {
    const { exerciseProgress } = context;
    
    // Add proper type checking
    if (!Array.isArray(exerciseProgress) || exerciseProgress.length === 0) {
      return null;
    }
    
    // Group by exercise and check for stagnation
    const exerciseGroups = exerciseProgress.reduce((acc, record) => {
      const exerciseName = record.exercise_name;
      if (!exerciseName) return acc;
      
      if (!acc[exerciseName]) {
        acc[exerciseName] = [];
      }
      acc[exerciseName].push(record);
      return acc;
    }, {} as Record<string, any[]>);

    const stagnantExercises = Object.entries(exerciseGroups)
      .filter(([name, records]) => {
        if (records.length < 3) return false;
        
        const sorted = records.sort((a, b) => new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime());
        const recent = sorted.slice(0, 3);
        
        // Check if weight/reps haven't improved
        const weights = recent.map(r => r.max_weight || 0);
        const maxWeight = Math.max(...weights);
        const minWeight = Math.min(...weights);
        
        return maxWeight - minWeight < maxWeight * 0.05; // Less than 5% improvement
      })
      .map(([name]) => name);

    if (stagnantExercises.length > 0) {
      return {
        user_id: context.userId,
        title: "Progressive Overload Needed",
        description: `Your ${stagnantExercises.slice(0, 2).join(' and ')} performance has plateaued. Time to increase the challenge!`,
        type: 'progression',
        reason: "Performance plateau detected",
        confidence_score: 0.85,
        metadata: { 
          stagnant_exercises: stagnantExercises,
          suggestion: 'increase_weight_or_reps'
        }
      };
    }

    return null;
  }

  private static analyzeRecoveryPatterns(context: RecommendationContext) {
    const { workoutHistory } = context;
    
    if (!Array.isArray(workoutHistory) || workoutHistory.length < 3) return null;

    // Check for consecutive workout days without rest
    const workoutDates = workoutHistory
      .map(w => new Date(w.date))
      .sort((a, b) => b.getTime() - a.getTime());

    let consecutiveDays = 0;
    let maxConsecutive = 0;

    for (let i = 1; i < workoutDates.length; i++) {
      const dayDiff = (workoutDates[i - 1].getTime() - workoutDates[i].getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        consecutiveDays++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
      } else {
        consecutiveDays = 0;
      }
    }

    if (maxConsecutive >= 5) {
      return {
        user_id: context.userId,
        title: "Rest Day Recommendation",
        description: "You've been working out consecutively for several days. Consider taking a rest day for optimal recovery.",
        type: 'recovery',
        reason: "Insufficient recovery time detected",
        confidence_score: 0.8,
        metadata: { 
          consecutive_days: maxConsecutive,
          suggestion: 'schedule_rest_day'
        }
      };
    }

    return null;
  }
}
