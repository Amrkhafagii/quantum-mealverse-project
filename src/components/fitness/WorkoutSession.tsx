
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { WorkoutPlan, WorkoutDay, WorkoutSet, WorkoutLog } from '@/types/fitness';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { Timer, Dumbbell, Check, X, AlertTriangle } from 'lucide-react';

interface WorkoutSessionProps {
  plan: WorkoutPlan;
  dayIndex: number;
  onComplete: () => void;
  onCancel: () => void;
}

const WorkoutSession: React.FC<WorkoutSessionProps> = ({ plan, dayIndex, onComplete, onCancel }) => {
  const { toast } = useToast();
  const { logWorkout } = useWorkoutData();
  const [duration, setDuration] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [caloriesBurned, setCaloriesBurned] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [completedExercises, setCompletedExercises] = useState<any[]>([]);
  
  const workoutDay: WorkoutDay = plan.workout_days[dayIndex];
  
  // Initialize completed exercises state
  useEffect(() => {
    const initialExercises = workoutDay.exercises.map(exercise => ({
      exercise_id: exercise.exercise_id,
      exercise_name: exercise.exercise_name,
      sets_completed: Array(exercise.sets).fill(0).map((_, index) => ({
        set_number: index + 1,
        weight: exercise.weight || 0,
        reps: exercise.reps || 0,
        duration: exercise.duration || 0,
        completed: false
      }))
    }));
    
    setCompletedExercises(initialExercises);
  }, [workoutDay]);
  
  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerRunning) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);
  
  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    
    // Filter out sets that weren't completed
    const filteredExercises = completedExercises.map(exercise => ({
      ...exercise,
      sets_completed: exercise.sets_completed.filter((set: any) => set.completed)
    })).filter(exercise => exercise.sets_completed.length > 0);
    
    // Create workout log
    const workoutLog: WorkoutLog = {
      id: crypto.randomUUID(),
      user_id: plan.user_id,
      workout_plan_id: plan.id,
      date: new Date().toISOString(),
      duration: Math.round(duration / 60), // Convert to minutes
      calories_burned: caloriesBurned || null,
      notes: notes || null,
      completed_exercises: filteredExercises
    };
    
    try {
      const result = await logWorkout(workoutLog);
      
      if (result && result.data) {
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
          <div className="flex items-center space-x-2 text-lg">
            <Timer className="h-5 w-5 text-quantum-cyan" />
            <span>{formatTime(duration)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6 pb-4">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Button 
              className={timerRunning ? "bg-red-500 hover:bg-red-600" : "bg-quantum-cyan hover:bg-quantum-cyan/80"} 
              onClick={toggleTimer}
            >
              {timerRunning ? "Pause Timer" : "Start Timer"}
            </Button>
            
            {!timerRunning && duration > 0 && (
              <div className="text-quantum-cyan">
                Paused
              </div>
            )}
          </div>
          
          <Separator className="my-4 bg-quantum-cyan/20" />
          
          <div className="space-y-8">
            {workoutDay.exercises.map((exercise, exerciseIndex) => (
              <div key={exercise.exercise_id} className="space-y-4">
                <h3 className="text-xl font-semibold text-quantum-cyan flex items-center">
                  <Dumbbell className="h-5 w-5 mr-2" />
                  {exercise.exercise_name}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-quantum-darkBlue/50 p-4 rounded-md">
                    <p><strong>Target:</strong> {exercise.sets} sets × {exercise.reps} {exercise.duration ? `for ${exercise.duration}s` : 'reps'}</p>
                    {exercise.weight !== undefined && (
                      <p><strong>Weight:</strong> {exercise.weight} kg</p>
                    )}
                    {exercise.rest_time && (
                      <p><strong>Rest:</strong> {exercise.rest_time}s</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {completedExercises[exerciseIndex]?.sets_completed.map((set: any, setIndex: number) => (
                      <div key={setIndex} className="flex items-center space-x-3 bg-quantum-black/40 p-2 rounded">
                        <div className="w-12 text-center">
                          <Label>Set {set.set_number}</Label>
                        </div>
                        
                        {exercise.weight !== undefined && (
                          <div className="flex-1">
                            <Label htmlFor={`weight-${exerciseIndex}-${setIndex}`} className="text-xs mb-1 block">kg</Label>
                            <Input
                              id={`weight-${exerciseIndex}-${setIndex}`}
                              type="number"
                              min="0"
                              value={set.weight || ''}
                              onChange={(e) => handleSetWeightChange(exerciseIndex, setIndex, Number(e.target.value))}
                              className="h-8 text-sm"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <Label htmlFor={`reps-${exerciseIndex}-${setIndex}`} className="text-xs mb-1 block">reps</Label>
                          <Input
                            id={`reps-${exerciseIndex}-${setIndex}`}
                            type="number"
                            min="0"
                            value={set.reps || ''}
                            onChange={(e) => handleSetRepsChange(exerciseIndex, setIndex, Number(e.target.value))}
                            className="h-8 text-sm"
                          />
                        </div>
                        
                        <div className="flex items-center justify-center">
                          <Checkbox
                            id={`completed-${exerciseIndex}-${setIndex}`}
                            checked={set.completed}
                            onCheckedChange={(checked) => handleSetCompletion(exerciseIndex, setIndex, !!checked)}
                            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Separator className="my-4 bg-quantum-cyan/20" />
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="calories">Calories Burned (optional)</Label>
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
              <Label htmlFor="notes">Notes (optional)</Label>
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
