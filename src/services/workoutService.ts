import { supabase } from '@/integrations/supabase/client';
import { 
  WorkoutPlan, 
  WorkoutHistoryItem, 
  WorkoutLog, 
  UserWorkoutStats, 
  WorkoutSchedule,
  WorkoutDay
} from '@/types/fitness';

/**
 * Get all workout plans for a user
 */
export const getUserWorkoutPlans = async (userId: string): Promise<{
  data: WorkoutPlan[] | null;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
      
    if (error) throw error;
    
    // For each plan, get its workout days
    if (data && data.length > 0) {
      for (const plan of data) {
        const { data: daysData, error: daysError } = await supabase
          .from('workout_days')
          .select('*')
          .eq('workout_plan_id', plan.id)
          .order('day_number', { ascending: true })
          .returns<WorkoutDay[]>();
          
        if (daysError) throw daysError;
        
        plan.workout_days = daysData || [];
        
        // For each day, get its exercises
        for (const day of plan.workout_days) {
          const { data: exercisesData, error: exercisesError } = await supabase
            .from('workout_exercises')
            .select('*')
            .eq('workout_day_id', day.id)
            .order('order', { ascending: true });
            
          if (exercisesError) throw exercisesError;
          
          day.exercises = exercisesData || [];
        }
      }
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    return { data: null, error };
  }
};

/**
 * Get a specific workout plan by ID
 */
export const getWorkoutPlanById = async (planId: string): Promise<{
  data: WorkoutPlan | null;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('id', planId)
      .single();
      
    if (error) throw error;
    
    if (data) {
      const { data: daysData, error: daysError } = await supabase
        .from('workout_days')
        .select('*')
        .eq('workout_plan_id', planId)
        .order('day_number', { ascending: true })
        .returns<WorkoutDay[]>();
        
      if (daysError) throw daysError;
      
      data.workout_days = daysData || [];
      
      // For each day, get its exercises
      for (const day of data.workout_days) {
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('workout_exercises')
          .select('*')
          .eq('workout_day_id', day.id)
          .order('order', { ascending: true });
          
        if (exercisesError) throw exercisesError;
        
        day.exercises = exercisesData || [];
      }
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    return { data: null, error };
  }
};

/**
 * Create a new workout plan
 */
