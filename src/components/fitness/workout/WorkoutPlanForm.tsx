
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit3 } from 'lucide-react';
import { ExerciseSelector } from './ExerciseSelector';
import { Exercise, ExerciseSelection } from '@/types/fitness/exercises';
import { WorkoutPlan, WorkoutDay } from '@/types/fitness/workouts';

const workoutPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  goal: z.string().min(1, 'Goal is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  frequency: z.number().min(1).max(7),
  duration_weeks: z.number().min(1).max(52),
});

type WorkoutPlanFormData = z.infer<typeof workoutPlanSchema>;

interface WorkoutPlanFormProps {
  onSubmit: (planData: Omit<WorkoutPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  initialData?: WorkoutPlan;
  isLoading?: boolean;
}

export const WorkoutPlanForm: React.FC<WorkoutPlanFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false
}) => {
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>(
    initialData?.workout_days || []
  );
  const [currentDayIndex, setCurrentDayIndex] = useState<number | null>(null);
  const [currentDayExercises, setCurrentDayExercises] = useState<ExerciseSelection[]>([]);

  const form = useForm<WorkoutPlanFormData>({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      goal: initialData?.goal || '',
      difficulty: (initialData?.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
      frequency: initialData?.frequency || 3,
      duration_weeks: initialData?.duration_weeks || 8,
    },
  });

  const addWorkoutDay = () => {
    const newDay: WorkoutDay = {
      id: Date.now().toString(),
      name: `Day ${workoutDays.length + 1}`,
      day_name: `Day ${workoutDays.length + 1}`,
      exercises: [],
      day_number: workoutDays.length + 1,
      target_muscle_groups: [],
      completed: false,
      order: workoutDays.length
    };
    setWorkoutDays([...workoutDays, newDay]);
  };

  const removeWorkoutDay = (index: number) => {
    const updated = workoutDays.filter((_, i) => i !== index);
    setWorkoutDays(updated);
    if (currentDayIndex === index) {
      setCurrentDayIndex(null);
      setCurrentDayExercises([]);
    }
  };

  const editWorkoutDay = (index: number) => {
    setCurrentDayIndex(index);
    const day = workoutDays[index];
    const exercises: ExerciseSelection[] = day.exercises.map(ex => ({
      exercise_id: ex.exercise_id || ex.id,
      exercise_name: ex.exercise_name || ex.name,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      duration: typeof ex.duration === 'string' ? ex.duration : undefined,
      rest_time: ex.rest_time || ex.rest_seconds || ex.rest,
      notes: ex.notes
    }));
    setCurrentDayExercises(exercises);
  };

  const saveWorkoutDay = () => {
    if (currentDayIndex === null) return;
    
    const exercises = currentDayExercises.map(ex => ({
      id: ex.exercise_id,
      exercise_id: ex.exercise_id,
      name: ex.exercise_name,
      exercise_name: ex.exercise_name,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      duration: ex.duration,
      rest_time: ex.rest_time,
      rest_seconds: ex.rest_time,
      rest: ex.rest_time,
      notes: ex.notes,
      completed: false
    }));

    const updatedDays = [...workoutDays];
    updatedDays[currentDayIndex] = {
      ...updatedDays[currentDayIndex],
      exercises,
      target_muscle_groups: [...new Set(exercises.flatMap(ex => 
        // Extract muscle groups from exercise if available
        []
      ))]
    };
    setWorkoutDays(updatedDays);
    setCurrentDayIndex(null);
    setCurrentDayExercises([]);
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    const newExercise: ExerciseSelection = {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      sets: 3,
      reps: '10-12',
      rest_time: 60
    };
    setCurrentDayExercises([...currentDayExercises, newExercise]);
  };

  const updateExercise = (index: number, updates: Partial<ExerciseSelection>) => {
    const updated = [...currentDayExercises];
    updated[index] = { ...updated[index], ...updates };
    setCurrentDayExercises(updated);
  };

  const removeExercise = (index: number) => {
    setCurrentDayExercises(currentDayExercises.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (data: WorkoutPlanFormData) => {
    const planData: Omit<WorkoutPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
      name: data.name,
      description: data.description,
      goal: data.goal,
      difficulty: data.difficulty,
      frequency: data.frequency,
      duration_weeks: data.duration_weeks,
      workout_days: workoutDays
    };
    onSubmit(planData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Plan Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Plan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Workout Plan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your workout plan..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strength">Build Strength</SelectItem>
                          <SelectItem value="muscle">Build Muscle</SelectItem>
                          <SelectItem value="endurance">Improve Endurance</SelectItem>
                          <SelectItem value="weight_loss">Weight Loss</SelectItem>
                          <SelectItem value="general_fitness">General Fitness</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency (days/week)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="7"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="duration_weeks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (weeks)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="52"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Workout Days */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Workout Days</h3>
                  <Button type="button" onClick={addWorkoutDay} variant="outline" size="sm">
                    Add Day
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {workoutDays.map((day, index) => (
                    <div key={day.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{day.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {day.exercises.length} exercises
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editWorkoutDay(index)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeWorkoutDay(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Saving...' : 'Save Workout Plan'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Exercise Selection */}
      {currentDayIndex !== null ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Editing: {workoutDays[currentDayIndex]?.name}</CardTitle>
                <Button onClick={saveWorkoutDay}>Save Day</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentDayExercises.map((exercise, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{exercise.exercise_name}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeExercise(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-sm">Sets</label>
                        <Input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(index, { sets: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="text-sm">Reps</label>
                        <Input
                          value={exercise.reps}
                          onChange={(e) => updateExercise(index, { reps: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm">Rest (sec)</label>
                        <Input
                          type="number"
                          value={exercise.rest_time || ''}
                          onChange={(e) => updateExercise(index, { rest_time: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <ExerciseSelector
            onExerciseSelect={handleExerciseSelect}
            selectedExercises={currentDayExercises.map(ex => ({ 
              id: ex.exercise_id, 
              name: ex.exercise_name,
              muscle_groups: [],
              equipment_needed: [],
              difficulty: 'beginner' as const
            }))}
          />
        </div>
      ) : (
        <ExerciseSelector
          onExerciseSelect={handleExerciseSelect}
          selectedExercises={[]}
        />
      )}
    </div>
  );
};
