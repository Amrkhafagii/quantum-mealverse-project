import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Exercise, CompletedExercise } from '@/types/fitness';
import { Timer, Dumbbell, Check } from 'lucide-react';
import { formatWorkoutLogForSupabase } from '@/utils/supabaseUtils';
import { logWorkout } from '@/services/workoutService';

interface WorkoutExerciseLogProps {
  userId?: string;
  workoutPlanId: string;
  workoutDay: string;
  exercises: Exercise[];
  onLogComplete: () => void;
}

const WorkoutExerciseLog: React.FC<WorkoutExerciseLogProps> = ({
  userId,
  workoutPlanId,
  workoutDay,
  exercises,
  onLogComplete
}) => {
  const { toast } = useToast();
  const [duration, setDuration] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [caloriesBurned, setCaloriesBurned] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [completedExercises, setCompletedExercises] = useState<any[]>(
    exercises.map(exercise => ({
      exercise_id: exercise.exercise_id || exercise.id,
      name: exercise.name,
      exercise_name: exercise.exercise_name || exercise.name,
      sets_completed: Array(exercise.sets).fill(0).map((_, index) => ({
        set_number: index + 1,
        weight: exercise.weight || 0,
        reps: exercise.reps || 0,
        completed: false
      }))
    }))
  );

  // Timer logic
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerRunning) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const handleSetCompletion = (exerciseIndex: number, setIndex: number, completed: boolean) => {
    const updatedExercises = [...completedExercises];
    updatedExercises[exerciseIndex].sets_completed[setIndex].completed = completed;
    setCompletedExercises(updatedExercises);
  };

  const handleSetWeightChange = (exerciseIndex: number, setIndex: number, weight: number) => {
    const updatedExercises = [...completedExercises];
    updatedExercises[exerciseIndex].sets_completed[setIndex].weight = weight;
    setCompletedExercises(updatedExercises);
  };

  const handleSetRepsChange = (exerciseIndex: number, setIndex: number, reps: number) => {
    const updatedExercises = [...completedExercises];
    updatedExercises[exerciseIndex].sets_completed[setIndex].reps = reps;
    setCompletedExercises(updatedExercises);
  };

  const handleCompleteWorkout = async () => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your workout.",
        variant: "destructive"
      });
      return;
    }

    if (timerRunning) {
      toggleTimer(); // Stop the timer
    }

    // Check if any sets were completed
    const anySetCompleted = completedExercises.some(exercise => 
      exercise.sets_completed.some((set: any) => set.completed)
    );

    if (!anySetCompleted) {
      toast({
        title: "No exercises completed",
        description: "Please complete at least one set before finishing the workout.",
        variant: "destructive"
      });
      return;
    }

    // Convert the completed exercises to the format expected by the API
    const formattedCompletedExercises: CompletedExercise[] = completedExercises
      .map(exercise => {
        // Filter out sets that weren't completed
        const completedSets = exercise.sets_completed.filter((set: any) => set.completed);
        
        if (completedSets.length === 0) return null;
        
        return {
          exercise_id: exercise.exercise_id,
          name: exercise.name,
          exercise_name: exercise.exercise_name,
          sets_completed: completedSets,
          reps_completed: completedSets.map((set: any) => set.reps),
          weight_used: completedSets.map((set: any) => set.weight),
          notes: exercise.notes || undefined // Make sure notes is only included if it has a value
        };
      })
      // Fix the type predicate to match the optional notes property in CompletedExercise
      .filter((ex): ex is CompletedExercise => ex !== null);

    try {
      // Prepare workout log for Supabase
      const workoutLog = formatWorkoutLogForSupabase({
        id: crypto.randomUUID(),
        user_id: userId,
        workout_plan_id: workoutPlanId,
        date: new Date().toISOString(),
        duration: Math.round(duration / 60), // Convert to minutes
        calories_burned: caloriesBurned || null,
        notes: notes || null,
        completed_exercises: formattedCompletedExercises
      });

      // Call the API to log the workout
      const { data: result, error } = await logWorkout(workoutLog);

      if (error) {
        throw error;
      }

      if (result) {
        toast({
          title: "Workout Logged",
          description: "Your workout has been saved successfully."
        });
        onLogComplete();
      }
    } catch (error) {
      console.error("Error logging workout:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your workout. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{workoutDay}</span>
          <div className="text-quantum-cyan">{formatTime(duration)}</div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex justify-between">
          <Button 
            onClick={toggleTimer}
            className={timerRunning ? "bg-red-500 hover:bg-red-600" : "bg-quantum-cyan hover:bg-quantum-cyan/90"}
          >
            {timerRunning ? "Pause Timer" : "Start Timer"}
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm">Calories:</span>
            <Input
              type="number"
              value={caloriesBurned || ''}
              onChange={(e) => setCaloriesBurned(Number(e.target.value))}
              placeholder="0"
              className="w-20 h-8"
            />
          </div>
        </div>
        
        <div className="space-y-6">
          {exercises.map((exercise, exerciseIndex) => (
            <div key={exercise.id || exercise.exercise_id} className="bg-quantum-darkBlue/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Dumbbell className="h-5 w-5 mr-2 text-quantum-cyan" />
                {exercise.exercise_name || exercise.name}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Target</p>
                  <p>{exercise.sets} sets × {exercise.reps} reps{exercise.weight ? ` @ ${exercise.weight}kg` : ''}</p>
                  {(exercise.rest || exercise.rest_time) && <p className="text-sm text-gray-400">Rest: {exercise.rest || exercise.rest_time}s</p>}
                </div>
                
                <div className="space-y-2">
                  {completedExercises[exerciseIndex]?.sets_completed.map((set: any, setIndex: number) => (
                    <div key={setIndex} className="flex items-center space-x-2 p-2 bg-quantum-black/40 rounded">
                      <div className="w-12 text-center text-sm">Set {set.set_number}</div>
                      
                      <div className="flex-1 flex items-center space-x-2">
                        <Input
                          type="number"
                          value={set.weight}
                          onChange={(e) => handleSetWeightChange(exerciseIndex, setIndex, Number(e.target.value))}
                          className="w-16 h-8 text-sm"
                          placeholder="kg"
                        />
                        
                        <Input
                          type="number"
                          value={set.reps}
                          onChange={(e) => handleSetRepsChange(exerciseIndex, setIndex, Number(e.target.value))}
                          className="w-16 h-8 text-sm"
                          placeholder="reps"
                        />
                        
                        <Checkbox
                          checked={set.completed}
                          onCheckedChange={(checked) => handleSetCompletion(exerciseIndex, setIndex, !!checked)}
                          className="h-5 w-5"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div>
          <Input
            placeholder="Add notes about your workout"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={handleCompleteWorkout} 
          className="w-full bg-green-500 hover:bg-green-600"
        >
          <Check className="h-4 w-4 mr-2" /> Complete Workout
        </Button>
      </CardContent>
    </Card>
  );
};

export default WorkoutExerciseLog;
