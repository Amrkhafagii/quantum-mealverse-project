
import { supabase } from '@/integrations/supabase/client';

export interface AdaptiveParameters {
  userId: string;
  exerciseName: string;
  currentWeight?: number;
  currentReps?: number;
  currentSets?: number;
  performanceHistory: any[];
  userPreferences: any;
}

export interface DifficultyAdjustment {
  type: 'increase_weight' | 'increase_reps' | 'increase_sets' | 'decrease_weight' | 'decrease_reps' | 'add_rest';
  currentValue: number;
  suggestedValue: number;
  reason: string;
  confidence: number;
}

export class AdaptiveWorkoutEngine {
  static async analyzeDifficultyAdjustments(userId: string): Promise<DifficultyAdjustment[]> {
    const adjustments: DifficultyAdjustment[] = [];
    
    // Get recent exercise progress
    const { data: progressData } = await supabase
      .from('exercise_progress')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_date', new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_date', { ascending: false });

    if (!progressData || progressData.length === 0) return adjustments;

    // Get user preferences
    const { data: userPreferences } = await supabase
      .from('user_workout_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Group by exercise
    const exerciseGroups = progressData.reduce((acc, record) => {
      const exerciseName = record.exercise_name;
      if (!exerciseName) return acc;
      
      if (!acc[exerciseName]) {
        acc[exerciseName] = [];
      }
      acc[exerciseName].push(record);
      return acc;
    }, {} as Record<string, any[]>);

    // Analyze each exercise for difficulty adjustments
    Object.entries(exerciseGroups).forEach(([exerciseName, records]) => {
      if (records.length < 2) return;

      const adjustment = this.calculateDifficultyAdjustment({
        userId,
        exerciseName,
        performanceHistory: records,
        userPreferences: userPreferences || {}
      });

      if (adjustment) {
        adjustments.push(adjustment);
      }
    });

    return adjustments;
  }

  private static calculateDifficultyAdjustment(params: AdaptiveParameters): DifficultyAdjustment | null {
    const { exerciseName, performanceHistory, userPreferences } = params;
    
    if (performanceHistory.length < 2) return null;

    // Sort by date (most recent first)
    const sortedHistory = performanceHistory.sort((a, b) => 
      new Date(b.recorded_date).getTime() - new Date(a.recorded_date).getTime()
    );

    const recent = sortedHistory.slice(0, 3);
    const latest = recent[0];
    
    // Analyze weight progression
    const weights = recent.map(r => r.max_weight || 0).filter(w => w > 0);
    const reps = recent.map(r => r.max_reps || 0).filter(r => r > 0);
    
    if (weights.length === 0 || reps.length === 0) return null;

    const currentWeight = weights[0];
    const currentReps = reps[0];
    const intensityPreference = userPreferences.intensity_preference || 'moderate';

    // Check for consistent performance (ready for progression)
    const isConsistent = this.checkConsistentPerformance(recent);
    
    if (isConsistent && this.shouldIncreaseWeight(recent, intensityPreference)) {
      const increment = this.calculateWeightIncrement(currentWeight, exerciseName);
      return {
        type: 'increase_weight',
        currentValue: currentWeight,
        suggestedValue: currentWeight + increment,
        reason: 'Consistent performance indicates readiness for weight progression',
        confidence: 0.85
      };
    }

    // Check if struggling (need to decrease difficulty)
    if (this.isStruggling(recent)) {
      return {
        type: 'decrease_weight',
        currentValue: currentWeight,
        suggestedValue: currentWeight * 0.9, // 10% reduction
        reason: 'Recent performance suggests current weight may be too challenging',
        confidence: 0.75
      };
    }

    // Check for rep progression opportunity
    if (currentReps >= 12 && intensityPreference !== 'low') {
      const increment = this.calculateWeightIncrement(currentWeight, exerciseName);
      return {
        type: 'increase_weight',
        currentValue: currentWeight,
        suggestedValue: currentWeight + increment,
        reason: 'High rep range achieved - ready for weight increase',
        confidence: 0.8
      };
    }

    return null;
  }

  private static checkConsistentPerformance(recentSessions: any[]): boolean {
    if (recentSessions.length < 2) return false;

    // Check if user completed target reps in recent sessions
    const completionRates = recentSessions.map(session => {
      const maxReps = session.max_reps || 0;
      const targetReps = 8; // Assume 8 as baseline target
      return maxReps >= targetReps;
    });

    // Consider consistent if 2/3 or more sessions met target
    const successRate = completionRates.filter(Boolean).length / completionRates.length;
    return successRate >= 0.67;
  }

  private static shouldIncreaseWeight(recentSessions: any[], intensityPreference: string): boolean {
    const latest = recentSessions[0];
    const maxReps = latest.max_reps || 0;

    // Different thresholds based on intensity preference
    const thresholds = {
      low: 15,
      moderate: 12,
      high: 10
    };

    const threshold = thresholds[intensityPreference as keyof typeof thresholds] || 12;
    return maxReps >= threshold;
  }

  private static isStruggling(recentSessions: any[]): boolean {
    if (recentSessions.length < 2) return false;

    // Check for declining performance
    const repsDecline = recentSessions.slice(0, 2).every((session, index) => {
      if (index === 0) return true;
      const current = session.max_reps || 0;
      const previous = recentSessions[index - 1].max_reps || 0;
      return current < previous * 0.9; // 10% decline
    });

    return repsDecline;
  }

