
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WorkoutLog, Exercise, CompletedExercise } from '@/types/fitness';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Check, Plus, X, Dumbbell, Clock } from 'lucide-react';
import { convertCompletedExercises } from '@/utils/fitnessUtils';

// Define a custom type for this component
interface WorkoutSet {
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  rest?: number;
}

interface WorkoutExerciseLogProps {
  userId?: string;
  workoutPlanId: string;
  workoutDay: string;
  exercises: WorkoutSet[];
  onLogComplete?: (log: WorkoutLog) => void;
}

const WorkoutExerciseLog = ({ userId, workoutPlanId, workoutDay, exercises, onLogComplete }: WorkoutExerciseLogProps) => {
  const { toast } = useToast();
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [exerciseLogs, setExerciseLogs] = useState<{
    [exerciseId: string]: {
      sets: {
        weight?: number;
        reps?: number;
        completed: boolean;
      }[];
    };
  }>({});

  // Initialize exercise logs
  useEffect(() => {
    const initialLogs: {
      [exerciseId: string]: {
        sets: {
          weight?: number;
          reps?: number;
          completed: boolean;
        }[];
      };
    } = {};

    exercises.forEach((exercise) => {
      initialLogs[exercise.exercise_id] = {
        sets: Array(exercise.sets).fill({
          weight: exercise.weight,
          reps: exercise.reps,
          completed: false,
        }),
      };
    });

    setExerciseLogs(initialLogs);
  }, [exercises]);

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const startWorkout = () => {
    setStartTime(new Date());
    setIsActive(true);
    toast({
      title: "Workout Started",
      description: "Your workout timer has started. Good luck!",
    });
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSetComplete = (exerciseId: string, setIndex: number) => {
    setExerciseLogs((prev) => {
      const updatedLogs = { ...prev };
      const exercise = { ...updatedLogs[exerciseId] };
      const sets = [...exercise.sets];
      sets[setIndex] = { ...sets[setIndex], completed: !sets[setIndex].completed };
      exercise.sets = sets;
      updatedLogs[exerciseId] = exercise;
      return updatedLogs;
    });
  };

  const handleInputChange = (
    exerciseId: string,
    setIndex: number,
    field: 'weight' | 'reps',
    value: string
  ) => {
    setExerciseLogs((prev) => {
      const updatedLogs = { ...prev };
      const exercise = { ...updatedLogs[exerciseId] };
      const sets = [...exercise.sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value ? Number(value) : undefined };
      exercise.sets = sets;
      updatedLogs[exerciseId] = exercise;
      return updatedLogs;
    });
  };

  const completeWorkout = async () => {
    if (!userId) {
      toast({
        title: "Login Required",
        description: "Please log in to save your workout.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsActive(false);
      
      // Convert to the format expected by our API
      const completedExercisesData = Object.entries(exerciseLogs).map(([exerciseId, log]) => {
        const exercise = exercises.find(e => e.exercise_id === exerciseId);
        return {
          exercise_id: exerciseId,
          name: exercise?.exercise_name || "",
          sets_completed: log.sets.map((set, index) => ({
            set_number: index + 1,
            weight: set.weight,
            reps: set.reps,
          })),
        };
      });

      // Calculate duration in minutes
      const duration = Math.ceil(elapsedTime / 60);
      
      // Estimate calories burned (very rough estimate)
      const caloriesBurned = Math.round(duration * 8);

      // Convert to CompletedExercise format needed by WorkoutLog
      const compatibleCompletedExercises = convertCompletedExercises(completedExercisesData);

      const workoutLog: WorkoutLog = {
        id: `temp-${Date.now()}`, // This will be replaced by the database
        user_id: userId,
        workout_plan_id: workoutPlanId,
        date: new Date().toISOString(),
        duration,
        calories_burned: caloriesBurned,
        notes: `Completed ${workoutDay}`,
        completed_exercises: compatibleCompletedExercises,
      };

      // In a real implementation, we would save this to the database
      // const { data, error } = await supabase
      //   .from('workout_logs')
      //   .insert(workoutLog)
      //   .select()
      //   .single();
      
      // if (error) throw error;

      toast({
        title: "Workout Completed",
        description: `Great job! You worked out for ${formatTime(elapsedTime)}.`,
      });

      if (onLogComplete) onLogComplete(workoutLog);
      
    } catch (error) {
      console.error('Error logging workout:', error);
      toast({
        title: "Error",
        description: "Failed to save workout log.",
        variant: "destructive",
      });
    }
  };

  const allSetsCompleted = () => {
    return Object.values(exerciseLogs).every(exercise => 
      exercise.sets.every(set => set.completed)
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-quantum-cyan">{workoutDay}</CardTitle>
            <CardDescription>Track your progress for today's workout</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="text-quantum-purple" />
            <span className="text-2xl font-mono">{formatTime(elapsedTime)}</span>
          </div>
        </CardHeader>
        <CardContent>
          {!isActive && !startTime ? (
            <div className="flex justify-center pb-4">
              <Button onClick={startWorkout} className="bg-quantum-purple hover:bg-quantum-purple/90">
                Start Workout
              </Button>
            </div>
          ) : null}

          {(isActive || startTime) && (
            <div className="space-y-6">
              {exercises.map((exercise) => (
                <Card key={exercise.exercise_id} className="bg-quantum-black/50 border-quantum-purple/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Dumbbell className="h-5 w-5 text-quantum-purple" />
                      {exercise.exercise_name}
                    </CardTitle>
                    <CardDescription>
                      {exercise.sets} sets × {exercise.reps} reps
                      {exercise.weight ? ` @ ${exercise.weight} kg` : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {exerciseLogs[exercise.exercise_id]?.sets.map((set, setIndex) => (
                        <div key={setIndex} className="flex items-center gap-3">
                          <span className="text-sm font-medium w-10">Set {setIndex + 1}</span>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor={`weight-${exercise.exercise_id}-${setIndex}`} className="text-xs">
                                Weight (kg)
                              </Label>
                              <Input
                                id={`weight-${exercise.exercise_id}-${setIndex}`}
                                type="number"
                                value={set.weight || ''}
                                onChange={(e) => handleInputChange(exercise.exercise_id, setIndex, 'weight', e.target.value)}
                                className="h-8 bg-quantum-darkBlue/50"
                                disabled={!isActive}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`reps-${exercise.exercise_id}-${setIndex}`} className="text-xs">
                                Reps
                              </Label>
                              <Input
                                id={`reps-${exercise.exercise_id}-${setIndex}`}
                                type="number"
                                value={set.reps || ''}
                                onChange={(e) => handleInputChange(exercise.exercise_id, setIndex, 'reps', e.target.value)}
                                className="h-8 bg-quantum-darkBlue/50"
                                disabled={!isActive}
                              />
                            </div>
                          </div>
                          <Button
                            variant={set.completed ? "default" : "outline"}
                            size="sm"
                            className={set.completed ? "bg-green-600 hover:bg-green-700" : "border-quantum-cyan/30"}
                            onClick={() => handleSetComplete(exercise.exercise_id, setIndex)}
                            disabled={!isActive}
                          >
                            {set.completed ? <Check className="h-4 w-4" /> : "Done"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-center pt-4">
                {isActive && (
                  <Button 
                    onClick={completeWorkout} 
                    className="bg-quantum-cyan hover:bg-quantum-cyan/90"
                    disabled={!allSetsCompleted()}
                  >
                    Complete Workout
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutExerciseLog;
