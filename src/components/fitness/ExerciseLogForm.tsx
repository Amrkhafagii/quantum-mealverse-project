
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Exercise } from '@/types/fitness';
import { Timer, Dumbbell } from 'lucide-react';

interface ExerciseSet {
  set_number: number;
  weight: number;
  reps: number | string;
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
  onSetComplete: (updatedExercises: any[]) => void;
}

const ExerciseLogForm: React.FC<ExerciseLogFormProps> = ({
  exercises,
  onSetComplete
}) => {
  const [completedExercises, setCompletedExercises] = useState<CompletedExerciseData[]>([]);

  useEffect(() => {
    // Initialize exercise log data
    const initialExerciseData = exercises.map(exercise => ({
      exercise_id: exercise.exercise_id || exercise.id || exercise.name,
      name: exercise.name,
      exercise_name: exercise.exercise_name || exercise.name,
      sets_completed: Array(exercise.sets).fill(0).map((_, index) => ({
        set_number: index + 1,
        weight: exercise.weight || 0,
        reps: exercise.reps || 0,
        completed: false
      }))
    }));

    setCompletedExercises(initialExerciseData as CompletedExerciseData[]);
  }, [exercises]);

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

  const handleSetRepsChange = (exerciseIndex: number, setIndex: number, reps: number | string) => {
    const updatedExercises = [...completedExercises];
    updatedExercises[exerciseIndex].sets_completed[setIndex].reps = reps;
    setCompletedExercises(updatedExercises);
    onSetComplete(updatedExercises);
  };

  return (
    <div className="space-y-6">
      {exercises.map((exercise, exerciseIndex) => (
        <Card key={exercise.exercise_id || exercise.id || exerciseIndex} className="bg-quantum-black/20 border-quantum-cyan/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-4">
              <h3 className="text-lg font-medium">{exercise.exercise_name || exercise.name}</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-blue-900/30 border-blue-400/30 flex items-center gap-1">
                  <Dumbbell className="h-3 w-3" /> {exercise.target_muscle}
                </Badge>
                {(exercise.duration || (typeof exercise.reps === 'string' && exercise.reps.includes('min'))) && (
                  <Badge variant="outline" className="bg-purple-900/30 border-purple-400/30 flex items-center gap-1">
                    <Timer className="h-3 w-3" /> {exercise.duration || exercise.reps}
                  </Badge>
                )}
                <Badge variant="outline" className="bg-gray-800 border-gray-600 flex items-center gap-1">
                  Rest: {exercise.rest_time || exercise.rest || exercise.rest_seconds || 60}s
                </Badge>
              </div>
            </div>
            
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExerciseLogForm;
