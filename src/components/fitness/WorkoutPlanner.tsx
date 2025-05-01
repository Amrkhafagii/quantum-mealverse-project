
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WorkoutPlan, WorkoutDay, WorkoutSet } from '@/types/fitness';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dumbbell, Plus, Save, X, Edit, Calendar, Check } from 'lucide-react';

interface WorkoutPlannerProps {
  userId?: string;
}

const WorkoutPlanner = ({ userId }: WorkoutPlannerProps) => {
  const { toast } = useToast();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPlanDialog, setNewPlanDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);

  // New plan form state
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planGoal, setPlanGoal] = useState<'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general'>('general');
  const [planFrequency, setPlanFrequency] = useState(3); // Default 3 days per week
  const [planDifficulty, setPlanDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [planDuration, setPlanDuration] = useState(4); // Default 4 weeks
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);

  useEffect(() => {
    if (userId) {
      loadWorkoutPlans();
    }
  }, [userId]);

  useEffect(() => {
    // Generate workout days based on frequency
    if (planFrequency > 0) {
      const newWorkoutDays: WorkoutDay[] = [];
      for (let i = 1; i <= planFrequency; i++) {
        newWorkoutDays.push({
          day_name: `Day ${i}`,
          exercises: [],
          completed: false,
        });
      }
      setWorkoutDays(newWorkoutDays);
    }
  }, [planFrequency]);

  const loadWorkoutPlans = async () => {
    try {
      setLoading(true);
      // In a real implementation, we would fetch from a workout_plans table
      // This is a placeholder until the database schema is updated
      // const { data, error } = await supabase
      //   .from('workout_plans')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .order('created_at', { ascending: false });

      // if (error) throw error;
      
      // Mocked data for now - would come from database
      const mockPlans: WorkoutPlan[] = [
        {
          id: "1",
          user_id: userId || "",
          name: "Beginner Strength Training",
          description: "A simple strength training routine for beginners",
          goal: "strength",
          frequency: 3,
          difficulty: "beginner",
          duration_weeks: 4,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          workout_days: [
            {
              day_name: "Day 1 - Push",
              exercises: [
                {
                  exercise_id: "ex1",
                  exercise_name: "Push-ups",
                  sets: 3,
                  reps: 10,
                  completed: false
                },
                {
                  exercise_id: "ex2",
                  exercise_name: "Dumbbell Shoulder Press",
                  sets: 3,
                  reps: 10,
                  weight: 10,
                  completed: false
                }
              ],
              completed: false
            },
            {
              day_name: "Day 2 - Pull",
              exercises: [
                {
                  exercise_id: "ex3",
                  exercise_name: "Dumbbell Rows",
                  sets: 3,
                  reps: 10,
                  weight: 15,
                  completed: false
                }
              ],
              completed: false
            },
            {
              day_name: "Day 3 - Legs",
              exercises: [
                {
                  exercise_id: "ex4",
                  exercise_name: "Bodyweight Squats",
                  sets: 3,
                  reps: 15,
                  completed: false
                }
              ],
              completed: false
            }
          ]
        }
      ];
      
      setWorkoutPlans(mockPlans);
    } catch (error) {
      console.error('Error loading workout plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workout plans.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      if (!userId) {
        toast({
          title: 'Login Required',
          description: 'Please log in to create workout plans.',
          variant: 'destructive',
        });
        return;
      }

      if (!planName) {
        toast({
          title: 'Name Required',
          description: 'Please provide a name for your workout plan.',
          variant: 'destructive',
        });
        return;
      }

      const newPlan: WorkoutPlan = {
        id: `temp-${Date.now()}`, // In production, this would be generated by the database
        user_id: userId,
        name: planName,
        description: planDescription,
        goal: planGoal,
        frequency: planFrequency,
        difficulty: planDifficulty,
        duration_weeks: planDuration,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        workout_days: workoutDays
      };

      // In a real implementation, we would save to database
      // const { data, error } = await supabase
      //   .from('workout_plans')
      //   .insert(newPlan)
      //   .select()
      //   .single();
      
      // if (error) throw error;
      
      // Simulate saving to database
      setWorkoutPlans([newPlan, ...workoutPlans]);
      
      toast({
        title: 'Plan Created',
        description: 'Your workout plan has been created successfully.',
      });
      
      // Reset form
      resetForm();
      setNewPlanDialog(false);
    } catch (error) {
      console.error('Error creating workout plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to create workout plan.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setPlanName('');
    setPlanDescription('');
    setPlanGoal('general');
    setPlanFrequency(3);
    setPlanDifficulty('beginner');
    setPlanDuration(4);
    setWorkoutDays([]);
  };

  if (loading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <p>Loading workout plans...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-quantum-cyan">Your Workout Plans</h2>
        <Dialog open={newPlanDialog} onOpenChange={setNewPlanDialog}>
          <DialogTrigger asChild>
            <Button 
              className="bg-quantum-purple hover:bg-quantum-purple/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-quantum-darkBlue text-white border-quantum-cyan/20">
            <DialogHeader>
              <DialogTitle>Create New Workout Plan</DialogTitle>
              <DialogDescription>
                Design your custom workout plan. You can add exercises to each day after creating the plan.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input 
                  id="name" 
                  value={planName} 
                  onChange={(e) => setPlanName(e.target.value)} 
                  placeholder="My Workout Plan" 
                  className="bg-quantum-black border-quantum-cyan/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  value={planDescription} 
                  onChange={(e) => setPlanDescription(e.target.value)} 
                  placeholder="Describe your workout plan" 
                  className="bg-quantum-black border-quantum-cyan/20"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">Goal</Label>
                  <Select value={planGoal} onValueChange={(value: 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general') => setPlanGoal(value)}>
                    <SelectTrigger className="bg-quantum-black border-quantum-cyan/20">
                      <SelectValue placeholder="Select a goal" />
                    </SelectTrigger>
                    <SelectContent className="bg-quantum-black border-quantum-cyan/20">
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="hypertrophy">Muscle Building</SelectItem>
                      <SelectItem value="endurance">Endurance</SelectItem>
                      <SelectItem value="weight_loss">Weight Loss</SelectItem>
                      <SelectItem value="general">General Fitness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={planDifficulty} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => setPlanDifficulty(value)}>
                    <SelectTrigger className="bg-quantum-black border-quantum-cyan/20">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-quantum-black border-quantum-cyan/20">
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="frequency">Days Per Week</Label>
                  <Select 
                    value={planFrequency.toString()} 
                    onValueChange={(value) => setPlanFrequency(parseInt(value))}
                  >
                    <SelectTrigger className="bg-quantum-black border-quantum-cyan/20">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="bg-quantum-black border-quantum-cyan/20">
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num} day{num > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Weeks)</Label>
                  <Select 
                    value={planDuration.toString()} 
                    onValueChange={(value) => setPlanDuration(parseInt(value))}
                  >
                    <SelectTrigger className="bg-quantum-black border-quantum-cyan/20">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-quantum-black border-quantum-cyan/20">
                      {[1, 2, 4, 6, 8, 12].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num} week{num > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">Workout Days Generated:</h4>
                <div className="flex flex-wrap gap-2">
                  {workoutDays.map((day, index) => (
                    <div key={index} className="px-3 py-1 bg-quantum-black/50 rounded-full text-sm">
                      {day.day_name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setNewPlanDialog(false)}
                className="border-quantum-cyan/20"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePlan}
                className="bg-quantum-purple hover:bg-quantum-purple/90"
              >
                Create Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {workoutPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workoutPlans.map((plan) => (
            <Card key={plan.id} className="holographic-card overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Dumbbell className="text-quantum-purple h-5 w-5" />
                  <span>{plan.name}</span>
                </CardTitle>
                <CardDescription>
                  {plan.description || `${plan.frequency} days/week, ${plan.difficulty} level`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-purple-900/30 p-2 rounded">
                      <div className="text-xs">Goal</div>
                      <div className="font-semibold capitalize">{plan.goal}</div>
                    </div>
                    <div className="bg-blue-900/30 p-2 rounded">
                      <div className="text-xs">Frequency</div>
                      <div className="font-semibold">{plan.frequency} days/wk</div>
                    </div>
                    <div className="bg-green-900/30 p-2 rounded">
                      <div className="text-xs">Duration</div>
                      <div className="font-semibold">{plan.duration_weeks} weeks</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Workout Days:</div>
                    <div className="flex flex-wrap gap-2">
                      {plan.workout_days.map((day, idx) => (
                        <div key={idx} className="px-3 py-1 bg-quantum-darkBlue/70 rounded-full text-xs flex items-center">
                          {day.day_name}
                          {day.completed && <Check className="ml-1 h-3 w-3 text-green-400" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 border-quantum-cyan/20 hover:bg-quantum-cyan/10"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  className="flex-1 bg-quantum-purple hover:bg-quantum-purple/90"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Start
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="pt-6 text-center">
            <p>No workout plans found. Create a new workout plan to get started.</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 p-6">
        <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
          <div>
            <h3 className="text-xl font-bold text-quantum-cyan mb-2">Coming Soon: Workout Tracking</h3>
            <p className="text-gray-300">We're working on features to track your workout progress, log your exercises, and analyze your performance over time.</p>
          </div>
          <Button 
            variant="outline"
            className="border-quantum-cyan text-quantum-cyan hover:bg-quantum-cyan/10"
            disabled
          >
            Join Waitlist
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default WorkoutPlanner;
