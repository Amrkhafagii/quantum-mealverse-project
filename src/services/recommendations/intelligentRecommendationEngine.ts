
import { supabase } from '@/integrations/supabase/client';

export interface RecommendationContext {
  userId: string;
  workoutHistory: any[];
  exerciseProgress: any[];
  userPreferences: any;
  fitnessGoals: any[];
  currentWorkoutPlan: any;
  userStats: any;
}

export interface WorkoutRecommendation {
  user_id: string;
  title: string;
  description: string;
  type: 'workout_plan' | 'exercise_variation' | 'difficulty_adjustment' | 'recovery' | 'progression' | 'general';
  reason: string;
  confidence_score: number;
  metadata: any;
}

export class IntelligentRecommendationEngine {
  static async generatePersonalizedRecommendations(userId: string): Promise<WorkoutRecommendation[]> {
    const context = await this.gatherUserContext(userId);
    const recommendations: WorkoutRecommendation[] = [];

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

    // Analyze goal alignment
    const goalRecommendation = this.analyzeGoalAlignment(context);
    if (goalRecommendation) recommendations.push(goalRecommendation);

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
            metadata: rec.metadata,
            suggested_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
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
      .gte('recorded_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_date', { ascending: false });

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

    // Get user stats
    const { data: userStats } = await supabase
      .from('user_workout_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    return {
      userId,
      workoutHistory: workoutHistory || [],
      exerciseProgress: exerciseProgress || [],
      userPreferences: userPreferences || {},
      fitnessGoals: fitnessGoals || [],
      currentWorkoutPlan,
      userStats: userStats || {}
    };
  }

  private static analyzeWorkoutFrequency(context: RecommendationContext): WorkoutRecommendation | null {
    const { workoutHistory, userPreferences, userId } = context;
    
    if (!Array.isArray(workoutHistory)) return null;
    
    const targetFrequency = userPreferences?.preferred_workout_frequency || 3;
    const actualFrequency = workoutHistory.length;
    const weeklyTarget = targetFrequency;

    if (actualFrequency < weeklyTarget * 0.7) {
      return {
        user_id: userId,
        title: "Increase Workout Frequency",
        description: `You've completed ${actualFrequency} workouts in the last 30 days. Try to aim for ${weeklyTarget} workouts per week to reach your fitness goals.`,
        type: 'workout_plan',
        reason: "Low workout frequency detected based on your preferences",
        confidence_score: 0.8,
        metadata: { 
          current_frequency: actualFrequency,
          target_frequency: weeklyTarget,
          suggestion: 'increase_frequency',
          action_items: [
            'Schedule specific workout times in your calendar',
            'Start with shorter 20-30 minute sessions',
            'Consider home workouts on busy days'
          ]
        }
      };
    }

    if (actualFrequency > weeklyTarget * 1.5) {
      return {
        user_id: userId,
        title: "Consider Adding Recovery Days",
        description: "You've been very active! Make sure to include adequate rest days for optimal recovery and preventing burnout.",
        type: 'recovery',
        reason: "High workout frequency detected - recovery important for progress",
        confidence_score: 0.75,
        metadata: { 
          current_frequency: actualFrequency,
          target_frequency: weeklyTarget,
          suggestion: 'add_recovery',
          action_items: [
            'Schedule 1-2 complete rest days per week',
            'Include light activities like walking or stretching',
            'Monitor energy levels and adjust accordingly'
          ]
        }
      };
    }

    return null;
  }

