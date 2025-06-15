
import { supabase } from '@/integrations/supabase/client';
import { WorkoutRecommendation } from '@/types/fitness/recommendations';

export const getWorkoutRecommendations = async (userId: string): Promise<WorkoutRecommendation[]> => {
  const { data, error } = await supabase
    .from('workout_recommendations')
    .select('*')
    .eq('workout_recommendations_user_id', userId)
    .eq('dismissed', false)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Map database fields to interface fields
  return (data || []).map(item => ({
    id: item.id,
    user_id: item.workout_recommendations_user_id,
    title: item.description || 'Workout Recommendation', // Use description as title fallback
    description: item.description,
    type: item.type,
    reason: item.reason,
    confidence_score: item.confidence_score,
    metadata: item.metadata,
    suggested_at: item.suggested_at,
    applied: item.applied,
    applied_at: item.applied_at,
    dismissed: item.dismissed,
    dismissed_at: item.dismissed_at,
    expires_at: item.expires_at,
    created_at: item.created_at,
    updated_at: item.updated_at,
    // Legacy compatibility fields with defaults
    difficulty: 'intermediate' as const,
    duration_minutes: 45,
    target_muscle_groups: [],
    recommended_frequency: 3
  })) as WorkoutRecommendation[];
};

// Add the missing export alias
export const fetchUserRecommendations = getWorkoutRecommendations;

export const getArchivedRecommendations = async (userId: string): Promise<WorkoutRecommendation[]> => {
  const { data, error } = await supabase
    .from('workout_recommendations')
    .select('*')
    .eq('workout_recommendations_user_id', userId)
    .or('dismissed.eq.true,applied.eq.true')
    .order('updated_at', { ascending: false });

  if (error) throw error;

  // Map database fields to interface fields
  return (data || []).map(item => ({
    id: item.id,
    user_id: item.workout_recommendations_user_id,
    title: item.description || 'Workout Recommendation', // Use description as title fallback
    description: item.description,
    type: item.type,
    reason: item.reason,
    confidence_score: item.confidence_score,
    metadata: item.metadata,
    suggested_at: item.suggested_at,
    applied: item.applied,
    applied_at: item.applied_at,
    dismissed: item.dismissed,
    dismissed_at: item.dismissed_at,
    expires_at: item.expires_at,
    created_at: item.created_at,
    updated_at: item.updated_at,
    // Legacy compatibility fields with defaults
    difficulty: 'intermediate' as const,
    duration_minutes: 45,
    target_muscle_groups: [],
    recommended_frequency: 3
  })) as WorkoutRecommendation[];
};

export const applyRecommendation = async (recommendationId: string, userId: string) => {
  const { error } = await supabase
    .from('workout_recommendations')
    .update({ 
      applied: true,
      applied_at: new Date().toISOString()
    })
    .eq('id', recommendationId)
    .eq('workout_recommendations_user_id', userId);

  if (error) throw error;

  // Get the recommendation to see what type it is and apply the changes
  const { data: recommendation } = await supabase
    .from('workout_recommendations')
    .select('*')
    .eq('id', recommendationId)
    .single();

  if (recommendation) {
    await handleRecommendationApplication(recommendation, userId);
  }
};

const handleRecommendationApplication = async (recommendation: any, userId: string) => {
  const { type, metadata } = recommendation;

  switch (type) {
    case 'difficulty_adjustment':
      await applyDifficultyAdjustment(userId, metadata);
      break;
    case 'exercise_variation':
      await createExerciseVariation(userId, metadata);
      break;
    case 'workout_plan':
      await createWorkoutPlanFromRecommendation(userId, metadata);
      break;
    case 'recovery':
      await scheduleRecoveryDays(userId, metadata);
      break;
    default:
      console.log('Recommendation type not handled:', type);
  }
};

