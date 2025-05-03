
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Plus, Minus, Save } from 'lucide-react';
import { WorkoutLog, CompletedExercise } from '@/types/fitness';
import { logWorkout } from '@/services/workoutService';

interface WorkoutExerciseLogProps {
  workoutLog: WorkoutLog;
  onSave: (log: WorkoutLog) => void;
}

const WorkoutExerciseLog: React.FC<WorkoutExerciseLogProps> = ({ workoutLog, onSave }) => {
  const [completedExercises, setCompletedExercises] = useState<CompletedExercise[]>(workoutLog.completed_exercises || []);

  const handleAddExercise = () => {
    setCompletedExercises([
      ...completedExercises,
      {
        exercise_id: crypto.randomUUID(),
        name: '',
        exercise_name: '',
        sets_completed: [
          {
            set_number: 1,
            weight: 0,
            reps: 0,
            completed: false
          }
        ]
      }
    ]);
  };

  const handleRemoveExercise = (index: number) => {
    const newExercises = [...completedExercises];
    newExercises.splice(index, 1);
    setCompletedExercises(newExercises);
  };

  const handleExerciseChange = (index: number, field: string, value: any) => {
    const newExercises = [...completedExercises];
    (newExercises[index] as any)[field] = value;
    setCompletedExercises(newExercises);
  };

  const handleSave = async () => {
    const updatedLog = {
      ...workoutLog,
      completed_exercises: completedExercises
    };
    
    const result = await logWorkout(updatedLog);
    
    if (result.success) {
      onSave(updatedLog);
    } else {
      console.error("Error saving workout log:", result.error);
    }
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="text-quantum-cyan">Exercise Log</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {completedExercises.map((exercise, index) => (
          <div key={index} className="space-y-2 p-4 rounded-md bg-quantum-black/30">
            <div className="flex justify-between items-center">
              <Label htmlFor={`exerciseName-${index}`} className="text-sm">
                Exercise {index + 1}
              </Label>
              <Button variant="ghost" size="sm" onClick={() => handleRemoveExercise(index)}>
                <Minus className="h-4 w-4" />
              </Button>
            </div>
            <Input
              id={`exerciseName-${index}`}
              type="text"
              placeholder="Exercise Name"
              value={exercise.exercise_name}
              onChange={(e) => handleExerciseChange(index, 'exercise_name', e.target.value)}
              className="bg-quantum-black/50 border-quantum-cyan/20"
            />
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`sets-${index}`} className="text-sm">
                  Sets
                </Label>
                <Input
                  id={`sets-${index}`}
                  type="number"
                  value={exercise.sets_completed.length}
                  onChange={(e) => {
                    // Handle sets count change
                    const setCount = parseInt(e.target.value);
                    const currentSets = exercise.sets_completed || [];
                    const newSets = [];
                    
                    for (let i = 0; i < setCount; i++) {
                      if (i < currentSets.length) {
                        newSets.push(currentSets[i]);
                      } else {
                        newSets.push({
                          set_number: i + 1,
                          weight: 0,
                          reps: 0,
                          completed: false
                        });
                      }
                    }
                    
                    const newExercises = [...completedExercises];
                    newExercises[index].sets_completed = newSets;
                    setCompletedExercises(newExercises);
                  }}
                  className="bg-quantum-black/50 border-quantum-cyan/20"
                />
              </div>
              <div>
                <Label htmlFor={`reps-${index}`} className="text-sm">
                  Reps
                </Label>
                <Input
                  id={`reps-${index}`}
                  type="number"
                  value={exercise.sets_completed[0]?.reps || 0}
                  onChange={(e) => {
                    const reps = parseInt(e.target.value);
                    const newExercises = [...completedExercises];
                    newExercises[index].sets_completed = newExercises[index].sets_completed.map(set => ({
                      ...set,
                      reps
                    }));
                    setCompletedExercises(newExercises);
                  }}
                  className="bg-quantum-black/50 border-quantum-cyan/20"
                />
              </div>
              <div>
                <Label htmlFor={`weight-${index}`} className="text-sm">
                  Weight (kg)
                </Label>
                <Input
                  id={`weight-${index}`}
                  type="number"
                  value={exercise.sets_completed[0]?.weight || 0}
                  onChange={(e) => {
                    const weight = parseFloat(e.target.value);
                    const newExercises = [...completedExercises];
                    newExercises[index].sets_completed = newExercises[index].sets_completed.map(set => ({
                      ...set,
                      weight
                    }));
                    setCompletedExercises(newExercises);
                  }}
                  className="bg-quantum-black/50 border-quantum-cyan/20"
                />
              </div>
            </div>
            <div>
              <Label htmlFor={`notes-${index}`} className="text-sm">
                Notes
              </Label>
              <Input
                id={`notes-${index}`}
                type="text"
                placeholder="Additional notes"
                value={exercise.notes || ''}
                onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                className="bg-quantum-black/50 border-quantum-cyan/20"
              />
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full" onClick={handleAddExercise}>
          <Plus className="h-4 w-4 mr-2" />
          Add Exercise
        </Button>
        <Button className="w-full bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Log
        </Button>
      </CardContent>
    </Card>
  );
};

export default WorkoutExerciseLog;
