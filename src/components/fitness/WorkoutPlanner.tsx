import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { WorkoutPlan, WorkoutDay, WorkoutSet } from '@/types/fitness';
import { Plus, Trash, Save, Dumbbell, Calendar, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveWorkoutPlan, getWorkoutPlans } from '@/services/workoutService';

interface WorkoutPlannerProps {
  userId?: string;
  onPlanSelect?: (plan: WorkoutPlan) => void;
}

const WorkoutPlanner = ({ userId, onPlanSelect }: WorkoutPlannerProps) => {
  const { toast } = useToast();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPlanDialog, setShowNewPlanDialog] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  
  // New plan template
  const [newPlan, setNewPlan] = useState<WorkoutPlan>({
    id: '',
    user_id: userId || '',
    name: '',
    description: '',
    goal: 'strength',
    frequency: 3,
    difficulty: 'beginner',
    duration_weeks: 4,
    created_at: '',
    updated_at: '',
    workout_days: []
  });
  
  // Get plans on component mount
  useEffect(() => {
    if (userId) {
      fetchWorkoutPlans();
    }
  }, [userId]);
  
  // Fetch workout plans from database
  const fetchWorkoutPlans = async () => {
    setLoading(true);
    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await getWorkoutPlans(userId);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setWorkoutPlans(data);
      } else {
        // Generate some default templates if no plans exist
        setWorkoutPlans(generateDefaultTemplates());
      }
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workout plans. Using default templates.',
        variant: 'destructive',
      });
      setWorkoutPlans(generateDefaultTemplates());
    } finally {
      setLoading(false);
    }
  };
  
  // Generate some default workout plan templates
  const generateDefaultTemplates = (): WorkoutPlan[] => {
    return [
      {
        id: 'template-1',
        user_id: userId || '',
        name: 'Beginner Strength Training',
        description: 'A simple plan to build basic strength for beginners',
        goal: 'strength',
        frequency: 3,
        difficulty: 'beginner',
        duration_weeks: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        workout_days: [
          {
            day_name: 'Day 1 - Full Body',
            exercises: [
              {
                exercise_id: 'ex1',
                exercise_name: 'Squats',
                sets: 3,
                reps: 10,
                weight: 0,
                rest_time: 60,
                completed: false,
              },
              {
                exercise_id: 'ex2',
                exercise_name: 'Push-ups',
                sets: 3,
                reps: 10,
                completed: false,
              },
              {
                exercise_id: 'ex3',
                exercise_name: 'Dumbbell Rows',
                sets: 3,
                reps: 10,
                weight: 5,
                completed: false,
              }
            ],
            completed: false,
          },
          {
            day_name: 'Day 2 - Full Body',
            exercises: [
              {
                exercise_id: 'ex4',
                exercise_name: 'Lunges',
                sets: 3,
                reps: 10,
                completed: false,
              },
              {
                exercise_id: 'ex5',
                exercise_name: 'Dumbbell Shoulder Press',
                sets: 3,
                reps: 10,
                weight: 5,
                completed: false,
              },
              {
                exercise_id: 'ex6',
                exercise_name: 'Plank',
                sets: 3,
                duration: 30,
                completed: false,
                reps: 0,
              }
            ],
            completed: false,
          },
          {
            day_name: 'Day 3 - Full Body',
            exercises: [
              {
                exercise_id: 'ex7',
                exercise_name: 'Deadlifts',
                sets: 3,
                reps: 10,
                weight: 10,
                completed: false,
              },
              {
                exercise_id: 'ex8',
                exercise_name: 'Bench Press',
                sets: 3,
                reps: 10,
                weight: 15,
                completed: false,
              },
              {
                exercise_id: 'ex9',
                exercise_name: 'Pull-ups',
                sets: 3,
                reps: 5,
                completed: false,
              }
            ],
            completed: false,
          }
        ]
      },
      {
        id: 'template-2',
        user_id: userId || '',
        name: 'Hypertrophy Focus',
        description: 'Build muscle mass with higher volume training',
        goal: 'hypertrophy',
        frequency: 4,
        difficulty: 'intermediate',
        duration_weeks: 6,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        workout_days: [
          {
            day_name: 'Day 1 - Chest & Triceps',
            exercises: [
              {
                exercise_id: 'ex10',
                exercise_name: 'Bench Press',
                sets: 4,
                reps: 12,
                weight: 20,
                completed: false,
              },
              {
                exercise_id: 'ex11',
                exercise_name: 'Incline Dumbbell Press',
                sets: 3,
                reps: 12,
                weight: 15,
                completed: false,
              },
              {
                exercise_id: 'ex12',
                exercise_name: 'Tricep Pushdowns',
                sets: 3,
                reps: 15,
                weight: 15,
                completed: false,
              }
            ],
            completed: false,
          },
          {
            day_name: 'Day 2 - Back & Biceps',
            exercises: [
              {
                exercise_id: 'ex13',
                exercise_name: 'Lat Pulldown',
                sets: 4,
                reps: 12,
                weight: 30,
                completed: false,
              },
              {
                exercise_id: 'ex14',
                exercise_name: 'Seated Row',
                sets: 3,
                reps: 12,
                weight: 25,
                completed: false,
              },
              {
                exercise_id: 'ex15',
                exercise_name: 'Bicep Curls',
                sets: 4,
                reps: 12,
                weight: 10,
                completed: false,
              }
            ],
            completed: false,
          }
        ]
      }
    ];
  };
  
  // Handle input changes for new plan
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewPlan(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle adding a new workout day
  const addWorkoutDay = () => {
    const newDay: WorkoutDay = {
      day_name: `Day ${newPlan.workout_days.length + 1}`,
      exercises: [],
      completed: false,
    };
    
    setNewPlan(prev => ({
      ...prev,
      workout_days: [...prev.workout_days, newDay]
    }));
  };
  
  // Handle updating a workout day
  const updateWorkoutDay = (index: number, field: keyof WorkoutDay, value: any) => {
    setNewPlan(prev => {
      const updatedDays = [...prev.workout_days];
      updatedDays[index] = {
        ...updatedDays[index],
        [field]: value
      };
      return {
        ...prev,
        workout_days: updatedDays
      };
    });
  };
  
  // Add exercise to a workout day
  const addExercise = (dayIndex: number) => {
    const newExercise: WorkoutSet = {
      exercise_id: `temp-${Date.now()}`,
      exercise_name: 'New Exercise',
      sets: 3,
      reps: 10,
      completed: false,
    };
    
    setNewPlan(prev => {
      const updatedDays = [...prev.workout_days];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        exercises: [...updatedDays[dayIndex].exercises, newExercise]
      };
      return {
        ...prev,
        workout_days: updatedDays
      };
    });
  };
  
  // Update exercise
  const updateExercise = (dayIndex: number, exerciseIndex: number, field: keyof WorkoutSet, value: any) => {
    setNewPlan(prev => {
      const updatedDays = [...prev.workout_days];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        exercises: updatedDays[dayIndex].exercises.map((ex, idx) =>
          idx === exerciseIndex ? { ...ex, [field]: value } : ex
        )
      };
      return {
        ...prev,
        workout_days: updatedDays
      };
    });
  };
  
  // Delete exercise
  const deleteExercise = (dayIndex: number, exerciseIndex: number) => {
    setNewPlan(prev => {
      const updatedDays = [...prev.workout_days];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        exercises: updatedDays[dayIndex].exercises.filter((_, idx) => idx !== exerciseIndex)
      };
      return {
        ...prev,
        workout_days: updatedDays
      };
    });
  };
  
  // Save workout plan
  const handleSavePlan = async () => {
    try {
      setSavingPlan(true);
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Complete the plan with current timestamp
      const planToSave: WorkoutPlan = {
        ...newPlan,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Call API to save the plan
      const { data, error } = await saveWorkoutPlan(planToSave);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Success',
        description: 'Workout plan saved successfully'
      });
      
      // Refresh workout plans
      fetchWorkoutPlans();
      
      // Close dialog
      setShowNewPlanDialog(false);
      
      // Reset form
      setNewPlan({
        id: '',
        user_id: userId,
        name: '',
        description: '',
        goal: 'strength',
        frequency: 3,
        difficulty: 'beginner',
        duration_weeks: 4,
        created_at: '',
        updated_at: '',
        workout_days: []
      });
      
    } catch (error) {
      console.error('Error saving workout plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save workout plan',
        variant: 'destructive',
      });
    } finally {
      setSavingPlan(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-quantum-cyan">Workout Plans</h2>
        <Button 
          onClick={() => setShowNewPlanDialog(true)}
          className="bg-quantum-purple hover:bg-quantum-purple/90"
        >
          <Plus className="h-4 w-4 mr-2" /> Create New Plan
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading workout plans...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workoutPlans.map((plan) => (
            <Card 
              key={plan.id}
              className="bg-quantum-darkBlue/30 border-quantum-cyan/20 hover:border-quantum-cyan/50 cursor-pointer transition-all"
              onClick={() => onPlanSelect && onPlanSelect(plan)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  <span className={`text-xs font-medium rounded-full px-2 py-1 ${
                    plan.difficulty === 'beginner' ? 'bg-green-900/50 text-green-400' : 
                    plan.difficulty === 'intermediate' ? 'bg-amber-900/50 text-amber-400' : 
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1)}
                  </span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Dumbbell className="h-4 w-4 mr-2 text-quantum-purple" />
                      <span className="text-sm">
                        {plan.goal.charAt(0).toUpperCase() + plan.goal.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-quantum-purple" />
                      <span className="text-sm">{plan.frequency} days/week</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-gray-400">Workout Days:</h4>
                    <div className="space-y-1">
                      {plan.workout_days.slice(0, 3).map((day, index) => (
                        <div key={index} className="text-sm flex justify-between">
                          <span>{day.day_name}</span>
                          <span className="text-gray-400">{day.exercises.length} exercises</span>
                        </div>
                      ))}
                      {plan.workout_days.length > 3 && (
                        <div className="text-sm text-gray-400">
                          +{plan.workout_days.length - 3} more days
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-quantum-cyan hover:bg-quantum-cyan/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlanSelect && onPlanSelect(plan);
                    }}
                  >
                    Use This Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create New Plan Dialog */}
      <Dialog open={showNewPlanDialog} onOpenChange={setShowNewPlanDialog}>
        <DialogContent className="sm:max-w-[900px] bg-quantum-darkBlue text-white border-quantum-cyan/20">
          <DialogHeader>
            <DialogTitle>Create New Workout Plan</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="details" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Plan Details</TabsTrigger>
              <TabsTrigger value="workouts">Workout Days</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={newPlan.name} 
                    onChange={handleInputChange} 
                    placeholder="e.g., 5x5 Strength Program" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    value={newPlan.description} 
                    onChange={handleInputChange} 
                    placeholder="What's this plan about?" 
                    rows={3} 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal">Goal</Label>
                    <Select 
                      name="goal" 
                      value={newPlan.goal}
                      onValueChange={(value) => setNewPlan(prev => ({ ...prev, goal: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strength">Strength</SelectItem>
                        <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                        <SelectItem value="endurance">Endurance</SelectItem>
                        <SelectItem value="weight_loss">Weight Loss</SelectItem>
                        <SelectItem value="general">General Fitness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select 
                      name="difficulty" 
                      value={newPlan.difficulty}
                      onValueChange={(value) => setNewPlan(prev => ({ ...prev, difficulty: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Days per Week</Label>
                    <Select 
                      name="frequency" 
                      value={newPlan.frequency.toString()}
                      onValueChange={(value) => setNewPlan(prev => ({ ...prev, frequency: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Days per week" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="2">2 days</SelectItem>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="4">4 days</SelectItem>
                        <SelectItem value="5">5 days</SelectItem>
                        <SelectItem value="6">6 days</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration_weeks">Program Duration (Weeks)</Label>
                    <Select 
                      name="duration_weeks" 
                      value={newPlan.duration_weeks.toString()}
                      onValueChange={(value) => setNewPlan(prev => ({ ...prev, duration_weeks: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Duration in weeks" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 week</SelectItem>
                        <SelectItem value="2">2 weeks</SelectItem>
                        <SelectItem value="4">4 weeks</SelectItem>
                        <SelectItem value="6">6 weeks</SelectItem>
                        <SelectItem value="8">8 weeks</SelectItem>
                        <SelectItem value="12">12 weeks</SelectItem>
                        <SelectItem value="16">16 weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button type="button" variant="outline" className="mr-2" onClick={() => setShowNewPlanDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  disabled={!newPlan.name || newPlan.workout_days.length === 0}
                  onClick={() => document.querySelector('[data-value="workouts"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
                  className="bg-quantum-purple hover:bg-quantum-purple/90"
                >
                  Next: Add Workouts
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="workouts" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Workout Days</h3>
                <Button 
                  type="button" 
                  onClick={addWorkoutDay}
                  variant="outline"
                  className="text-quantum-purple border-quantum-purple"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Day
                </Button>
              </div>
              
              {newPlan.workout_days.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-gray-500 rounded-lg">
                  <p className="text-gray-400">No workout days added yet. Click "Add Day" to create your workout.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {newPlan.workout_days.map((day, dayIndex) => (
                    <Card key={dayIndex} className="bg-quantum-black/30 border-quantum-cyan/10">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <Input 
                            value={day.day_name}
                            onChange={(e) => updateWorkoutDay(dayIndex, 'day_name', e.target.value)}
                            className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addExercise(dayIndex)}
                            className="text-quantum-purple border-quantum-purple"
                          >
                            <Plus className="h-4 w-4 mr-1" /> Exercise
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {day.exercises.length === 0 ? (
                            <p className="text-sm text-gray-400">No exercises added yet.</p>
                          ) : (
                            day.exercises.map((exercise, exerciseIndex) => (
                              <div 
                                key={exerciseIndex} 
                                className="grid grid-cols-12 gap-2 items-center bg-quantum-black/20 p-2 rounded-md"
                              >
                                <div className="col-span-4 md:col-span-3">
                                  <Input
                                    value={exercise.exercise_name}
                                    onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'exercise_name', e.target.value)}
                                    placeholder="Exercise name"
                                    className="h-8"
                                  />
                                </div>
                                <div className="col-span-2 md:col-span-2">
                                  <div className="flex items-center">
                                    <span className="text-xs text-gray-400 mr-2">Sets:</span>
                                    <Input
                                      type="number"
                                      value={exercise.sets}
                                      onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'sets', parseInt(e.target.value))}
                                      className="h-8"
                                    />
                                  </div>
                                </div>
                                <div className="col-span-2 md:col-span-2">
                                  <div className="flex items-center">
                                    <span className="text-xs text-gray-400 mr-2">Reps:</span>
                                    <Input
                                      type="number"
                                      value={exercise.reps}
                                      onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'reps', parseInt(e.target.value))}
                                      className="h-8"
                                    />
                                  </div>
                                </div>
                                <div className="col-span-3 md:col-span-2">
                                  <div className="flex items-center">
                                    <span className="text-xs text-gray-400 mr-2">Kg:</span>
                                    <Input
                                      type="number"
                                      value={exercise.weight || 0}
                                      onChange={(e) => updateExercise(dayIndex, exerciseIndex, 'weight', parseInt(e.target.value))}
                                      className="h-8"
                                    />
                                  </div>
                                </div>
                                <div className="col-span-1 text-right">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-950/20"
                                    onClick={() => deleteExercise(dayIndex, exerciseIndex)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => document.querySelector('[data-value="details"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
                >
                  Back to Details
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSavePlan}
                  disabled={savingPlan || !newPlan.name || newPlan.workout_days.length === 0}
                  className="bg-quantum-purple hover:bg-quantum-purple/90"
                >
                  {savingPlan ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" /> Save Workout Plan
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutPlanner;