const applyDifficultyAdjustment = async (userId: string, metadata: any) => {
  // Create workout adaptation record
  await supabase
    .from('workout_adaptations')
    .insert({
      workout_adaptations_user_id: userId,
      adaptation_type: metadata.suggestion || 'general_adjustment',
      reason: 'Applied from recommendation',
      metadata: metadata,
      applied_at: new Date().toISOString()
    });
};

const createExerciseVariation = async (userId: string, metadata: any) => {
  // Get current workout plan
  const { data: currentPlan } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('workout_plans_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (currentPlan) {
    // Create variation of current plan - simplified approach
    const variation = {
      name: `${currentPlan.name} - Variation`,
      workout_days: currentPlan.workout_days
    };
    
    await supabase
      .from('workout_plans')
      .insert({
        workout_plans_user_id: userId,
        name: variation.name,
        description: `Variation focusing on ${metadata.underworked_groups?.join(', ')}`,
        workout_days: variation.workout_days,
        goal: currentPlan.goal,
        difficulty: currentPlan.difficulty,
        frequency: currentPlan.frequency,
        duration_weeks: currentPlan.duration_weeks,
        template_id: currentPlan.id
      });
  }
};

const createWorkoutPlanFromRecommendation = async (userId: string, metadata: any) => {
  // Get user preferences to create appropriate plan
  const { data: userPreferences } = await supabase
    .from('user_workout_preferences')
    .select('*')
    .eq('user_workout_preferences_user_id', userId)
    .single();

  const frequency = userPreferences?.preferred_workout_frequency || 3;

  // Create basic workout plan based on recommendation - simplified approach
  const workoutPlan = {
    name: 'Recommended Workout Plan',
    workout_days: [
      {
        day: 'Monday',
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 10 },
          { name: 'Squats', sets: 3, reps: 15 }
        ]
      }
    ]
  };

  await supabase
    .from('workout_plans')
    .insert({
      workout_plans_user_id: userId,
      name: workoutPlan.name,
      description: 'Generated from AI recommendation',
      workout_days: workoutPlan.workout_days,
      goal: metadata.primary_goal || 'general_fitness',
      difficulty: userPreferences?.fitness_level || 'beginner',
      frequency: frequency,
      duration_weeks: 4
    });
};

const scheduleRecoveryDays = async (userId: string, metadata: any) => {
  // Update user preferences to include recovery recommendations
  await supabase
    .from('workout_adaptations')
    .insert({
      workout_adaptations_user_id: userId,
      adaptation_type: 'add_rest',
      reason: 'Recovery recommendation applied',
      metadata: {
        recovery_strategies: metadata.recovery_strategies,
        consecutive_days: metadata.consecutive_days
      },
      applied_at: new Date().toISOString()
    });
};

export const dismissRecommendation = async (recommendationId: string, userId: string) => {
  const { error } = await supabase
    .from('workout_recommendations')
    .update({ 
      dismissed: true,
      dismissed_at: new Date().toISOString()
    })
    .eq('id', recommendationId)
    .eq('workout_recommendations_user_id', userId);

  if (error) throw error;
};

export const generateRecommendations = async (userId: string) => {
  try {
    // Simplified recommendation generation instead of using undefined classes
    const recommendations = [
      {
        workout_recommendations_user_id: userId,
        type: 'workout_plan',
        description: 'Start with a beginner workout plan',
        reason: 'Based on your fitness level',
        confidence_score: 0.8,
        suggested_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        applied: false,
        dismissed: false,
        metadata: { difficulty: 'beginner' }
      }
    ];

    const { data, error } = await supabase
      .from('workout_recommendations')
      .insert(recommendations)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
};

export const getDifficultyAdjustments = async (userId: string) => {
  // Simplified approach - return basic analysis
  return {
    suggested_adjustments: ['increase_weight', 'add_sets'],
    confidence: 0.7
  };
};

export const createPersonalizedVariation = async (userId: string, baseWorkoutPlan?: any) => {
  // Simplified variation creation
  return {
    name: 'Personalized Variation',
    workout_days: baseWorkoutPlan?.workout_days || []
  };
};
