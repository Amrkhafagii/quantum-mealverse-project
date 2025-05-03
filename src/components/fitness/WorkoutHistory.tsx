import React from 'react';
import { WorkoutHistoryItem } from '@/types/fitness';

export interface WorkoutHistoryProps {
  userId?: string;
  workoutHistory: WorkoutHistoryItem[];
  isLoading: boolean;
}

const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({
  userId,
  workoutHistory,
  isLoading
}) => {
  // This is a placeholder implementation
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Workout History</h2>
      <p>Review your past workouts and track your progress.</p>
      
      {isLoading ? (
        <div>Loading workout history...</div>
      ) : (
        <div>
          {workoutHistory.length === 0 ? (
            <div>No workout history yet. Complete a workout to get started!</div>
          ) : (
            <div className="space-y-4">
              {workoutHistory.map((item) => (
                <div key={item.id} className="border p-4 rounded-lg">
                  <h3 className="font-bold">{item.workout_plan_name}</h3>
                  <p>Date: {new Date(item.date).toLocaleDateString()}</p>
                  <p>Workout: {item.workout_day_name}</p>
                  <p>Duration: {item.duration} minutes</p>
                  <p>Exercises: {item.exercises_completed} of {item.total_exercises} completed</p>
                  {item.calories_burned && <p>Calories Burned: {item.calories_burned}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkoutHistory;
