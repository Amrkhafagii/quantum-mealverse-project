
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Exercise } from '@/types/fitness';
import { Dumbbell } from 'lucide-react';

interface ExerciseSet {
  set_number: number;
  weight: number;
  reps: number;
  completed: boolean;
}

interface CompletedExerciseData {
  exercise_id: string;
  name: string;
  exercise_name: string;
  sets_completed: ExerciseSet[];
}

interface ExerciseLogFormProps {
  exercises: Exercise[];
  onSetComplete: (completedExercises: CompletedExerciseData[]) => void;
  initialData?: CompletedExerciseData[];
}

const ExerciseLogForm: React.FC<ExerciseLogFormProps> = ({
  exercises,
  onSetComplete,
  initialData
}) => {
  const [completedExercises, setCompletedExercises] = useState<CompletedExerciseData[]>([]);

  useEffect(() => {
    // Initialize completed exercises from provided data or from exercises
    if (initialData) {
      setCompletedExercises(initialData);
    } else {
      const initialCompletedExercises = exercises.map(exercise => ({
        exercise_id: exercise.exercise_id || exercise.id,
        name: exercise.name,
        exercise_name: exercise.exercise_name || exercise.name,
        sets_completed: Array(exercise.sets).fill(0).map((_, index) => ({
          set_number: index + 1,
          weight: exercise.weight || 0,
          reps: exercise.reps || 0,
          completed: false
        }))
      }));
      
      setCompletedExercises(initialCompletedExercises);
    }
  }, [exercises, initialData]);

  const handleSetCompletion = (exerciseIndex: number, setIndex: number, completed: boolean) => {
    const updatedExercises = [...completedExercises];
    updatedExercises[exerciseIndex].sets_completed[setIndex].completed = completed;
    setCompletedExercises(updatedExercises);
    onSetComplete(updatedExercises);
  };

  const handleSetWeightChange = (exerciseIndex: number, setIndex: number, weight: number) => {
    const updatedExercises = [...completedExercises];
    updatedExercises[exerciseIndex].sets_completed[setIndex].weight = weight;
    setCompletedExercises(updatedExercises);
    onSetComplete(updatedExercises);
  };

  const handleSetRepsChange = (exerciseIndex: number, setIndex: number, reps: number) => {
    const updatedExercises = [...completedExercises];
    updatedExercises[exerciseIndex].sets_completed[setIndex].reps = reps;
    setCompletedExercises(updatedExercises);
    onSetComplete(updatedExercises);
  };

  return (
    <div className="space-y-8">
      {exercises.map((exercise, exerciseIndex) => (
        <div key={exercise.id || exercise.exercise_id} className="space-y-4">
          <h3 className="text-xl font-semibold text-quantum-cyan flex items-center">
            <Dumbbell className="h-5 w-5 mr-2" />
            {exercise.exercise_name || exercise.name}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-quantum-darkBlue/50 p-4 rounded-md">
              <p><strong>Target:</strong> {exercise.sets} sets × {exercise.reps} {exercise.duration ? `for ${exercise.duration}s` : 'reps'}</p>
              {exercise.weight !== undefined && (
                <p><strong>Weight:</strong> {exercise.weight} kg</p>
              )}
              {(exercise.rest_time || exercise.rest) && (
                <p><strong>Rest:</strong> {exercise.rest_time || exercise.rest}s</p>
              )}
            </div>
            
            <div className="space-y-3">
              {completedExercises[exerciseIndex]?.sets_completed.map((set, setIndex) => (
                <div key={setIndex} className="flex items-center space-x-3 bg-quantum-black/40 p-2 rounded">
                  <div className="w-12 text-center">
                    <Label>Set {set.set_number}</Label>
                  </div>
                  
                  <div className="flex-1">
                    <Label htmlFor={`weight-${exerciseIndex}-${setIndex}`} className="text-xs mb-1 block">kg</Label>
                    <Input
                      id={`weight-${exerciseIndex}-${setIndex}`}
                      type="number"
                      min="0"
                      value={set.weight}
                      onChange={(e) => handleSetWeightChange(exerciseIndex, setIndex, Number(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <Label htmlFor={`reps-${exerciseIndex}-${setIndex}`} className="text-xs mb-1 block">reps</Label>
                    <Input
                      id={`reps-${exerciseIndex}-${setIndex}`}
                      type="number"
                      min="0"
                      value={set.reps}
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
          <Separator className="my-4 bg-quantum-cyan/20" />
        </div>
      ))}
    </div>
  );
};

export default ExerciseLogForm;
