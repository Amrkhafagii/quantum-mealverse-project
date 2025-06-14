import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  CheckSquare, 
  Flame,
  ChevronRight,
  Activity
} from 'lucide-react';
import { WorkoutHistoryItem, WorkoutLog } from '@/types/fitness/workouts';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WorkoutDetail from './WorkoutDetail';

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
  const { toast } = useToast();
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutHistoryItem | null>(null);
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchWorkoutLog = async (workoutLogId: string) => {
    try {
      setLoadingDetail(true);
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('id', workoutLogId)
        .single();

      if (error) throw error;
      
      // Transform the data to match our WorkoutLog type
      const transformedData: WorkoutLog = {
        ...data,
        completed_exercises: Array.isArray(data.completed_exercises) 
          ? data.completed_exercises 
          : typeof data.completed_exercises === 'string' 
            ? JSON.parse(data.completed_exercises) 
            : []
      };
      
      setWorkoutLog(transformedData);
    } catch (error) {
      console.error('Error fetching workout log:', error);
      toast({
        title: "Error",
        description: "Failed to load workout details",
        variant: "destructive"
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleWorkoutSelect = async (workout: WorkoutHistoryItem) => {
    setSelectedWorkout(workout);
    await fetchWorkoutLog(workout.workout_log_id);
  };

  const handleBackToList = () => {
    setSelectedWorkout(null);
    setWorkoutLog(null);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getCompletionColor = (completed: number, total: number) => {
    const percentage = (completed / total) * 100;
    if (percentage === 100) return 'text-green-500';
    if (percentage >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (selectedWorkout && workoutLog) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleBackToList}
            className="border-quantum-cyan/20 text-quantum-cyan hover:bg-quantum-cyan/10"
          >
            ← Back to History
          </Button>
          <h2 className="text-2xl font-bold text-quantum-cyan">Workout Details</h2>
        </div>
        
        {loadingDetail ? (
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="p-8 text-center">
              <div className="text-gray-400">Loading workout details...</div>
            </CardContent>
          </Card>
        ) : (
          <WorkoutDetail workout={selectedWorkout} workoutLog={workoutLog} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-8 w-8 text-quantum-cyan" />
        <h2 className="text-3xl font-bold text-quantum-cyan">Workout History</h2>
      </div>

      {isLoading ? (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400">Loading workout history...</div>
          </CardContent>
        </Card>
      ) : workoutHistory.length === 0 ? (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <Activity className="h-16 w-16 text-gray-500 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-white mb-2">No Workout History</h3>
                <p className="text-gray-400">
                  Complete your first workout to see your history here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {workoutHistory.map((workout) => {
            const completionPercentage = Math.round((workout.exercises_completed / workout.total_exercises) * 100);
            
            return (
              <Card 
                key={workout.id} 
                className="bg-quantum-darkBlue/30 border-quantum-cyan/20 hover:border-quantum-cyan/40 transition-colors cursor-pointer"
                onClick={() => handleWorkoutSelect(workout)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-white text-lg">{workout.workout_plan_name}</CardTitle>
                      <Badge variant="outline" className="border-quantum-purple/50 text-quantum-purple">
                        {workout.workout_day_name}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(workout.date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Duration</p>
                        <p className="text-sm font-medium text-white">{formatDuration(workout.duration)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Completion</p>
                        <p className={`text-sm font-medium ${getCompletionColor(workout.exercises_completed, workout.total_exercises)}`}>
                          {completionPercentage}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400">Exercises</p>
                        <p className="text-sm font-medium text-white">
                          {workout.exercises_completed}/{workout.total_exercises}
                        </p>
                      </div>
                    </div>

                    {workout.calories_burned && (
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-400" />
                        <div>
                          <p className="text-xs text-gray-400">Calories</p>
                          <p className="text-sm font-medium text-white">{workout.calories_burned}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-quantum-cyan/20">
                    <div className="text-sm text-gray-400">
                      Workout completed on {format(new Date(workout.date), 'EEEE, MMMM do')}
                    </div>
                    <ChevronRight className="h-4 w-4 text-quantum-cyan" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkoutHistory;