  private static calculateWeightIncrement(currentWeight: number, exerciseName: string): number {
    // Different increment strategies based on exercise type
    const lowerBodyExercises = ['squat', 'deadlift', 'leg press'];
    const upperBodyExercises = ['bench', 'press', 'curl', 'row'];
    
    const exerciseNameLower = exerciseName.toLowerCase();
    
    if (lowerBodyExercises.some(ex => exerciseNameLower.includes(ex))) {
      // Larger increments for lower body
      return Math.max(2.5, currentWeight * 0.025); // 2.5% or minimum 2.5
    } else if (upperBodyExercises.some(ex => exerciseNameLower.includes(ex))) {
      // Smaller increments for upper body
      return Math.max(1.25, currentWeight * 0.0125); // 1.25% or minimum 1.25
    }
    
    // Default increment
    return Math.max(1.25, currentWeight * 0.02); // 2% or minimum 1.25
  }

  static async createWorkoutVariation(userId: string, baseWorkoutPlan: any): Promise<any> {
    // Get user preferences and progress
    const { data: userPreferences } = await supabase
      .from('user_workout_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: recentProgress } = await supabase
      .from('exercise_progress')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

    if (!baseWorkoutPlan || !baseWorkoutPlan.workout_days) {
      return this.generateDefaultVariation(userPreferences);
    }

    const variations = JSON.parse(JSON.stringify(baseWorkoutPlan.workout_days));
    
    // Apply variations based on user data
    Object.keys(variations).forEach(dayKey => {
      const day = variations[dayKey];
      if (day.exercises) {
        day.exercises = day.exercises.map((exercise: any) => {
          return this.varyExercise(exercise, userPreferences, recentProgress);
        });
      }
    });

    return {
      ...baseWorkoutPlan,
      workout_days: variations,
      name: `${baseWorkoutPlan.name} - Variation`,
      is_variation: true,
      base_plan_id: baseWorkoutPlan.id
    };
  }

  private static varyExercise(exercise: any, userPreferences: any, recentProgress: any[]): any {
    const exerciseProgress = recentProgress?.filter(p => 
      p.exercise_name?.toLowerCase().includes(exercise.name?.toLowerCase())
    ) || [];

    // Apply difficulty adjustments based on progress
    if (exerciseProgress.length > 0) {
      const avgWeight = exerciseProgress.reduce((sum, p) => sum + (p.max_weight || 0), 0) / exerciseProgress.length;
      const avgReps = exerciseProgress.reduce((sum, p) => sum + (p.max_reps || 0), 0) / exerciseProgress.length;
      
      // Adjust sets/reps based on performance
      if (avgReps >= 12) {
        exercise.reps = Math.max(6, Math.floor(avgReps * 0.75));
        exercise.weight_progression = '+2.5kg';
      } else if (avgReps <= 6) {
        exercise.reps = Math.min(12, Math.ceil(avgReps * 1.25));
        exercise.weight_progression = 'maintain';
      }
    }

    // Add equipment alternatives based on available equipment
    if (userPreferences?.available_equipment) {
      exercise.alternatives = this.getEquipmentAlternatives(exercise, userPreferences.available_equipment);
    }

    return exercise;
  }

  private static generateDefaultVariation(userPreferences: any): any {
    const fitnessLevel = userPreferences?.fitness_level || 'beginner';
    const availableEquipment = userPreferences?.available_equipment || ['bodyweight'];
    
    return {
      name: 'Personalized Workout Plan',
      description: 'Generated based on your preferences and available equipment',
      workout_days: this.createDefaultWorkoutDays(fitnessLevel, availableEquipment),
      is_variation: true
    };
  }

  private static createDefaultWorkoutDays(fitnessLevel: string, equipment: string[]): any {
    const hasWeights = equipment.includes('dumbbells') || equipment.includes('barbells');
    const hasCardio = equipment.includes('treadmill') || equipment.includes('stationary_bike');
    
    if (fitnessLevel === 'beginner') {
      return {
        day1: {
          name: 'Full Body Basics',
          exercises: hasWeights 
            ? [
                { name: 'Goblet Squat', sets: 3, reps: 8, rest: 60 },
                { name: 'Push-ups', sets: 3, reps: 5, rest: 60 },
                { name: 'Dumbbell Row', sets: 3, reps: 8, rest: 60 },
                { name: 'Plank', sets: 3, reps: '30s', rest: 60 }
              ]
            : [
                { name: 'Bodyweight Squat', sets: 3, reps: 10, rest: 60 },
                { name: 'Push-ups', sets: 3, reps: 5, rest: 60 },
                { name: 'Lunges', sets: 3, reps: 8, rest: 60 },
                { name: 'Plank', sets: 3, reps: '30s', rest: 60 }
              ]
        },
        day2: {
          name: 'Active Recovery',
          exercises: [
            { name: 'Walking', sets: 1, reps: '20min', rest: 0 },
            { name: 'Stretching', sets: 1, reps: '10min', rest: 0 }
          ]
        }
      };
    }
    
    // Add intermediate/advanced variations...
    return {};
  }

  private static getEquipmentAlternatives(exercise: any, availableEquipment: string[]): string[] {
    const alternatives: Record<string, Record<string, string>> = {
      'bench press': {
        'dumbbells': 'Dumbbell Bench Press',
        'bodyweight': 'Push-ups'
      },
      'squat': {
        'dumbbells': 'Goblet Squat',
        'bodyweight': 'Bodyweight Squat'
      },
      'deadlift': {
        'dumbbells': 'Dumbbell Deadlift',
        'bodyweight': 'Romanian Deadlift (bodyweight)'
      }
    };

    const exerciseName = exercise.name?.toLowerCase() || '';
    const exerciseAlts = alternatives[exerciseName] || {};
    
    return availableEquipment
      .map(equipment => exerciseAlts[equipment])
      .filter(Boolean);
  }
}
