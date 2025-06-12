
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkoutPlan, WorkoutDay, Exercise } from '@/types/fitness';
import { PlusCircle } from 'lucide-react';

export interface WorkoutPlanFormProps {
  onSubmit: (planData: Omit<WorkoutPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  isLoading?: boolean;
}

const WorkoutPlanForm: React.FC<WorkoutPlanFormProps> = ({ onSubmit, isLoading = false }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [frequency, setFrequency] = useState(3);
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const planData = {
      name,
      description,
      goal,
      difficulty,
      frequency,
      duration_weeks: durationWeeks,
      workout_days: workoutDays,
    };
    
    await onSubmit(planData);
  };

  const addWorkoutDay = () => {
    const newDay: WorkoutDay = {
      day_name: `Day ${workoutDays.length + 1}`,
      exercises: []
    };
    setWorkoutDays([...workoutDays, newDay]);
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle>Create Workout Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workout plan name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your workout plan"
            />
          </div>

          <div>
            <Label htmlFor="goal">Goal</Label>
            <Input
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What's your fitness goal? (e.g., Build muscle, Lose weight)"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={difficulty} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => setDifficulty(value)}>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="frequency">Frequency (days per week)</Label>
              <Input
                id="frequency"
                type="number"
                min="1"
                max="7"
                value={frequency}
                onChange={(e) => setFrequency(parseInt(e.target.value))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="duration">Duration (weeks)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="52"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(parseInt(e.target.value))}
                required
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Workout Days</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addWorkoutDay}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Day
              </Button>
            </div>
            
            {workoutDays.length === 0 && (
              <p className="text-sm text-gray-400">No workout days added yet. Click "Add Day" to get started.</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Workout Plan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WorkoutPlanForm;
