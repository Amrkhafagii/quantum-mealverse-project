
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { WorkoutPlan, WorkoutDay, WorkoutLog } from '@/types/fitness';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { useAuth } from '@/hooks/useAuth';
import { Check, X } from 'lucide-react';
import ExerciseLogForm from './ExerciseLogForm';
import { checkAchievements, updateWorkoutStreak } from '@/services/achievementService';

interface WorkoutTimerProps {
  onDurationChange: (duration: number) => void;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ onDurationChange }) => {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prevSeconds => {
        const newSeconds = prevSeconds + 1;
        onDurationChange(newSeconds);
        return newSeconds;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [onDurationChange]);
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="bg-quantum-black/40 p-4 rounded-lg text-center">
      <div className="text-sm text-gray-400 mb-1">Workout Duration</div>
      <div className="text-3xl font-bold font-mono">{formatTime(seconds)}</div>
    </div>
  );
};

interface WorkoutSessionProps {
  plan: WorkoutPlan;
  dayIndex: number;
  onComplete: () => void;
  onCancel: () => void;
}

const WorkoutSession: React.FC<WorkoutSessionProps> = ({ plan, dayIndex, onComplete, onCancel }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { logWorkout } = useWorkoutData();
  const [duration, setDuration] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [completedExercises, setCompletedExercises] = useState<any[]>([]);
  
  const workoutDay: WorkoutDay = plan.workout_days[dayIndex];
  
  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
  };

  const handleExerciseUpdate = (updatedExercises: any[]) => {
    setCompletedExercises(updatedExercises);
  };
  
  const handleCompleteWorkout = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to complete a workout.",
        variant: "destructive"
      });
      return;
    }

    // Check if any sets were completed
    const anySetCompleted = completedExercises.some(exercise => 
      exercise.sets_completed && exercise.sets_completed.length > 0
    );
    
    if (!anySetCompleted) {
      toast({
        title: "No exercises completed",
        description: "Please complete at least one set before finishing the workout.",
        variant: "destructive"
      });
      return;
    }
    
    // Filter out exercises that have no completed sets
    const filteredExercises = completedExercises.filter(exercise => 
      exercise.sets_completed && exercise.sets_completed.length > 0
    );
    
    // Create workout log with proper UUID user_id
    const workoutLog: WorkoutLog = {
      id: crypto.randomUUID(),
      user_id: user.id, // Use authenticated user's UUID
      workout_plan_id: plan.id,
      date: new Date().toISOString(),
      duration: Math.round(duration / 60), // Convert to minutes
      calories_burned: caloriesBurned || null,
      notes: notes || null,
      exercises_completed: [], // Add empty array for required property
      completed_exercises: filteredExercises
    };
    
    try {
      const result = await logWorkout(workoutLog);
      
      if (result?.success) {
        // Update streak data with authenticated user ID
        await updateWorkoutStreak(user.id, workoutLog.date);
        
        // Check for achievements earned
        await checkAchievements(user.id, workoutLog);
        
        toast({
          title: "Workout logged successfully",
          description: "Your workout has been saved.",
        });
        onComplete();
      } else {
        throw new Error("Failed to save workout log");
      }
    } catch (error) {
      console.error("Error saving workout log:", error);
      toast({
        title: "Error saving workout",
        description: "There was a problem saving your workout. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className="w-full bg-quantum-darkBlue/30 border border-quantum-cyan/20">
      <CardHeader className="border-b border-quantum-cyan/20">
        <CardTitle className="flex justify-between items-center">
          <span className="text-quantum-cyan">{workoutDay.day_name}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6 pb-4">
        <div className="space-y-6">
          {/* Timer Component */}
          <WorkoutTimer onDurationChange={handleDurationChange} />
          
          <Separator className="my-4 bg-quantum-cyan/20" />
          
          {/* Exercise Form Component */}
          <ExerciseLogForm 
            exercises={workoutDay.exercises} 
            onSetComplete={handleExerciseUpdate}
          />
          
          <div className="space-y-4">
            <div>
              <label htmlFor="calories" className="block text-sm font-medium mb-1">Calories Burned (optional)</label>
              <Input
                id="calories"
                type="number"
                min="0"
                value={caloriesBurned || ''}
                onChange={(e) => setCaloriesBurned(Number(e.target.value))}
                placeholder="Enter estimated calories burned"
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes (optional)</label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about your workout"
              />
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            
            <Button className="bg-green-500 hover:bg-green-600" onClick={handleCompleteWorkout}>
              <Check className="h-4 w-4 mr-2" /> Complete Workout
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutSession;
