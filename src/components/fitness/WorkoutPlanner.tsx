
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Dumbbell, Calendar, Edit3, Trash2, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { WorkoutPlanForm } from './workout/WorkoutPlanForm';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { useAuth } from '@/hooks/useAuth';
import { WorkoutPlan } from '@/types/fitness/workouts';
import { WorkoutTemplate } from '@/types/fitness/exercises';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const WorkoutPlanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { workoutPlans, fetchWorkoutPlans, isLoading } = useWorkoutData();
  const { templates, getTemplatesByDifficulty } = useWorkoutTemplates();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePlan = async (planData: Omit<WorkoutPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      
      // Convert workout_days to JSON for database storage
      const dbData = {
        ...planData,
        user_id: user.id,
        workout_days: JSON.parse(JSON.stringify(planData.workout_days)) // Ensure proper JSON serialization
      };
      
      const { error } = await supabase
        .from('workout_plans')
        .insert(dbData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workout plan created successfully!"
      });

      setShowCreateForm(false);
      fetchWorkoutPlans(user.id);
    } catch (error) {
      console.error('Error creating workout plan:', error);
      toast({
        title: "Error",
        description: "Failed to create workout plan",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPlan = async (planData: Omit<WorkoutPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!editingPlan || !user) return;

    try {
      setIsSubmitting(true);
      
      // Convert workout_days to JSON for database storage
      const dbData = {
        ...planData,
        workout_days: JSON.parse(JSON.stringify(planData.workout_days))
      };
      
      const { error } = await supabase
        .from('workout_plans')
        .update(dbData)
        .eq('id', editingPlan.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workout plan updated successfully!"
      });

      setEditingPlan(null);
      fetchWorkoutPlans(user.id);
    } catch (error) {
      console.error('Error updating workout plan:', error);
      toast({
        title: "Error",
        description: "Failed to update workout plan",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workout plan deleted successfully!"
      });

      fetchWorkoutPlans(user.id);
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete workout plan",
        variant: "destructive"
      });
    }
  };

  const handleUseTemplate = async (template: WorkoutTemplate) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      
      const dbData = {
        name: `${template.name} (Copy)`,
        description: template.description,
        goal: template.goal,
        difficulty: template.difficulty,
        frequency: template.frequency_per_week,
        duration_weeks: template.duration_weeks,
        workout_days: JSON.parse(JSON.stringify(template.workout_days)),
        template_id: template.id,
        is_custom: false,
        user_id: user.id
      };
      
      const { error } = await supabase
        .from('workout_plans')
        .insert(dbData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template added to your workout plans!"
      });

      fetchWorkoutPlans(user.id);
    } catch (error) {
      console.error('Error using template:', error);
      toast({
        title: "Error",
        description: "Failed to use template",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showCreateForm || editingPlan) {
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
            onSubmit={editingPlan ? handleEditPlan : handleCreatePlan}
            initialData={editingPlan || undefined}
            isLoading={isSubmitting}
          />
        </CardContent>
      </Card>
    );
  }

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
      <Button onClick={() => setShowCreateForm(true)} className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black">
        <PlusCircle className="mr-2 h-5 w-5" />
        Create New Plan
      </Button>
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
        <Badge variant="outline" className="capitalize">
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
          <div className="text-xs text-gray-500">Exercises</div>
          <div>{plan.workout_days.reduce((total, day) => total + day.exercises.length, 0)}</div>
        </div>
      </div>
      <div className="flex justify-between gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => setEditingPlan(plan)}
        >
          <Edit3 className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleDeletePlan(plan.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button 
          size="sm" 
          className="flex-1 bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90"
        >
          <Play className="h-4 w-4 mr-1" />
          Start
        </Button>
      </div>
    </motion.div>
  );

  const TemplateCard = ({ template }: { template: any }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-quantum-black/30 border border-quantum-cyan/10 rounded-lg p-5 hover:border-quantum-cyan/30 transition-colors"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{template.name}</h3>
        <Badge variant="outline" className="capitalize">
          {template.difficulty}
        </Badge>
      </div>
      <p className="text-sm text-gray-400 mb-4">{template.description}</p>
      <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
        <div className="bg-quantum-black/40 p-2 rounded">
          <div className="text-xs text-gray-500">Days</div>
          <div>{template.frequency_per_week}/week</div>
        </div>
        <div className="bg-quantum-black/40 p-2 rounded">
          <div className="text-xs text-gray-500">Duration</div>
          <div>{template.duration_weeks}wks</div>
        </div>
        <div className="bg-quantum-black/40 p-2 rounded">
          <div className="text-xs text-gray-500">Goal</div>
          <div className="capitalize">{template.goal}</div>
        </div>
      </div>
      <Button 
        onClick={() => handleUseTemplate(template)}
        disabled={isSubmitting}
        className="w-full bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90"
      >
        Use Template
      </Button>
    </motion.div>
  );

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
            Create Plan
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="my-plans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="my-plans">My Plans</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-plans">
            {isLoading ? (
              <div className="text-center py-12">Loading your workout plans...</div>
            ) : workoutPlans.length === 0 ? (
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
            <div className="space-y-6">
              {['beginner', 'intermediate', 'advanced'].map(difficulty => {
                const difficultyTemplates = getTemplatesByDifficulty(difficulty);
                if (difficultyTemplates.length === 0) return null;
                
                return (
                  <div key={difficulty}>
                    <h3 className="text-lg font-medium mb-4 capitalize">{difficulty} Templates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {difficultyTemplates.map(template => (
                        <TemplateCard key={template.id} template={template} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WorkoutPlanner;
