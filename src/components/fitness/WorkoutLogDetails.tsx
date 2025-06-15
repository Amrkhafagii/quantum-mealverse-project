
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, Target, Weight } from 'lucide-react';
import { WorkoutHistoryItem, CompletedExercise } from '@/types/fitness';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WorkoutLogDetailsProps {
  log: WorkoutHistoryItem;
}

const WorkoutLogDetails: React.FC<WorkoutLogDetailsProps> = ({ log }) => {
  // Helper function to get exercise stats
  const getExerciseStats = (exercise: CompletedExercise) => {
    const sets = exercise.sets_completed || [];
    const totalSets = sets.length;
    const totalReps = sets.reduce((sum, set) => sum + (typeof set.reps === 'number' ? set.reps : parseInt(set.reps) || 0), 0);
    const totalWeight = sets.reduce((sum, set) => sum + (set.weight || 0), 0);
    const maxWeight = Math.max(...sets.map(set => set.weight || 0));
    
    return { totalSets, totalReps, totalWeight, maxWeight };
  };

  // Calculate workout summary
  const workoutSummary = {
    totalExercises: log.completed_exercises?.length || log.exercises_completed,
    totalSets: log.completed_exercises?.reduce((sum, ex) => {
      const stats = getExerciseStats(ex);
      return sum + stats.totalSets;
    }, 0) || 0,
    totalReps: log.completed_exercises?.reduce((sum, ex) => {
      const stats = getExerciseStats(ex);
      return sum + stats.totalReps;
    }, 0) || 0,
    totalVolume: log.completed_exercises?.reduce((sum, ex) => {
      const stats = getExerciseStats(ex);
      return sum + stats.totalWeight;
    }, 0) || 0
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate chart data for volume over sets
  const generateVolumeData = () => {
    if (!log.completed_exercises) return [];
    
    let setNumber = 0;
    const data: any[] = [];
    
    log.completed_exercises.forEach((exercise, exerciseIndex) => {
      const sets = exercise.sets_completed || [];
      sets.forEach((set, setIndex) => {
        setNumber++;
        const volume = (set.weight || 0) * (typeof set.reps === 'number' ? set.reps : parseInt(set.reps) || 0);
        data.push({
          setNumber,
          volume,
          exercise: exercise.name || exercise.exercise_name,
          weight: set.weight || 0,
          reps: set.reps
        });
      });
    });
    
    return data;
  };

  const volumeData = generateVolumeData();

  return (
    <Card className="bg-quantum-black/30 border-quantum-cyan/20">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-quantum-cyan">Workout Details</CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              {formatDate(log.date)}
            </p>
          </div>
          <Badge variant="secondary">
            {log.workout_plan_name || 'Custom Workout'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Workout Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-quantum-cyan mr-2" />
              <span className="text-2xl font-bold text-white">{log.duration}</span>
            </div>
            <p className="text-sm text-gray-400">Minutes</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-quantum-cyan mr-2" />
              <span className="text-2xl font-bold text-white">{workoutSummary.totalExercises}</span>
            </div>
            <p className="text-sm text-gray-400">Exercises</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Weight className="h-5 w-5 text-quantum-cyan mr-2" />
              <span className="text-2xl font-bold text-white">{workoutSummary.totalSets}</span>
            </div>
            <p className="text-sm text-gray-400">Sets</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-quantum-cyan mr-2" />
              <span className="text-2xl font-bold text-white">{workoutSummary.totalVolume.toFixed(0)}</span>
            </div>
            <p className="text-sm text-gray-400">Total Volume (lbs)</p>
          </div>
        </div>

        {/* Volume Chart */}
        {volumeData.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Volume by Set</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="setNumber" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #6B7280',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#00D9FF" 
                    strokeWidth={2}
                    dot={{ fill: '#00D9FF', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Exercise Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Exercise Details</h3>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {log.completed_exercises?.map((exercise, index) => {
                const stats = getExerciseStats(exercise);
                
                return (
                  <Card key={index} className="bg-quantum-darkBlue/30 border-gray-600">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base text-quantum-cyan">
                            {exercise.name || exercise.exercise_name}
                          </CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {stats.totalSets} sets
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Max: {stats.maxWeight}lbs
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {exercise.sets_completed && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-300">Sets:</h4>
                          <div className="grid gap-2">
                            {exercise.sets_completed.map((set, setIndex) => (
                              <div key={setIndex} className="flex justify-between items-center p-2 bg-black/20 rounded">
                                <span className="text-sm text-gray-300">
                                  Set {set.set_number || setIndex + 1}
                                </span>
                                <div className="flex gap-4 text-sm">
                                  <span className="text-white">
                                    {set.weight || 0}lbs × {set.reps} reps
                                  </span>
                                  <span className="text-quantum-cyan">
                                    {((set.weight || 0) * (typeof set.reps === 'number' ? set.reps : parseInt(set.reps) || 0)).toFixed(0)} vol
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {exercise.notes && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-300 mb-1">Notes:</h4>
                          <p className="text-sm text-gray-400">{exercise.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Additional Notes */}
        {log.calories_burned && (
          <div className="text-center p-3 bg-quantum-darkBlue/20 rounded-lg">
            <p className="text-sm text-gray-300">
              Estimated Calories Burned: <span className="text-quantum-cyan font-semibold">{log.calories_burned}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutLogDetails;
