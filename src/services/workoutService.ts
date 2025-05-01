
import { supabase } from '@/integrations/supabase/client';
import { 
  WorkoutPlan, 
  WorkoutLog, 
  WorkoutHistoryItem, 
  UserWorkoutStats, 
  WorkoutSchedule 
} from '@/types/fitness';

/**
 * Saves a workout plan to the database
 */
export const saveWorkoutPlan = async (plan: WorkoutPlan): Promise<{ data: WorkoutPlan | null, error: any }> => {
  try {
    // Cast to any to bypass type checking since we're extending the schema
    const { data, error } = await (supabase as any)
      .from('workout_plans')
      .insert(plan)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as WorkoutPlan, error: null };
  } catch (error) {
    console.error('Error saving workout plan:', error);
    return { data: null, error };
  }
};

/**
 * Gets all workout plans for a user
 */
export const getWorkoutPlans = async (userId: string): Promise<{ data: WorkoutPlan[] | null, error: any }> => {
  try {
    // First try to get user's saved workout plans
    const { data, error } = await (supabase as any)
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    
    // If no user-created plans, return default templates
    if (!data || data.length === 0) {
      const defaultTemplates = generateDefaultTemplates(userId);
      return { data: defaultTemplates, error: null };
    }
    
    return { data: data as WorkoutPlan[], error: null };
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    return { data: null, error };
  }
};

/**
 * Logs a completed workout
 */
export const logWorkout = async (workoutLog: WorkoutLog): Promise<{ data: WorkoutLog | null, error: any }> => {
  try {
    // Insert workout log
    const { data, error } = await (supabase as any)
      .from('workout_logs')
      .insert(workoutLog)
      .select()
      .single();
    
    if (error) throw error;

    // Update workout history
    await updateWorkoutHistory(data as WorkoutLog);
    
    // Update user streak
    await updateUserStreak(workoutLog.user_id);
    
    return { data: data as WorkoutLog, error: null };
  } catch (error) {
    console.error('Error logging workout:', error);
    return { data: null, error };
  }
};

/**
 * Updates the workout history table
 */
const updateWorkoutHistory = async (workoutLog: WorkoutLog): Promise<void> => {
  try {
    // Get workout plan details to extract plan name and day name
    const { data: planData, error: planError } = await (supabase as any)
      .from('workout_plans')
      .select('name, workout_days')
      .eq('id', workoutLog.workout_plan_id)
      .single();

    if (planError) throw planError;

    if (!planData) {
      throw new Error('Workout plan not found');
    }
    
    // Find the workout day name by counting completed exercises per day
    // This is a simplistic approach - you might need a better way to track which day was completed
    const workoutDays = planData.workout_days as any[];
    const dayName = workoutDays[0]?.day_name || 'Unknown Day';
    
    const totalExercises = workoutLog.completed_exercises.length;
    const exercisesCompleted = workoutLog.completed_exercises.filter(ex => 
      ex.sets_completed && ex.sets_completed.length > 0
    ).length;
    
    const historyItem: WorkoutHistoryItem = {
      id: crypto.randomUUID(),
      user_id: workoutLog.user_id,
      date: workoutLog.date,
      workout_log_id: workoutLog.id,
      workout_plan_name: planData.name,
      workout_day_name: dayName,
      duration: workoutLog.duration,
      exercises_completed: exercisesCompleted,
      total_exercises: totalExercises,
      calories_burned: workoutLog.calories_burned
    };
    
    await (supabase as any).from('workout_history').insert(historyItem);
  } catch (error) {
    console.error('Error updating workout history:', error);
  }
};

/**
 * Updates user's workout streak
 */
const updateUserStreak = async (userId: string): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Get user's current streak
    const { data, error } = await (supabase as any)
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('streak_type', 'workout')
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }
    
    let currentStreak = 1;
    let longestStreak = 1;
    
    if (data) {
      const lastActivityDate = new Date(data.last_activity_date);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If last activity was yesterday, increment streak
      if (lastActivityDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        currentStreak = data.currentStreak + 1;
        longestStreak = Math.max(currentStreak, data.longestStreak);
      } 
      // If last activity was today, don't change streak
      else if (lastActivityDate.toISOString().split('T')[0] === today) {
        currentStreak = data.currentStreak;
        longestStreak = data.longestStreak;
      } 
      // Otherwise reset streak to 1
      else {
        currentStreak = 1;
        longestStreak = Math.max(1, data.longestStreak);
      }
    }
    
    // Upsert the streak record
    await (supabase as any)
      .from('user_streaks')
      .upsert({
        user_id: userId,
        currentStreak,
        longestStreak,
        last_activity_date: today,
        streak_type: 'workout'
      });
  } catch (error) {
    console.error('Error updating user streak:', error);
  }
};

/**
 * Gets workout history for a user
 */
export const getWorkoutHistory = async (userId: string, dateFilter?: string): Promise<{ data: WorkoutHistoryItem[] | null, error: any }> => {
  try {
    let query = (supabase as any)
      .from('workout_history')
      .select('*')
      .eq('user_id', userId);
    
    if (dateFilter) {
      // Example: filter by month/year
      // dateFilter format could be 'YYYY-MM'
      query = query.like('date', `${dateFilter}%`);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) throw error;
    
    return { data: data as WorkoutHistoryItem[], error: null };
  } catch (error) {
    console.error('Error fetching workout history:', error);
    return { data: null, error };
  }
};

/**
 * Gets workout statistics for a user
 */
