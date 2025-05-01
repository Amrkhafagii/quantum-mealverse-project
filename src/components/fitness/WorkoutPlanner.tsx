
import React, { useState, useEffect } from 'react';
import { WorkoutPlan, WorkoutSet } from '@/types/fitness';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Plus, Dumbbell, Calendar, Check, Edit, Trash } from 'lucide-react';
import { getWorkoutPlans } from '@/services/workoutService';
import { useToast } from '@/hooks/use-toast';

interface WorkoutPlannerProps {
  userId?: string;
  onPlanSelect?: (plan: WorkoutPlan) => void;
}

const WorkoutPlanner: React.FC<WorkoutPlannerProps> = ({ userId, onPlanSelect }) => {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('templates');
  const { toast } = useToast();
  
  useEffect(() => {
    const loadWorkoutPlans = async () => {
      if (!userId) {
        setWorkoutPlans([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { data, error } = await getWorkoutPlans(userId);
        
        if (error) {
          toast({
            title: "Error",
            description: "Failed to load workout plans",
            variant: "destructive",
          });
          return;
        }
        
        if (data) {
          // Separate custom plans and templates
          const templates = data.filter(plan => plan.id?.startsWith('template-'));
          const customPlans = data.filter(plan => !plan.id?.startsWith('template-'));
          
          // If there are custom plans, show them first
          if (customPlans.length > 0) {
            setWorkoutPlans(customPlans.concat(templates));
            setActiveTab('my-plans');
          } else {
            setWorkoutPlans(data);
          }
        }
      } catch (error) {
        console.error('Error loading workout plans:', error);
        toast({
          title: "Error",
          description: "Failed to load workout plans",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadWorkoutPlans();
  }, [userId, toast]);
  
  const renderDifficulty = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Badge className="bg-green-500">Beginner</Badge>;
      case 'intermediate':
        return <Badge className="bg-yellow-500">Intermediate</Badge>;
      case 'advanced':
        return <Badge className="bg-red-500">Advanced</Badge>;
      default:
        return <Badge>{difficulty}</Badge>;
    }
  };
  
  const renderGoal = (goal: string) => {
    switch (goal) {
      case 'strength':
        return <Badge className="bg-blue-500">Strength</Badge>;
      case 'hypertrophy':
        return <Badge className="bg-purple-500">Hypertrophy</Badge>;
      case 'endurance':
        return <Badge className="bg-orange-500">Endurance</Badge>;
      case 'weight_loss':
        return <Badge className="bg-pink-500">Weight Loss</Badge>;
      default:
        return <Badge>{goal}</Badge>;
    }
  };
  
  const handlePlanSelect = (plan: WorkoutPlan) => {
    if (onPlanSelect) {
      onPlanSelect(plan);
    }
  };
  
  const addNewExercise = (dayIndex: number) => {
    // Create a new empty exercise
    const newExercise: WorkoutSet = {
      exercise_id: `ex-${Date.now()}`,
      exercise_name: 'New Exercise',
      sets: 3,
      reps: 10,
      weight: 0,
      completed: false,
    };
    
    // Example of how to add it - in a real app, you'd update the state and database
    console.log('Adding exercise:', newExercise, 'to day:', dayIndex);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }
  
  // Filter plans based on active tab
  const filteredPlans = activeTab === 'templates' 
    ? workoutPlans.filter(plan => plan.id?.startsWith('template-'))
    : workoutPlans.filter(plan => !plan.id?.startsWith('template-'));
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-quantum-cyan">Workout Plans</h2>
        <Button className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-white">
          <Plus size={18} className="mr-2" /> Create Plan
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="my-plans">My Plans</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-plans">
          {filteredPlans.length === 0 ? (
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardContent className="pt-6 text-center">
                <div className="mb-4">
                  <Dumbbell size={64} className="mx-auto text-quantum-cyan opacity-50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Custom Plans Yet</h3>
                <p className="text-gray-400 mb-4">Create your own workout plan or use one of our templates to get started.</p>
                <Button className="bg-quantum-cyan hover:bg-quantum-cyan/90">
                  <Plus size={18} className="mr-2" /> Create Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((plan) => (
                <WorkoutPlanCard 
                  key={plan.id} 
                  plan={plan} 
                  onSelect={handlePlanSelect} 
                  renderDifficulty={renderDifficulty}
                  renderGoal={renderGoal}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <WorkoutPlanCard 
                key={plan.id} 
                plan={plan} 
                onSelect={handlePlanSelect} 
                renderDifficulty={renderDifficulty}
                renderGoal={renderGoal}
                isTemplate
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface WorkoutPlanCardProps {
  plan: WorkoutPlan;
  onSelect: (plan: WorkoutPlan) => void;
  renderDifficulty: (difficulty: string) => JSX.Element;
  renderGoal: (goal: string) => JSX.Element;
  isTemplate?: boolean;
}

const WorkoutPlanCard: React.FC<WorkoutPlanCardProps> = ({ 
  plan, 
  onSelect, 
  renderDifficulty,
  renderGoal,
  isTemplate = false
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 hover:border-quantum-cyan/50 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-quantum-cyan text-xl">{plan.name}</CardTitle>
          {!isTemplate && (
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                <Edit size={18} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                <Trash size={18} />
              </Button>
            </div>
          )}
        </div>
        <CardDescription className="text-gray-400">{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {renderDifficulty(plan.difficulty)}
          {renderGoal(plan.goal)}
          <Badge variant="outline">{plan.frequency}x / week</Badge>
          <Badge variant="outline">{plan.duration_weeks} weeks</Badge>
        </div>
        
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full mb-4 border-quantum-cyan/30 hover:border-quantum-cyan">
              View Workout Details
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-quantum-darkBlue border-quantum-cyan/30 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-quantum-cyan text-2xl">{plan.name}</DialogTitle>
              <DialogDescription className="text-gray-400">{plan.description}</DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-wrap gap-2 mb-4 mt-2">
              {renderDifficulty(plan.difficulty)}
              {renderGoal(plan.goal)}
              <Badge variant="outline">{plan.frequency}x / week</Badge>
              <Badge variant="outline">{plan.duration_weeks} weeks</Badge>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {plan.workout_days.map((day, dayIndex) => (
                <AccordionItem key={dayIndex} value={`day-${dayIndex}`} className="border-quantum-cyan/20">
                  <AccordionTrigger className="text-quantum-cyan hover:text-quantum-cyan/90">
                    {day.day_name}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {day.exercises.map((exercise, exIndex) => (
                        <div key={exIndex} className="p-4 bg-quantum-black/40 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{exercise.exercise_name}</h4>
                            <div className="flex items-center gap-2">
                              {exercise.completed && (
                                <Check size={16} className="text-green-500" />
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm text-gray-400">
                            <div>Sets: {exercise.sets}</div>
                            <div>Reps: {exercise.reps || 'N/A'}</div>
                            <div>Weight: {exercise.weight ? `${exercise.weight} kg` : 'Body weight'}</div>
                            {exercise.duration && <div>Duration: {exercise.duration}s</div>}
                            {exercise.rest_time && <div>Rest: {exercise.rest_time}s</div>}
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-quantum-cyan hover:text-quantum-cyan/80"
                        onClick={() => addNewExercise(dayIndex)}
                      >
                        <Plus size={16} className="mr-1" /> Add Exercise
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </DialogContent>
        </Dialog>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full bg-quantum-cyan hover:bg-quantum-cyan/90"
          onClick={() => onSelect(plan)}
        >
          <Calendar className="mr-2 h-4 w-4" /> Schedule This Plan
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WorkoutPlanner;
