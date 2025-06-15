
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { WorkoutHistoryItem } from '@/types/fitness/workouts';

const FitnessAnalyticsDashboard = () => {
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWorkoutHistory();
    }
  }, [user]);

  const fetchWorkoutHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_history')
        .select('*')
        .eq('workout_history_user_id', user.id) // <-- Corrected column name
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Map database fields to WorkoutHistoryItem interface
      const mappedHistory: WorkoutHistoryItem[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.workout_history_user_id, // Map database field
        workout_log_id: item.workout_log_id,
        date: item.date,
        workout_plan_name: item.workout_plan_name,
        workout_day_name: item.workout_day_name,
        exercises_completed: item.exercises_completed,
        total_exercises: item.total_exercises,
        duration: item.duration,
        calories_burned: item.calories_burned,
        workout_plan_id: item.workout_plan_id || '', // Provide default for compatibility
        completed_exercises: item.completed_exercises || [] // Provide default for compatibility
      }));
      
      setWorkoutHistory(mappedHistory);
    } catch (error) {
      console.error('Error fetching workout history:', error);
      setWorkoutHistory([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading workout history...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Workout History</h1>
      {workoutHistory.length === 0 ? (
        <p>No workout history available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workoutHistory.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold">{item.workout_plan_name}</h2>
              <p className="text-gray-600">Date: {item.date}</p>
              <p className="text-gray-600">Duration: {item.duration} minutes</p>
              <p className="text-gray-600">Exercises Completed: {item.exercises_completed}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FitnessAnalyticsDashboard;
