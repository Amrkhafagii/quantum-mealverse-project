
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { WorkoutPlan, WorkoutDay, Exercise } from '@/types/fitness';
import { Plus, Trash2 } from 'lucide-react';

interface WorkoutPlanFormProps {
  onSubmit: (plan: WorkoutPlan) => void;
  initialPlan?: WorkoutPlan;
}

const WorkoutPlanForm: React.FC<WorkoutPlanFormProps> = ({ onSubmit, initialPlan }) => {
  const [plan, setPlan] = useState<WorkoutPlan>(
    initialPlan || {
      id: '',
      user_id: '',
      name: '',
      description: '',
      goal: '',
      difficulty: 'beginner',
      frequency: 3,
      duration_weeks: 8,
      workout_days: []
    }
  );

  const handleAddWorkoutDay = () => {
    const newDay: WorkoutDay = {
      id: `day-${Date.now()}`,
      day_name: `Day ${plan.workout_days.length + 1}`,
      exercises: []
    };
    setPlan(prev => ({
      ...prev,
      workout_days: [...prev.workout_days, newDay]
    }));
  };

  const handleRemoveWorkoutDay = (index: number) => {
    setPlan(prev => ({
      ...prev,
      workout_days: prev.workout_days.filter((_, i) => i !== index)
    }));
  };

  const handleAddExercise = (dayIndex: number) => {
    const newExercise: Exercise = {
      id: `exercise-${Date.now()}`,
      exercise_id: `exercise-${Date.now()}`,
      name: '',
      exercise_name: '',
      target_muscle: '',
      sets: 3,
      reps: 10,
      weight: 0,
      rest: 60,
      rest_time: 60,
      rest_seconds: 60,
      notes: ''
    };

    setPlan(prev => ({
      ...prev,
      workout_days: prev.workout_days.map((day, index) =>
        index === dayIndex
          ? { ...day, exercises: [...day.exercises, newExercise] }
          : day
      )
    }));
  };

  const handleRemoveExercise = (dayIndex: number, exerciseIndex: number) => {
    setPlan(prev => ({
      ...prev,
      workout_days: prev.workout_days.map((day, index) =>
        index === dayIndex
          ? { ...day, exercises: day.exercises.filter((_, i) => i !== exerciseIndex) }
          : day
      )
    }));
  };

  const handleExerciseChange = (dayIndex: number, exerciseIndex: number, field: keyof Exercise, value: any) => {
    setPlan(prev => ({
      ...prev,
      workout_days: prev.workout_days.map((day, dIndex) =>
        dIndex === dayIndex
          ? {
              ...day,
              exercises: day.exercises.map((exercise, eIndex) =>
                eIndex === exerciseIndex
                  ? { ...exercise, [field]: value, exercise_name: field === 'name' ? value : exercise.exercise_name }
                  : exercise
              )
            }
          : day
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(plan);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create Workout Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                value={plan.name}
                onChange={(e) => setPlan(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="goal">Goal</Label>
              <Input
                id="goal"
                value={plan.goal}
                onChange={(e) => setPlan(prev => ({ ...prev, goal: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={plan.description}
              onChange={(e) => setPlan(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={plan.difficulty} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => setPlan(prev => ({ ...prev, difficulty: value }))}>
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
                value={plan.frequency}
                onChange={(e) => setPlan(prev => ({ ...prev, frequency: parseInt(e.target.value) }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (weeks)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={plan.duration_weeks}
                onChange={(e) => setPlan(prev => ({ ...prev, duration_weeks: parseInt(e.target.value) }))}
                required
              />
            </div>
          </div>

          {/* Workout Days */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Workout Days</h3>
              <Button type="button" onClick={handleAddWorkoutDay}>
                <Plus className="h-4 w-4 mr-2" />
                Add Day
              </Button>
            </div>

            {plan.workout_days.map((day, dayIndex) => (
              <Card key={day.id} className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Input
                    value={day.day_name}
                    onChange={(e) => setPlan(prev => ({
                      ...prev,
                      workout_days: prev.workout_days.map((d, i) =>
                        i === dayIndex ? { ...d, day_name: e.target.value } : d
                      )
                    }))}
                    className="font-medium"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveWorkoutDay(dayIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Exercises</h4>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleAddExercise(dayIndex)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Exercise
                    </Button>
                  </div>

                  {day.exercises.map((exercise, exerciseIndex) => (
                    <div key={exercise.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-3 border rounded">
                      <Input
                        placeholder="Exercise name"
                        value={exercise.name}
                        onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Target muscle"
                        value={exercise.target_muscle}
                        onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'target_muscle', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Sets"
                        value={exercise.sets}
                        onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'sets', parseInt(e.target.value))}
                      />
                      <Input
                        placeholder="Reps"
                        value={exercise.reps}
                        onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'reps', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Rest (s)"
                        value={exercise.rest}
                        onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'rest', parseInt(e.target.value))}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveExercise(dayIndex, exerciseIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <Button type="submit" className="w-full">
            Create Workout Plan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WorkoutPlanForm;