  private static analyzeMuscleGroupBalance(context: RecommendationContext): WorkoutRecommendation | null {
    const { exerciseProgress, userId } = context;
    
    if (!Array.isArray(exerciseProgress) || exerciseProgress.length === 0) {
      return null;
    }
    
    // Define muscle group categories with exercise patterns
    const muscleGroups = {
      chest: ['bench', 'push', 'chest', 'press', 'fly'],
      back: ['pull', 'row', 'lat', 'deadlift', 'chin'],
      legs: ['squat', 'lunge', 'leg', 'calf', 'quad', 'hamstring'],
      shoulders: ['shoulder', 'lateral', 'front', 'rear', 'deltoid'],
      arms: ['bicep', 'tricep', 'curl', 'extension', 'arm']
    };

    const groupActivity = Object.keys(muscleGroups).reduce((acc, group) => {
      acc[group] = 0;
      return acc;
    }, {} as Record<string, number>);

    // Count exercises per muscle group
    exerciseProgress.forEach(exercise => {
      const exerciseName = exercise.exercise_name?.toLowerCase() || '';
      if (!exerciseName) return;
      
      Object.entries(muscleGroups).forEach(([group, patterns]) => {
        if (patterns.some(pattern => exerciseName.includes(pattern))) {
          groupActivity[group]++;
        }
      });
    });

    // Find imbalances
    const totalExercises = Object.values(groupActivity).reduce((sum, count) => sum + count, 0);
    if (totalExercises === 0) return null;

    const avgActivity = totalExercises / Object.keys(groupActivity).length;
    const underworkedGroups = Object.entries(groupActivity)
      .filter(([group, count]) => count < avgActivity * 0.5)
      .map(([group]) => group);

    if (underworkedGroups.length > 0) {
      const primaryGroup = underworkedGroups[0];
      return {
        user_id: userId,
        title: `Focus on ${primaryGroup.charAt(0).toUpperCase() + primaryGroup.slice(1)} Training`,
        description: `Your ${underworkedGroups.join(' and ')} need more attention for balanced muscle development. Consider adding specific exercises for these areas.`,
        type: 'exercise_variation',
        reason: "Muscle group imbalance detected in workout patterns",
        confidence_score: 0.8,
        metadata: { 
          underworked_groups: underworkedGroups,
          activity_breakdown: groupActivity,
          suggested_exercises: this.getSuggestedExercises(underworkedGroups),
          action_items: [
            `Add 2-3 ${primaryGroup} exercises to your routine`,
            'Focus on proper form over heavy weight',
            'Consider dedicated muscle group days'
          ]
        }
      };
    }

    return null;
  }

