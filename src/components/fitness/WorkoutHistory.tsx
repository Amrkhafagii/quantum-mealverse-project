
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { format } from 'date-fns';
import { Calendar, Dumbbell, Timer, Flame } from 'lucide-react';

interface WorkoutHistoryProps {
  userId?: string;
  limit?: number;
}

const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ userId, limit = 5 }) => {
  const { user } = useAuth();
  const { history, isLoading, fetchWorkoutHistory } = useWorkoutData();
  const activeUserId = userId || user?.id;
  
  useEffect(() => {
    if (activeUserId) {
      fetchWorkoutHistory(activeUserId);
    }
  }, [activeUserId, fetchWorkoutHistory]);
  
  const limitedHistory = history.slice(0, limit);
  
  if (isLoading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (history.length === 0) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle>Workout History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Dumbbell className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-400">No workout records found</p>
            <p className="text-sm text-gray-500">Complete a workout to see history</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle>Recent Workouts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {limitedHistory.map((workout) => (
            <div 
              key={workout.id} 
              className="bg-quantum-black/40 p-4 rounded-lg border border-quantum-cyan/10 hover:border-quantum-cyan/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{workout.workout_plan_name}</h3>
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(workout.date), 'MMM d, yyyy')}
                </div>
              </div>
              
              <p className="text-sm text-gray-400">{workout.workout_day_name}</p>
              
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-quantum-cyan/10 text-xs text-gray-400">
                <div className="flex items-center">
                  <Dumbbell className="h-3 w-3 mr-1" />
                  {workout.exercises_completed}/{workout.total_exercises} exercises
                </div>
                <div className="flex items-center">
                  <Timer className="h-3 w-3 mr-1" />
                  {workout.duration} min
                </div>
                {workout.calories_burned && (
                  <div className="flex items-center">
                    <Flame className="h-3 w-3 mr-1" />
                    {workout.calories_burned} cal
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {history.length > limit && (
            <div className="text-center">
              <button className="text-sm text-quantum-cyan hover:text-quantum-purple transition-colors">
                View all {history.length} workouts
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutHistory;
