
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, Save } from 'lucide-react';
import { WorkoutPlan, WorkoutDay, Exercise } from '@/types/fitness';
import { useToast } from '@/hooks/use-toast';

interface WorkoutPlanFormProps {
  onSave: (plan: WorkoutPlan) => void;
  initialPlan?: WorkoutPlan;
}

const WorkoutPlanForm: React.FC<WorkoutPlanFormProps> = ({ onSave, initialPlan }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: initialPlan?.name || '',
    description: initialPlan?.description || '',
    goal: initialPlan?.goal || '',
    difficulty: initialPlan?.difficulty || 'beginner' as const,
    frequency: initialPlan?.frequency || 3,
    duration_weeks: initialPlan?.duration_weeks || 4
  });

  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>(
    initialPlan?.workout_days || [
      {
        day_name: 'Day 1',
        exercises: []
      }
    ]
  );

  const addWorkoutDay = () => {
    const newDay: WorkoutDay = {
      day_name: `Day ${workoutDays.length + 1}`,
      exercises: []
    };
    setWorkoutDays([...workoutDays, newDay]);
  };

  const removeWorkoutDay = (index: number) => {
    setWorkoutDays(workoutDays.filter((_, i) => i !== index));
  };

  const updateWorkoutDay = (index: number, day: WorkoutDay) => {
    const updatedDays = [...workoutDays];
    updatedDays[index] = day;
    setWorkoutDays(updatedDays);
  };

  const addExercise = (dayIndex: number) => {
    const newExercise: Exercise = {
      id: `exercise-${Date.now()}`,
      exercise_id: `exercise-${Date.now()}`,
      name: '',
      exercise_name: '',
      target_muscle: '',
      sets: 3,
      reps: '10-12',
      weight: 0,
      duration: '',
      rest_time: 60,
      rest_seconds: 60,
      rest: 60,
      notes: '',
      completed: false
    };

    const updatedDays = [...workoutDays];
    updatedDays[dayIndex].exercises.push(newExercise);
    setWorkoutDays(updatedDays);
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    const updatedDays = [...workoutDays];
    updatedDays[dayIndex].exercises.splice(exerciseIndex, 1);
    setWorkoutDays(updatedDays);
  };

  const updateExercise = (dayIndex: number, exerciseIndex: number, exercise: Exercise) => {
    const updatedDays = [...workoutDays];
    updatedDays[dayIndex].exercises[exerciseIndex] = exercise;
    setWorkoutDays(updatedDays);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate exercises have required target_muscle field
    const validatedWorkoutDays = workoutDays.map(day => ({
      ...day,
      exercises: day.exercises.map(exercise => ({
        ...exercise,
        target_muscle: exercise.target_muscle || 'General'
      }))
    }));

    const workoutPlan: WorkoutPlan = {
      id: initialPlan?.id || `plan-${Date.now()}`,
      user_id: initialPlan?.user_id || '',
      ...formData,
      workout_days: validatedWorkoutDays,
      created_at: initialPlan?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    };

    onSave(workoutPlan);
    toast({
      title: "Success",
      description: "Workout plan saved successfully!",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialPlan ? 'Edit Workout Plan' : 'Create Workout Plan'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="goal">Goal</Label>
              <Input
                id="goal"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                placeholder="e.g., Build strength, Lose weight"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your workout plan..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => setFormData({ ...formData, difficulty: value })}>
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
            
            <div>
              <Label htmlFor="frequency">Frequency (days/week)</Label>
              <Input
                id="frequency"
                type="number"
                min="1"
                max="7"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: parseInt(e.target.value) })}
              />
            </div>
            
            <div>
              <Label htmlFor="duration_weeks">Duration (weeks)</Label>
              <Input
                id="duration_weeks"
                type="number"
                min="1"
                value={formData.duration_weeks}
                onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) })}
              />
            </div>
          </div>

          {/* Workout Days */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Workout Days</h3>
              <Button type="button" onClick={addWorkoutDay} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Day
              </Button>
            </div>

            {workoutDays.map((day, dayIndex) => (
              <Card key={dayIndex} className="border-dashed">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <Input
                      value={day.day_name}
                      onChange={(e) => updateWorkoutDay(dayIndex, { ...day, day_name: e.target.value })}
                      className="font-semibold"
                    />
                    {workoutDays.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWorkoutDay(dayIndex)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {day.exercises.map((exercise, exerciseIndex) => (
                      <div key={exerciseIndex} className="border rounded p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                            <Input
                              placeholder="Exercise name"
                              value={exercise.name}
                              onChange={(e) => updateExercise(dayIndex, exerciseIndex, { 
                                ...exercise, 
                                name: e.target.value, 
                                exercise_name: e.target.value 
                              })}
                            />
                            <Input
                              placeholder="Target muscle"
                              value={exercise.target_muscle}
                              onChange={(e) => updateExercise(dayIndex, exerciseIndex, { 
                                ...exercise, 
                                target_muscle: e.target.value 
                              })}
                            />
                            <div className="grid grid-cols-3 gap-1">
                              <Input
                                placeholder="Sets"
                                type="number"
                                value={exercise.sets}
                                onChange={(e) => updateExercise(dayIndex, exerciseIndex, { 
                                  ...exercise, 
                                  sets: parseInt(e.target.value) 
                                })}
                              />
                              <Input
                                placeholder="Reps"
                                value={exercise.reps}
                                onChange={(e) => updateExercise(dayIndex, exerciseIndex, { 
                                  ...exercise, 
                                  reps: e.target.value 
                                })}
                              />
                              <Input
                                placeholder="Rest (s)"
                                type="number"
                                value={exercise.rest}
                                onChange={(e) => updateExercise(dayIndex, exerciseIndex, { 
                                  ...exercise, 
                                  rest: parseInt(e.target.value),
                                  rest_time: parseInt(e.target.value),
                                  rest_seconds: parseInt(e.target.value)
                                })}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExercise(dayIndex, exerciseIndex)}
                            className="ml-2"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addExercise(dayIndex)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button type="submit" className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {initialPlan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WorkoutPlanForm;
