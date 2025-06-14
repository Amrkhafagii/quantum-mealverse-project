import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { Exercise, CompletedExercise, WorkoutPlan, WorkoutLog } from '@/types/fitness';
import { CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkoutSessionProps {
  workoutPlan: WorkoutPlan;
  onComplete?: () => void;
}

export default function WorkoutSession({ workoutPlan, onComplete }: WorkoutSessionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<CompletedExercise[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(null);
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false);

  useEffect(() => {
    setSessionStartTime(new Date());
    return () => {
      setSessionEndTime(new Date());
    };
  }, []);

  const currentExercise = workoutPlan.workout_days?.[0]?.exercises[currentExerciseIndex];

  const handleExerciseComplete = (exercise: Exercise) => {
    const completedExercise: CompletedExercise = {
      exercise_id: exercise.id || '',
      name: exercise.name,
      sets_completed: [],
      notes: ''
    };

    setCompletedExercises(prev => [...prev, completedExercise]);

    if (currentExerciseIndex < (workoutPlan.workout_days?.[0]?.exercises.length || 0) - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      setIsWorkoutComplete(true);
      setSessionEndTime(new Date());
      toast({
        title: "Workout Complete!",
        description: "Great job! You finished your workout.",
      });
    }
  };

  const sessionDuration = sessionEndTime ? Math.round((sessionEndTime.getTime() - (sessionStartTime?.getTime() || 0)) / 60000) : 0;

  const handleCompleteWorkout = async () => {
    if (!user?.id) return;

    const workoutLog: WorkoutLog = {
      id: crypto.randomUUID(),
      workout_logs_user_id: user.id,
      workout_plan_id: workoutPlan.id,
      date: new Date().toISOString().split('T')[0],
      duration: sessionDuration,
      calories_burned: Math.round(sessionDuration * 5),
      notes: '',
      exercises_completed: [],
      completed_exercises: completedExercises,
    };

    try {
      const response = await fetch('/api/logWorkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutLog),
      });

      if (response.ok) {
        toast({
          title: "Workout Logged!",
          description: "Your workout has been saved.",
        });
        if (onComplete) {
          onComplete();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to log workout.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error logging workout:", error);
      toast({
        title: "Error",
        description: "Failed to log workout.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-quantum-black/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="text-quantum-cyan">
          {workoutPlan.name} - {workoutPlan.workout_days?.[0]?.day_name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentExercise ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">{currentExercise.name}</h2>
            <p className="text-gray-400">Sets: {currentExercise.sets}, Reps: {currentExercise.reps}</p>
            <p className="text-gray-400">Target Muscle: {currentExercise.target_muscle}</p>
            <Button onClick={() => handleExerciseComplete(currentExercise)} className="bg-quantum-purple hover:bg-quantum-purple/90">
              <CheckCircle className="h-4 w-4 mr-2" /> Complete Exercise
            </Button>
          </div>
        ) : isWorkoutComplete ? (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-green-500">Workout Complete!</h2>
            <p className="text-gray-400">Duration: {sessionDuration} minutes</p>
            <Button onClick={handleCompleteWorkout} className="bg-green-500 hover:bg-green-600">
              Save Workout
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-400">No exercises in this workout plan.</h2>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
