
import { supabase } from '@/integrations/supabase/client';
import { WorkoutRecommendation } from '@/types/fitness/recommendations';
import { IntelligentRecommendationEngine } from './intelligentRecommendationEngine';
import { AdaptiveWorkoutEngine } from './adaptiveWorkoutEngine';

export const fetchUserRecommendations = async (userId: string): Promise<WorkoutRecommendation[]> => {
  const { data, error } = await supabase
    .from('workout_recommendations')
    .select('*')
    .eq('user_id', userId)
    .eq('dismissed', false)
    .eq('applied', false)
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
    .order('confidence_score', { ascending: false });

  if (error) throw error;
  
  return (data || []).map(item => ({
    id: item.id,
    user_id: item.user_id,
    title: item.title,
    description: item.description || '',
    type: item.type,
    reason: item.reason || '',
    confidence_score: item.confidence_score || 0,
    metadata: item.metadata || {},
    suggested_at: item.suggested_at || '',
    applied: item.applied || false,
    applied_at: item.applied_at || '',
    dismissed: item.dismissed || false,
    dismissed_at: item.dismissed_at || '',
    expires_at: item.expires_at || '',
    created_at: item.created_at || '',
    updated_at: item.updated_at || ''
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
    .eq('user_id', userId);

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
      user_id: userId,
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
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (currentPlan) {
    // Create variation of current plan
    const variation = await AdaptiveWorkoutEngine.createWorkoutVariation(userId, currentPlan);
    
    await supabase
      .from('workout_plans')
      .insert({
        user_id: userId,
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
    .eq('user_id', userId)
    .single();

  const frequency = userPreferences?.preferred_workout_frequency || 3;
  const duration = userPreferences?.preferred_workout_duration || 45;

  // Create basic workout plan based on recommendation
  const workoutPlan = await AdaptiveWorkoutEngine.createWorkoutVariation(userId, null);

  await supabase
    .from('workout_plans')
    .insert({
      user_id: userId,
      name: 'Recommended Workout Plan',
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
      user_id: userId,
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
    .eq('user_id', userId);

  if (error) throw error;
};

export const generateRecommendations = async (userId: string) => {
  try {
    return await IntelligentRecommendationEngine.generatePersonalizedRecommendations(userId);
  } catch (error) {
    console.error('Error generating intelligent recommendations:', error);
    throw error;
  }
};

export const getDifficultyAdjustments = async (userId: string) => {
  return await AdaptiveWorkoutEngine.analyzeDifficultyAdjustments(userId);
};

export const createPersonalizedVariation = async (userId: string, baseWorkoutPlan?: any) => {
  return await AdaptiveWorkoutEngine.createWorkoutVariation(userId, baseWorkoutPlan);
};
