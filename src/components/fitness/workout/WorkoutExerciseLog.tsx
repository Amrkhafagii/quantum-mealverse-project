
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CompletedExercise, Exercise, WorkoutSet } from '@/types/fitness';
import { CheckCircle } from 'lucide-react';
import ExerciseLogForm from './ExerciseLogForm';

export interface WorkoutExerciseLogProps {
  workoutPlanId: string;
  workoutDay: string;
  exercises: Exercise[];
  onLogComplete: () => void;
}

const WorkoutExerciseLog: React.FC<WorkoutExerciseLogProps> = ({
  workoutPlanId,
  workoutDay,
  exercises,
  onLogComplete
}) => {
  const [completedExercises, setCompletedExercises] = useState<CompletedExercise[]>([]);
  const [duration, setDuration] = useState(30); // Default 30 minutes
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [notes, setNotes] = useState('');
  
  const handleSetComplete = (updatedExercises: CompletedExercise[]) => {
    setCompletedExercises(updatedExercises);
  };
  
  const handleSubmit = () => {
    // Create the workout log data
    const workoutLog = {
      workout_plan_id: workoutPlanId,
      workout_day_name: workoutDay,
      date: new Date().toISOString(),
      duration: duration,
      calories_burned: caloriesBurned,
      notes: notes,
      completed_exercises: completedExercises
    };
    
    // Trigger the parent's onLogComplete function
    onLogComplete();
  };
  
  // Calculate the total sets completed
  const totalSets = completedExercises.reduce((total, exercise) => {
    const completedSets = exercise.sets_completed.filter(set => set.completed).length;
    return total + completedSets;
  }, 0);
  
  // Calculate the total sets
  const allSets = completedExercises.reduce((total, exercise) => {
    return total + exercise.sets_completed.length;
  }, 0);
  
  const completion = allSets > 0 ? Math.round((totalSets / allSets) * 100) : 0;
  
  return (
    <div className="space-y-6">
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="text-lg text-center">{workoutDay}</CardTitle>
        </CardHeader>
        <CardContent>
          <ExerciseLogForm 
            exercises={exercises} 
            onSetComplete={handleSetComplete} 
          />
          
          <div className="mt-8 space-y-4 border-t border-quantum-cyan/20 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Workout Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="calories">Calories Burned</Label>
                <Input
                  id="calories"
                  type="number"
                  min="0"
                  value={caloriesBurned}
                  onChange={(e) => setCaloriesBurned(parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How was your workout? Any achievements or challenges?"
              />
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between pt-4">
              <div className="mb-4 md:mb-0">
                <div className="text-sm text-gray-400 mb-1">Workout Completion</div>
                <div className="text-2xl font-bold flex items-center">
                  {completion}% 
                  <span className="text-sm text-gray-400 ml-2">
                    ({totalSets}/{allSets} sets)
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={handleSubmit}
                className="bg-quantum-purple hover:bg-quantum-purple/90" 
                disabled={totalSets === 0}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Workout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutExerciseLog;
