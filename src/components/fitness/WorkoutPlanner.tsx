import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Dumbbell, Calendar, Edit, Trash2, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { useToast } from '@/hooks/use-toast';
import { WorkoutPlan } from '@/types/fitness';
import { createWorkoutPlan } from '@/services/workout/workoutCreateService';
import WorkoutPlanForm from './workout/WorkoutPlanForm';

const WorkoutPlanner = () => {
  const { user } = useAuth();
  const { workoutPlans, fetchWorkoutPlans, isLoading } = useWorkoutData();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchWorkoutPlans(user.id);
    }
  }, [user?.id, fetchWorkoutPlans]);

  const handleCreatePlan = async (planData: Omit<WorkoutPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a workout plan.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newPlan: WorkoutPlan = {
        ...planData,
        id: crypto.randomUUID(),
        user_id: user.id, // Use authenticated user's UUID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await createWorkoutPlan(newPlan);
      
      if (result) {
        toast({
          title: "Success",
          description: "Workout plan created successfully!",
        });
        setShowCreateForm(false);
        // Refresh the plans list
        await fetchWorkoutPlans(user.id);
      } else {
        throw new Error("Failed to create workout plan");
      }
    } catch (error) {
      console.error('Error creating workout plan:', error);
      toast({
        title: "Error",
        description: "Failed to create workout plan. Please try again.",
        variant: "destructive"
      });
    }
  };

  const CreatePlanButton = () => (
    <Button 
      className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
      onClick={() => setShowCreateForm(true)}
    >
      <PlusCircle className="mr-2 h-5 w-5" /> Create New Plan
    </Button>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-quantum-black/40 p-6 rounded-full mb-4">
        <Dumbbell className="h-12 w-12 text-quantum-cyan" />
      </div>
      <h3 className="text-xl font-medium mb-2">No Workout Plans Yet</h3>
      <p className="text-gray-400 mb-6 max-w-md">
        Create your first workout plan to start tracking your fitness journey. 
        Customize exercises, set goals, and monitor your progress.
      </p>
      <CreatePlanButton />
    </div>
  );

  const PlanCard = ({ plan }: { plan: WorkoutPlan }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-quantum-black/30 border border-quantum-cyan/10 rounded-lg p-5 hover:border-quantum-cyan/30 transition-colors"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{plan.name}</h3>
        <Badge variant="outline" className="bg-quantum-purple/20 text-quantum-purple">
          {plan.difficulty}
        </Badge>
      </div>
      <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
      <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
        <div className="bg-quantum-black/40 p-2 rounded">
          <div className="text-xs text-gray-500">Frequency</div>
          <div>{plan.frequency}/week</div>
        </div>
        <div className="bg-quantum-black/40 p-2 rounded">
          <div className="text-xs text-gray-500">Duration</div>
          <div>{plan.duration_weeks}wks</div>
        </div>
        <div className="bg-quantum-black/40 p-2 rounded">
          <div className="text-xs text-gray-500">Goal</div>
          <div className="truncate">{plan.goal}</div>
        </div>
      </div>
      <div className="flex justify-between gap-2">
        <Button variant="outline" size="sm" className="text-xs flex-1">
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <Trash2 className="h-3 w-3" />
        </Button>
        <Button size="sm" className="text-xs bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90 flex-1">
          <Play className="h-3 w-3 mr-1" />
          Start
        </Button>
      </div>
    </motion.div>
  );

  if (showCreateForm) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Create New Workout Plan</CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <WorkoutPlanForm />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-quantum-cyan" />
            Workout Planner
          </CardTitle>
          
          {workoutPlans.length > 0 && (
            <CreatePlanButton />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="my-plans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="my-plans">My Plans</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-plans">
            {workoutPlans.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workoutPlans.map(plan => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="templates">
            <div className="py-12 text-center">
              <p className="text-gray-400">Workout templates coming soon!</p>
            </div>
          </TabsContent>
          
          <TabsContent value="recommended">
            <div className="py-12 text-center">
              <p className="text-gray-400">Personalized recommendations coming soon!</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WorkoutPlanner;