export const getWorkoutStats = async (userId: string): Promise<{ data: UserWorkoutStats | null, error: any }> => {
  try {
    // Get workout history
    const { data: historyData, error: historyError } = await (supabase as any)
      .from('workout_history')
      .select('*')
      .eq('user_id', userId);
    
    if (historyError) throw historyError;
    
    // Get user streak
    const { data: streakData, error: streakError } = await (supabase as any)
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('streak_type', 'workout')
      .single();
    
    if (streakError && streakError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw streakError;
    }
    
    // Calculate stats
    const totalWorkouts = historyData ? historyData.length : 0;
    const total_time = historyData ? historyData.reduce((sum, h) => sum + h.duration, 0) : 0;
    const total_calories = historyData ? historyData.reduce((sum, h) => sum + (h.calories_burned || 0), 0) : 0;
    
    // If no history data, return default stats
    if (!historyData || historyData.length === 0) {
      return {
        data: {
          user_id: userId,
          totalWorkouts: 0,
          total_time: 0,
          total_calories: 0,
          favorite_exercise: 'None yet',
          strongest_exercise: {
            exercise_id: '',
            exercise_name: 'None yet',
            max_weight: 0
          },
          most_improved_exercise: {
            exercise_id: '',
            exercise_name: 'None yet',
            improvement_percentage: 0
          },
          currentStreak: streakData?.currentStreak || 0,
          longestStreak: streakData?.longestStreak || 0,
          weekly_goal_completion: 0
        },
        error: null
      };
    }
    
    // For more complex stats like favorite exercise, additional queries would be needed
    // This is a simplified version
    const stats: UserWorkoutStats = {
      user_id: userId,
      totalWorkouts,
      total_time,
      total_calories,
      favorite_exercise: 'Bench Press', // This would need to be calculated from workout logs
      strongest_exercise: {
        exercise_id: 'ex1',
        exercise_name: 'Bench Press',
        max_weight: 225
      },
      most_improved_exercise: {
        exercise_id: 'ex1',
        exercise_name: 'Bench Press',
        improvement_percentage: 15
      },
      currentStreak: streakData?.currentStreak || 0,
      longestStreak: streakData?.longestStreak || 0,
      weekly_goal_completion: 85 // This would need to be calculated
    };
    
    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    return { data: null, error };
  }
};

/**
 * Gets workout schedule for a user
 */
export const getWorkoutSchedule = async (userId: string): Promise<{ data: WorkoutSchedule[] | null, error: any }> => {
  try {
    const { data, error } = await (supabase as any)
      .from('workout_schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true);
    
    if (error) throw error;
    
    return { data: data as WorkoutSchedule[], error: null };
  } catch (error) {
    console.error('Error fetching workout schedules:', error);
    return { data: null, error };
  }
};

/**
 * Creates a workout schedule
 */
export const createWorkoutSchedule = async (schedule: WorkoutSchedule): Promise<{ data: WorkoutSchedule | null, error: any }> => {
  try {
    const { data, error } = await (supabase as any)
      .from('workout_schedules')
      .insert(schedule)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as WorkoutSchedule, error: null };
  } catch (error) {
    console.error('Error creating workout schedule:', error);
    return { data: null, error };
  }
};

// Helper function to generate default workout templates
const generateDefaultTemplates = (userId: string): WorkoutPlan[] => {
  return [
    {
      id: 'template-1',
      user_id: userId,
      name: 'Beginner Strength Training',
      description: 'A simple plan to build basic strength for beginners',
      goal: 'strength',
      frequency: 3,
      difficulty: 'beginner',
      duration_weeks: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      workout_days: [
        {
          day_name: 'Day 1 - Full Body',
          exercises: [
            {
              exercise_id: 'ex1',
              exercise_name: 'Squats',
              sets: 3,
              reps: 10,
              weight: 0,
              rest_time: 60,
              completed: false,
            },
            {
              exercise_id: 'ex2',
              exercise_name: 'Push-ups',
              sets: 3,
              reps: 10,
              completed: false,
            },
            {
              exercise_id: 'ex3',
              exercise_name: 'Dumbbell Rows',
              sets: 3,
              reps: 10,
              weight: 5,
              completed: false,
            }
          ],
          completed: false,
        },
        {
          day_name: 'Day 2 - Full Body',
          exercises: [
            {
              exercise_id: 'ex4',
              exercise_name: 'Lunges',
              sets: 3,
              reps: 10,
              completed: false,
            },
            {
              exercise_id: 'ex5',
              exercise_name: 'Dumbbell Shoulder Press',
              sets: 3,
              reps: 10,
              weight: 5,
              completed: false,
            },
            {
              exercise_id: 'ex6',
              exercise_name: 'Plank',
              sets: 3,
              duration: 30,
              reps: 1, // Adding reps for time-based exercises
              completed: false,
            }
          ],
          completed: false,
        }
      ]
    },
    {
      id: 'template-2',
      user_id: userId,
      name: 'Hypertrophy Focus',
      description: 'Build muscle mass with higher volume training',
      goal: 'hypertrophy',
      frequency: 4,
      difficulty: 'intermediate',
      duration_weeks: 6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      workout_days: [
        {
          day_name: 'Day 1 - Chest & Triceps',
          exercises: [
            {
              exercise_id: 'ex10',
              exercise_name: 'Bench Press',
              sets: 4,
              reps: 12,
              weight: 20,
              completed: false,
            },
            {
              exercise_id: 'ex11',
              exercise_name: 'Incline Dumbbell Press',
              sets: 3,
              reps: 12,
              weight: 15,
              completed: false,
            }
          ],
          completed: false,
        }
      ]
    }
  ];
};