export const createWorkoutPlan = async (plan: WorkoutPlan): Promise<{
  data: WorkoutPlan | null;
  error: any;
}> => {
  try {
    const { workout_days, ...planData } = plan;
    
    // Insert the plan
    const { data: newPlan, error: planError } = await supabase
      .from('workout_plans')
      .insert([{
        ...planData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
      
    if (planError) throw planError;
    
    if (!newPlan || newPlan.length === 0) {
      throw new Error('Failed to create workout plan');
    }
    
    // Insert the days
    const daysWithPlanId = workout_days.map((day, index) => ({
      ...day,
      workout_plan_id: newPlan[0].id,
      day_number: day.day_number || index + 1
    }));
    
    const { data: daysData, error: daysError } = await supabase
      .from('workout_days')
      .insert(daysWithPlanId)
      .select()
      .returns<WorkoutDay[]>();
      
    if (daysError) throw daysError;
    
    // Insert exercises for each day
    for (let i = 0; i < daysData.length; i++) {
      const day = daysData[i];
      const exercises = workout_days[i].exercises || [];
      
      if (exercises.length > 0) {
        const exercisesWithDayId = exercises.map((exercise, index) => ({
          ...exercise,
          workout_day_id: day.id,
          order: index + 1
        }));
        
        const { error: exercisesError } = await supabase
          .from('workout_exercises')
          .insert(exercisesWithDayId);
          
        if (exercisesError) throw exercisesError;
        
        // Add the exercises to the day in the response
        day.exercises = exercises;
      } else {
        day.exercises = [];
      }
    }
    
    // Construct the complete workout plan for the response
    const resultPlan = {
      ...newPlan[0],
      workout_days: daysData
    };
    
    return { data: resultPlan, error: null };
  } catch (error) {
    console.error('Error creating workout plan:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing workout plan
 */
export const updateWorkoutPlan = async (planId: string, plan: Partial<WorkoutPlan>): Promise<{
  data: WorkoutPlan | null;
  error: any;
}> => {
  try {
    const { workout_days, ...planData } = plan;
    
    // Update the plan
    const { data: updatedPlan, error: planError } = await supabase
      .from('workout_plans')
      .update({
        ...planData,
        updated_at: new Date().toISOString()
      })
      .eq('id', planId)
      .select();
      
    if (planError) throw planError;
    
    if (!updatedPlan || updatedPlan.length === 0) {
      throw new Error('Failed to update workout plan');
    }
    
    // Update workout days if provided
    if (workout_days && workout_days.length > 0) {
      // First, delete existing days (and associated exercises via cascade)
      const { error: deleteError } = await supabase
        .from('workout_days')
        .delete()
        .eq('workout_plan_id', planId);
        
      if (deleteError) throw deleteError;
      
      // Then insert new days
      const daysWithPlanId = workout_days.map((day, index) => ({
        ...day,
        workout_plan_id: planId,
        day_number: day.day_number || index + 1
      }));
      
      const { data: daysData, error: daysError } = await supabase
        .from('workout_days')
        .insert(daysWithPlanId)
        .select()
        .returns<WorkoutDay[]>();
        
      if (daysError) throw daysError;
      
      // Insert exercises for each day
      for (let i = 0; i < daysData.length; i++) {
        const day = daysData[i];
        const exercises = workout_days[i].exercises || [];
        
        if (exercises.length > 0) {
          const exercisesWithDayId = exercises.map((exercise, index) => ({
            ...exercise,
            workout_day_id: day.id,
            order: index + 1
          }));
          
          const { error: exercisesError } = await supabase
            .from('workout_exercises')
            .insert(exercisesWithDayId);
            
          if (exercisesError) throw exercisesError;
          
          // Add the exercises to the day in the response
          day.exercises = exercises;
        } else {
          day.exercises = [];
        }
      }
      
      // Construct the complete workout plan for the response
      const resultPlan = {
        ...updatedPlan[0],
        workout_days: daysData
      };
      
      return { data: resultPlan, error: null };
    }
    
    // If no days were provided, just return the updated plan
    return { data: updatedPlan[0], error: null };
  } catch (error) {
    console.error('Error updating workout plan:', error);
    return { data: null, error };
  }
};

/**
 * Delete a workout plan
 */
export const deleteWorkoutPlan = async (planId: string): Promise<{
  success: boolean;
  error: any;
}> => {
  try {
    const { error } = await supabase
      .from('workout_plans')
      .delete()
      .eq('id', planId);
      
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    return { success: false, error };
  }
};

/**
 * Log a completed workout
 */
export const logWorkout = async (log: WorkoutLog): Promise<{
  data: WorkoutLog | null;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .insert([log])
      .select();
      
    if (error) throw error;
    
    return { data: data ? data[0] : null, error: null };
  } catch (error) {
    console.error('Error logging workout:', error);
    return { data: null, error };
  }
};

/**
 * Get workout history for a user
 */
export const getUserWorkoutHistory = async (userId: string): Promise<{
  data: WorkoutHistoryItem[] | null;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('workout_history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching workout history:', error);
    return { data: null, error };
  }
};

/**
 * Get workout schedules for a user
 */
export const getUserWorkoutSchedules = async (userId: string): Promise<{
  data: WorkoutSchedule[] | null;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('workout_schedules')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching workout schedules:', error);
    return { data: null, error };
  }
};

/**
 * Create a new workout schedule
 */
export const createWorkoutSchedule = async (schedule: WorkoutSchedule): Promise<{
  data: WorkoutSchedule | null;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('workout_schedules')
      .insert([schedule])
      .select();
      
    if (error) throw error;
    
    return { data: data ? data[0] : null, error: null };
  } catch (error) {
    console.error('Error creating workout schedule:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing workout schedule
 */
export const updateWorkoutSchedule = async (scheduleId: string, schedule: Partial<WorkoutSchedule>): Promise<{
  data: WorkoutSchedule | null;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('workout_schedules')
      .update(schedule)
      .eq('id', scheduleId)
      .select();
      
    if (error) throw error;
    
    return { data: data ? data[0] : null, error: null };
  } catch (error) {
    console.error('Error updating workout schedule:', error);
    return { data: null, error };
  }
};

/**
 * Delete a workout schedule
 */
export const deleteWorkoutSchedule = async (scheduleId: string): Promise<{
  success: boolean;
  error: any;
}> => {
  try {
    const { error } = await supabase
      .from('workout_schedules')
      .delete()
      .eq('id', scheduleId);
      
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting workout schedule:', error);
    return { success: false, error };
  }
};

/**
 * Get workout statistics for a user
 */
export const getUserWorkoutStats = async (userId: string): Promise<{
  data: UserWorkoutStats | null;
  error: any;
}> => {
  try {
    // Get total workouts completed
    const { count: totalWorkouts, error: countError } = await supabase
      .from('workout_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
      
    if (countError) throw countError;
    
    // Get current streak
    const { data: userStreak, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('streak_type', 'workout')
      .single();
      
    if (streakError && streakError.code !== 'PGRST116') throw streakError;
    
    // Get most active day
    const { data: activityData, error: activityError } = await supabase
      .from('workout_history')
      .select('date')
      .eq('user_id', userId);
      
    if (activityError) throw activityError;
    
    let mostActiveDay = 'Not enough data';
    
    if (activityData && activityData.length > 0) {
      const dayCount: { [key: string]: number } = {};
      activityData.forEach(log => {
        const day = new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' });
        dayCount[day] = (dayCount[day] || 0) + 1;
      });
      
      let maxCount = 0;
      Object.entries(dayCount).forEach(([day, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostActiveDay = day;
        }
      });
    }
    
    const stats: UserWorkoutStats = {
      streak: userStreak?.currentstreak || 0,
      total_workouts: totalWorkouts || 0,
      currentStreak: userStreak?.currentstreak || 0,
      most_active_day: mostActiveDay,
      achievements_count: 0, // Would need to query achievements
      points: 0, // Would need to query user points
      level: 0 // Would need to calculate level based on points
    };
    
    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    return { data: null, error };
  }
};
