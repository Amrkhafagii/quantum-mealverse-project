
import { supabase } from '../integrations/supabase/client';
import { WorkoutRecommendation, WorkoutLog, UserMeasurement } from '@/types/fitness';

/**
 * Fetch AI-generated recommendations for a user
 */
export const getUserRecommendations = async (userId: string): Promise<{ data: WorkoutRecommendation[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workout_recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('dismissed', false)
      .order('suggested_at', { ascending: false });
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return { data: null, error };
  }
};

/**
 * Apply a recommendation
 */
export const applyRecommendation = async (recommendationId: string): Promise<{ success: boolean, error: any }> => {
  try {
    const { error } = await supabase
      .from('workout_recommendations')
      .update({
        applied: true,
        applied_at: new Date().toISOString()
      })
      .eq('id', recommendationId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error applying recommendation:', error);
    return { success: false, error };
  }
};

/**
 * Dismiss a recommendation
 */
export const dismissRecommendation = async (recommendationId: string): Promise<{ success: boolean, error: any }> => {
  try {
    const { error } = await supabase
      .from('workout_recommendations')
      .update({
        dismissed: true
      })
      .eq('id', recommendationId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error dismissing recommendation:', error);
    return { success: false, error };
  }
};

/**
 * Generate recommendations based on user activity and profile
 * In a real app, this might call a machine learning service or OpenAI
 * For now, we'll use a rule-based approach
 */
export const generateRecommendations = async (userId: string): Promise<{ success: boolean, error: any }> => {
  try {
    // 1. Get user's recent workout history
    const { data: workoutLogs, error: workoutError } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10);
    
    if (workoutError) throw workoutError;
    
    // 2. Get user's measurements
    const { data: measurements, error: measurementError } = await supabase
      .from('user_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5);
    
    if (measurementError) throw measurementError;
    
    // 3. Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('fitness_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (profileError) throw profileError;
    
    // Generate recommendations based on the data
    const recommendations = await analyzeUserDataForRecommendations(
      userId,
      workoutLogs || [],
      measurements || [],
      profile
    );
    
    // Insert recommendations into the database
    if (recommendations.length > 0) {
      const { error } = await supabase
        .from('workout_recommendations')
        .insert(recommendations);
      
      if (error) throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return { success: false, error };
  }
};

/**
 * Analyzes user data to generate personalized recommendations
 * This is a simplified version that would be much more sophisticated in a real app
 */
const analyzeUserDataForRecommendations = async (
  userId: string,
  workoutLogs: any[],
  measurements: any[],
  profile: any
): Promise<WorkoutRecommendation[]> => {
  const recommendations: WorkoutRecommendation[] = [];
  const now = new Date().toISOString();
  
  // Check workout consistency
  if (workoutLogs.length > 0) {
    const latestWorkout = new Date(workoutLogs[0].date);
    const today = new Date();
    const daysSinceLastWorkout = Math.floor((today.getTime() - latestWorkout.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastWorkout >= 3) {
      recommendations.push({
        id: crypto.randomUUID(),
        user_id: userId,
        type: 'plan',
        title: 'Time to get back on track',
        description: `It's been ${daysSinceLastWorkout} days since your last workout. Schedule a session today to maintain momentum.`,
        reason: 'Analysis of your workout frequency shows a recent gap in activity.',
        confidence_score: 90,
        suggested_at: now,
        applied: false,
        dismissed: false
      });
    }
  }
  
  // Check for overtraining
  if (workoutLogs.length >= 3) {
    const recentLogs = workoutLogs.slice(0, 3);
    const allIntense = recentLogs.every(log => 
      (log.duration >= 45 || (log.calories_burned && log.calories_burned >= 300))
    );
    
    if (allIntense) {
      recommendations.push({
        id: crypto.randomUUID(),
        user_id: userId,
        type: 'rest',
        title: 'Recovery day recommended',
        description: 'You\'ve had several intense workouts recently. Consider a recovery day or light activity.',
        reason: 'Analysis of your recent workout intensity suggests potential for overtraining.',
        confidence_score: 85,
        suggested_at: now,
        applied: false,
        dismissed: false
      });
    }
  }
  
  // Check for progressive overload opportunity
  if (workoutLogs.length >= 5) {
    recommendations.push({
      id: crypto.randomUUID(),
      user_id: userId,
      type: 'adjustment',
      title: 'Increase workout intensity',
      description: 'You\'ve been consistent with your routine. Try increasing weights or adding an extra set.',
      reason: 'Consistent performance at the same level indicates readiness for progressive overload.',
      confidence_score: 80,
      suggested_at: now,
      applied: false,
      dismissed: false
    });
  }
  
  // Weight trend analysis
  if (measurements.length >= 2) {
    const latestWeight = measurements[0].weight;
    const previousWeight = measurements[1].weight;
    const weightChange = latestWeight - previousWeight;
    
    if (profile && profile.goal_weight) {
      const goalWeight = profile.goal_weight;
      
      if (weightChange > 0 && goalWeight < latestWeight) {
        // Weight going up but goal is to lose weight
        recommendations.push({
          id: crypto.randomUUID(),
          user_id: userId,
          type: 'plan',
          title: 'Adjust nutrition for weight goals',
          description: 'Your weight has increased recently, which doesn\'t align with your weight loss goal.',
          reason: 'Recent measurements show a trend away from your stated weight goal.',
          confidence_score: 75,
          suggested_at: now,
          applied: false,
          dismissed: false
        });
      } else if (weightChange < 0 && goalWeight > latestWeight) {
        // Weight going down but goal is to gain weight
        recommendations.push({
          id: crypto.randomUUID(),
          user_id: userId,
          type: 'plan',
          title: 'Increase caloric intake',
          description: 'Your weight has decreased recently, which doesn\'t align with your weight gain goal.',
          reason: 'Recent measurements show a trend away from your stated weight goal.',
          confidence_score: 75,
          suggested_at: now,
          applied: false,
          dismissed: false
        });
      }
    }
  }
  
  // Exercise variety
  if (workoutLogs.length >= 3) {
    // In a real app, we'd analyze the exercises in each workout
    // For now, just add a generic recommendation
    recommendations.push({
      id: crypto.randomUUID(),
      user_id: userId,
      type: 'exercise',
      title: 'Add variety to your routine',
      description: 'Try incorporating some new exercises to target different muscle groups and avoid plateaus.',
      reason: 'Analysis suggests potential benefit from increased exercise variety.',
      confidence_score: 70,
      suggested_at: now,
      applied: false,
      dismissed: false
    });
  }
  
  return recommendations;
};
