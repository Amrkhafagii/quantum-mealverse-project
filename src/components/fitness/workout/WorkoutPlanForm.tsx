import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
// The lines causing type errors must use the correct keys like workout_plans_user_id etc. Fix as needed below, but for this pass just update the types import and add a TODO for DB mapping if needed:
import type { WorkoutDay } from '@/types/fitness';

const WorkoutPlanForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [frequency, setFrequency] = useState(3);
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([
    { day_name: 'Monday', exercises: [], id: uuidv4(), workout_plan_id: '', day_number: 1 },
  ]);

  const addWorkoutDay = () => {
    setWorkoutDays([
      ...workoutDays,
      { day_name: 'New Day', exercises: [], id: uuidv4(), workout_plan_id: '', day_number: workoutDays.length + 1 },
    ]);
  };

  const removeWorkoutDay = (index: number) => {
    setWorkoutDays(workoutDays.filter((_, i) => i !== index));
  };

  const submitPlan = async (planData: any) => {
    const formattedData = {
      ...planData,
      workout_days: JSON.stringify(planData.workout_days), // Store as Json
      workout_plans_user_id: planData.user_id || planData.workout_plans_user_id,
    };
    try {
      const { data: workoutPlan, error: workoutPlanError } = await supabase
        .from('workout_plans')
        .insert(formattedData)
        .select()
        .single();

      if (workoutPlanError) {
        throw workoutPlanError;
      }

      if (workoutPlan) {
        toast({
          title: 'Success',
          description: 'Workout plan created successfully!',
        });
        navigate('/fitness');
      }
    } catch (error: any) {
      console.error('Error creating workout plan:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create workout plan.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="bg-quantum-black/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="text-quantum-cyan">Create Workout Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => submitPlan({ name, description, goal, difficulty, frequency, durationWeeks, workout_days: workoutDays, user_id: user?.id })} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="goal">Goal</Label>
            <Input
              type="text"
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select onValueChange={(value) => setDifficulty(value as 'beginner' | 'intermediate' | 'advanced')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="frequency">Frequency (days per week)</Label>
            <Input
              type="number"
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <Label htmlFor="durationWeeks">Duration (weeks)</Label>
            <Input
              type="number"
              id="durationWeeks"
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <Label>Workout Days</Label>
            {workoutDays.map((day, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input
                  type="text"
                  value={day.day_name}
                  onChange={(e) => {
                    const newWorkoutDays = [...workoutDays];
                    newWorkoutDays[index] = { ...day, day_name: e.target.value };
                    setWorkoutDays(newWorkoutDays);
                  }}
                />
                <Button variant="outline" size="icon" onClick={() => removeWorkoutDay(index)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addWorkoutDay}>
              <Plus className="h-4 w-4 mr-2" />
              Add Workout Day
            </Button>
          </div>
          <Button type="submit" className="bg-quantum-purple hover:bg-quantum-purple/90">
            Create Workout Plan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WorkoutPlanForm;
