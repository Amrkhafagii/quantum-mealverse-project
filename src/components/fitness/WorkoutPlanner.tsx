import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { PlusCircle, Calendar, Dumbbell } from 'lucide-react';
import { WorkoutPlan } from '@/types/fitness';
import { getUserWorkoutPlans } from '@/services/workoutService';

const WorkoutPlanner: React.FC = () => {
  const { user } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const plans = await getUserWorkoutPlans(user.id);
        setWorkoutPlans(plans);
      } catch (error) {
        console.error('Error fetching workout plans:', error);
        toast.error('Failed to load workout plans');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutPlans();
  }, [user]);

  const handleCreatePlan = () => {
    setIsCreating(true);
    setSelectedPlan(null);
  };

  const handleEditPlan = (plan: WorkoutPlan) => {
    setIsEditing(true);
    setSelectedPlan(plan);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedPlan(null);
  };

  const handleSavePlan = async (planData: WorkoutPlan) => {
    // Implement save logic here (create or update)
    console.log('Saving plan:', planData);
    toast.success('Workout plan saved successfully');
    handleCancel();
  };

  const handleDeletePlan = async (planId: string) => {
    // Implement delete logic here
    console.log('Deleting plan:', planId);
    toast.success('Workout plan deleted successfully');
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="text-quantum-cyan">Workout Planner</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="plans">My Plans</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="plans">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Your Workout Plans</h3>
              <Button onClick={handleCreatePlan} className="bg-quantum-purple hover:bg-quantum-purple/90">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Plan
              </Button>
            </div>
            {loading ? (
              <div>Loading workout plans...</div>
            ) : workoutPlans.length === 0 ? (
              <div>No workout plans created yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workoutPlans.map((plan) => (
                  <Card key={plan.id} className="bg-quantum-black/50">
                    <CardContent>
                      <h4 className="text-md font-semibold">{plan.name}</h4>
                      <p className="text-sm text-gray-400">{plan.description}</p>
                      <Button variant="secondary" size="sm" className="mt-2" onClick={() => handleEditPlan(plan)}>
                        <Dumbbell className="h-4 w-4 mr-2" />
                        Edit Plan
                      </Button>
                      <Button variant="destructive" size="sm" className="mt-2 ml-2" onClick={() => handleDeletePlan(plan.id)}>
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="schedule">
            <div>
              <h3 className="text-lg font-semibold mb-4">Workout Schedule</h3>
              <p>Coming soon: Plan your workouts and set reminders.</p>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WorkoutPlanner;

// Mock Trash icon component
const Trash = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-trash"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);
