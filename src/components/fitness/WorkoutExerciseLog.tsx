
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Exercise, CompletedExercise } from '@/types/fitness';
import { Check } from 'lucide-react';
import { formatWorkoutLogForSupabase } from '@/utils/supabaseUtils';
import { logWorkout } from '@/services/workoutService';
import ExerciseLogForm from './ExerciseLogForm';
import WorkoutTimer from './WorkoutTimer';
import { checkAchievements, updateWorkoutStreak } from '@/services/achievementService';

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
  const [caloriesBurned, setCaloriesBurned] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [completedExercises, setCompletedExercises] = useState<any[]>([]);

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
  };

  const handleExerciseUpdate = (updatedExercises: any[]) => {
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
        
        // Create a base object without notes
        const baseExercise = {
          exercise_id: exercise.exercise_id,
          name: exercise.name,
          exercise_name: exercise.exercise_name,
          sets_completed: completedSets,
          reps_completed: completedSets.map((set: any) => set.reps),
          weight_used: completedSets.map((set: any) => set.weight),
        };
        
        // Only add notes if it exists and is not empty
        return exercise.notes 
          ? { ...baseExercise, notes: exercise.notes }
          : baseExercise;
      })
      // Use type predicate to filter out null entries and correctly type as CompletedExercise
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
        // Update streak and check for achievements
        await updateWorkoutStreak(userId, workoutLog.date);
        await checkAchievements(userId, workoutLog);
        
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
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Timer component */}
        <WorkoutTimer onDurationChange={handleDurationChange} />
        
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
        
        {/* Exercise log form */}
        <ExerciseLogForm 
          exercises={exercises} 
          onSetComplete={handleExerciseUpdate}
        />
        
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
