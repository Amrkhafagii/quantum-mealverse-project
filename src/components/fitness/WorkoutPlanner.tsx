import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Dumbbell, Calendar, Edit, Trash2, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import WorkoutPlanForm from './workout/WorkoutPlanForm';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { useAuth } from '@/hooks/useAuth';
import { WorkoutPlan } from '@/types/fitness';

// Helper components - should be moved to their own files for a proper refactoring
const CreatePlanButton = () => (
  <Button className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black">
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

const PlanCard = ({ plan, onEdit, onDelete, onStart }: { plan: WorkoutPlan, onEdit: (plan: WorkoutPlan) => void, onDelete: (planId: string) => void, onStart: (plan: WorkoutPlan) => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-quantum-black/30 border border-quantum-cyan/10 rounded-lg p-5 hover:border-quantum-cyan/30 transition-colors"
  >
    <div className="flex justify-between items-start mb-3">
      <h3 className="font-semibold text-lg">{plan.name}</h3>
      <Badge variant="secondary" className="bg-quantum-purple/20 text-quantum-purple">
        {plan.difficulty}
      </Badge>
    </div>
    <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
    <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
      <div className="bg-quantum-black/40 p-2 rounded">
        <div className="text-xs text-gray-500">Days</div>
        <div>{plan.frequency}/week</div>
      </div>
      <div className="bg-quantum-black/40 p-2 rounded">
        <div className="text-xs text-gray-500">Duration</div>
        <div>{plan.duration_weeks}wks</div>
      </div>
      <div className="bg-quantum-black/40 p-2 rounded">
        <div className="text-xs text-gray-500">Target</div>
        <div>{plan.goal}</div>
      </div>
    </div>
    <div className="flex justify-between gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="text-xs flex-1"
        onClick={() => onEdit(plan)}
      >
        <Edit className="mr-1 h-3 w-3" />
        Edit
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-xs text-red-400 hover:text-red-300"
        onClick={() => onDelete(plan.id)}
      >
        <Trash2 className="mr-1 h-3 w-3" />
        Delete
      </Button>
      <Button 
        size="sm" 
        className="text-xs bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90 flex-1"
        onClick={() => onStart(plan)}
      >
        <Play className="mr-1 h-3 w-3" />
        Start
      </Button>
    </div>
  </motion.div>
);

// Main component
const WorkoutPlanner = () => {
  const { user } = useAuth();
  const { workoutPlans, isLoading, fetchWorkoutPlans } = useWorkoutData();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchWorkoutPlans(user.id);
    }
  }, [user?.id, fetchWorkoutPlans]);

  const handleCreatePlan = async (planData: Omit<WorkoutPlan, "id" | "user_id" | "created_at" | "updated_at">) => {
    // try {
    //   setIsLoading(true);
    //   // Ensure user is available
    //   if (!user?.id) {
    //     console.error("User ID is missing.");
    //     return;
    //   }

    //   // Create a new workout plan object with the user ID and other details
    //   const newPlan: WorkoutPlan = {
    //     ...planData,
    //     user_id: user.id,
    //     id: `workout-plan-${Date.now()}`, // Temporary ID
    //     created_at: new Date().toISOString(),
    //     updated_at: new Date().toISOString(),
    //   };

    //   // Update the workout plans state with the new plan
    //   setWorkoutPlans(prevPlans => [...prevPlans, newPlan]);
    //   setShowCreateForm(false);
    //   toast({
    //     title: "Success",
    //     description: "New workout plan created!",
    //   });
    // } catch (error) {
    //   console.error("Error creating workout plan:", error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to create workout plan.",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const handleEditPlan = (plan: WorkoutPlan) => {
    setEditingPlan(plan);
    setShowCreateForm(true);
  };

  const handleDeletePlan = async (planId: string) => {
    // try {
    //   setIsLoading(true);
    //   // Delete the workout plan
    //   setWorkoutPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
    //   toast({
    //     title: "Success",
    //     description: "Workout plan deleted!",
    //   });
    // } catch (error) {
    //   console.error("Error deleting workout plan:", error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to delete workout plan.",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const handleStartWorkout = (plan: WorkoutPlan) => {
    // try {
    //   setIsLoading(true);
    //   // Start the workout
    //   toast({
    //     title: "Success",
    //     description: `Starting workout: ${plan.name}!`,
    //   });
    // } catch (error) {
    //   console.error("Error starting workout:", error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to start workout.",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsLoading(false);
    // }
  };

  if (showCreateForm) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {editingPlan ? 'Edit Workout Plan' : 'Create New Workout Plan'}
            </CardTitle>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreateForm(false);
                setEditingPlan(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <WorkoutPlanForm 
            onSubmit={handleCreatePlan}
            isLoading={isLoading}
          />
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
          
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> 
            Create New Plan
          </Button>
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
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-quantum-black/40 p-6 rounded-full mb-4">
                  <Dumbbell className="h-12 w-12 text-quantum-cyan" />
                </div>
                <h3 className="text-xl font-medium mb-2">No Workout Plans Yet</h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  Create your first workout plan to start tracking your fitness journey. 
                  Customize exercises, set goals, and monitor your progress.
                </p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
                >
                  <PlusCircle className="mr-2 h-5 w-5" /> 
                  Create New Plan
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workoutPlans.map(plan => (
                  <PlanCard 
                    key={plan.id} 
                    plan={plan} 
                    onEdit={handleEditPlan}
                    onDelete={handleDeletePlan}
                    onStart={handleStartWorkout}
                  />
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