  private static analyzeProgressionPatterns(context: RecommendationContext): WorkoutRecommendation | null {
    const { exerciseProgress, userId } = context;
    
    if (!Array.isArray(exerciseProgress) || exerciseProgress.length === 0) {
      return null;
    }
    
    // Group exercises by name and analyze progression
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
        if (!Array.isArray(records) || records.length < 3) return false;
        
        const sortedRecords = records.sort((a, b) => 
          new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime()
        );
        const recent = sortedRecords.slice(0, 3);
        
        // Check for weight progression
        const weights = recent.map(r => r.max_weight || 0).filter(w => w > 0);
        if (weights.length < 2) return false;
        
        const maxWeight = Math.max(...weights);
        const minWeight = Math.min(...weights);
        const improvement = (maxWeight - minWeight) / maxWeight;
        
        return improvement < 0.05; // Less than 5% improvement
      })
      .map(([name]) => name);

    if (stagnantExercises.length > 0) {
      const primaryExercise = stagnantExercises[0];
      return {
        user_id: userId,
        title: "Progressive Overload Needed",
        description: `Your ${primaryExercise} performance has plateaued. Time to challenge yourself with progressive overload techniques!`,
        type: 'progression',
        reason: "Performance plateau detected in key exercises",
        confidence_score: 0.85,
        metadata: { 
          stagnant_exercises: stagnantExercises.slice(0, 3),
          progression_strategies: [
            'Increase weight by 2.5-5%',
            'Add an extra rep to each set',
            'Include an additional set',
            'Try tempo variations (slower negatives)',
            'Incorporate pause reps'
          ],
          action_items: [
            'Track your lifts more consistently',
            'Focus on one progression method at a time',
            'Ensure adequate rest between sessions'
          ]
        }
      };
    }

    return null;
  }

  private static analyzeRecoveryPatterns(context: RecommendationContext): WorkoutRecommendation | null {
    const { workoutHistory, userId } = context;
    
    if (!Array.isArray(workoutHistory) || workoutHistory.length < 3) return null;

    // Check for consecutive workout days
    const workoutDates = workoutHistory
      .map(w => new Date(w.date))
      .sort((a, b) => b.getTime() - a.getTime());

    let maxConsecutive = 0;
    let currentConsecutive = 1;

    for (let i = 1; i < workoutDates.length; i++) {
      const dayDiff = (workoutDates[i - 1].getTime() - workoutDates[i].getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        currentConsecutive++;
      } else {
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
        currentConsecutive = 1;
      }
    }
    maxConsecutive = Math.max(maxConsecutive, currentConsecutive);

    if (maxConsecutive >= 5) {
      return {
        user_id: userId,
        title: "Recovery Day Needed",
        description: `You've been working out for ${maxConsecutive} consecutive days. Your muscles need rest to grow stronger and prevent injury.`,
        type: 'recovery',
        reason: "Insufficient recovery time between workout sessions",
        confidence_score: 0.9,
        metadata: { 
          consecutive_days: maxConsecutive,
          recovery_strategies: [
            'Take 1-2 complete rest days',
            'Include active recovery (light walking, stretching)',
            'Focus on sleep quality (7-9 hours)',
            'Stay hydrated and eat protein-rich foods'
          ],
          action_items: [
            'Schedule rest days in your workout plan',
            'Listen to your body for fatigue signals',
            'Consider massage or foam rolling'
          ]
        }
      };
    }

    return null;
  }

  private static analyzeGoalAlignment(context: RecommendationContext): WorkoutRecommendation | null {
    const { fitnessGoals, workoutHistory, exerciseProgress, userId } = context;
    
    if (!Array.isArray(fitnessGoals) || fitnessGoals.length === 0) {
      return {
        user_id: userId,
        title: "Set Your Fitness Goals",
        description: "Setting specific, measurable goals will help optimize your workout recommendations and track your progress effectively.",
        type: 'general',
        reason: "No active fitness goals found",
        confidence_score: 0.7,
        metadata: {
          suggested_goals: [
            'Weight loss target',
            'Strength improvement',
            'Muscle building',
            'Endurance enhancement',
            'Body composition changes'
          ],
          action_items: [
            'Define specific, measurable goals',
            'Set realistic timelines',
            'Track progress regularly'
          ]
        }
      };
    }

    // Analyze if current workouts align with goals
    const primaryGoal = fitnessGoals[0];
    const goalType = primaryGoal.goal_type;
    
    if (!Array.isArray(workoutHistory) || workoutHistory.length === 0) {
      return {
        user_id: userId,
        title: "Start Your Fitness Journey",
        description: `Your goal is ${goalType}. Let's create a workout plan that aligns with this objective!`,
        type: 'workout_plan',
        reason: "No workout history found but goals are set",
        confidence_score: 0.8,
        metadata: {
          primary_goal: goalType,
          recommended_focus: this.getRecommendedFocus(goalType),
          action_items: [
            'Start with 2-3 workouts per week',
            'Focus on basic compound movements',
            'Track your workouts consistently'
          ]
        }
      };
    }

    return null;
  }

  private static getSuggestedExercises(underworkedGroups: string[]): Record<string, string[]> {
    const exerciseMap: Record<string, string[]> = {
      chest: ['Push-ups', 'Bench Press', 'Chest Fly', 'Incline Press'],
      back: ['Pull-ups', 'Rows', 'Lat Pulldowns', 'Deadlifts'],
      legs: ['Squats', 'Lunges', 'Leg Press', 'Calf Raises'],
      shoulders: ['Shoulder Press', 'Lateral Raises', 'Front Raises', 'Rear Delt Fly'],
      arms: ['Bicep Curls', 'Tricep Extensions', 'Hammer Curls', 'Dips']
    };

    return underworkedGroups.reduce((acc, group) => {
      acc[group] = exerciseMap[group] || [];
      return acc;
    }, {} as Record<string, string[]>);
  }

  private static getRecommendedFocus(goalType: string): string[] {
    const focusMap: Record<string, string[]> = {
      weight_loss: ['High-intensity cardio', 'Circuit training', 'Full-body workouts'],
      strength: ['Progressive overload', 'Compound movements', 'Lower rep ranges'],
      muscle_building: ['Hypertrophy training', 'Split routines', 'Progressive overload'],
      endurance: ['Cardiovascular training', 'High rep ranges', 'Circuit training'],
      general_fitness: ['Balanced approach', 'Variety in exercises', 'Consistent routine']
    };

    return focusMap[goalType] || focusMap['general_fitness'];
  }
}
