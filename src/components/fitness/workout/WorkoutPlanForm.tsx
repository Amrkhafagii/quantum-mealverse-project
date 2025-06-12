
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkoutPlan } from '@/types/fitness';
import { createDefaultExercise } from '@/utils/fitnessUtils';
import { Plus, Trash2 } from 'lucide-react';

export interface WorkoutPlanFormProps {
  onSubmit: (planData: Omit<WorkoutPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  isLoading?: boolean;
}

const WorkoutPlanForm: React.FC<WorkoutPlanFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    workout_days: [
      {
        day_name: 'Day 1',
        exercises: [createDefaultExercise()]
      }
    ]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const addDay = () => {
    setFormData(prev => ({
      ...prev,
      workout_days: [
        ...prev.workout_days,
        {
          day_name: `Day ${prev.workout_days.length + 1}`,
          exercises: [createDefaultExercise()]
        }
      ]
    }));
  };

  const removeDay = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      workout_days: prev.workout_days.filter((_, index) => index !== dayIndex)
    }));
  };

  const addExercise = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      workout_days: prev.workout_days.map((day, index) => 
        index === dayIndex 
          ? { ...day, exercises: [...day.exercises, createDefaultExercise()] }
          : day
      )
    }));
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    setFormData(prev => ({
      ...prev,
      workout_days: prev.workout_days.map((day, index) => 
        index === dayIndex 
          ? { ...day, exercises: day.exercises.filter((_, eIndex) => eIndex !== exerciseIndex) }
          : day
      )
    }));
  };

  const updateExercise = (dayIndex: number, exerciseIndex: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      workout_days: prev.workout_days.map((day, index) => 
        index === dayIndex 
          ? {
              ...day,
              exercises: day.exercises.map((exercise, eIndex) => 
                eIndex === exerciseIndex 
                  ? { ...exercise, [field]: value }
                  : exercise
              )
            }
          : day
      )
    }));
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle>Create New Workout Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Beginner Strength Training"
                required
              />
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                setFormData(prev => ({ ...prev, difficulty: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your workout plan..."
              rows={3}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Workout Days</h3>
              <Button type="button" onClick={addDay} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Day
              </Button>
            </div>

            {formData.workout_days.map((day, dayIndex) => (
              <Card key={dayIndex} className="mb-4 bg-quantum-black/20">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <Input
                      value={day.day_name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        workout_days: prev.workout_days.map((d, index) => 
                          index === dayIndex ? { ...d, day_name: e.target.value } : d
                        )
                      }))}
                      className="w-auto"
                    />
                    {formData.workout_days.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeDay(dayIndex)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {day.exercises.map((exercise, exerciseIndex) => (
                      <div key={exerciseIndex} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-3 bg-quantum-darkBlue/20 rounded">
                        <div>
                          <Label className="text-xs">Exercise</Label>
                          <Input
                            placeholder="Exercise name"
                            value={exercise.name}
                            onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Muscle</Label>
                          <Input
                            placeholder="Target muscle"
                            value={exercise.target_muscle}
                            onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'target_muscle', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Sets</Label>
                          <Input
                            type="number"
                            value={exercise.sets}
                            onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'sets', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Reps</Label>
                          <Input
                            placeholder="e.g., 10-12"
                            value={exercise.reps}
                            onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'reps', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Rest (sec)</Label>
                          <Input
                            type="number"
                            value={exercise.rest}
                            onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'rest', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <Button
                            type="button"
                            onClick={() => addExercise(dayIndex)}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          {day.exercises.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeExercise(dayIndex, exerciseIndex)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : 'Create Workout Plan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WorkoutPlanForm;
