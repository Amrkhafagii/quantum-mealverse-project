
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Play, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { WorkoutTemplate } from '@/types/fitness/exercises';

const WorkoutTemplates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [userTemplates, setUserTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
    if (user?.id) {
      fetchUserTemplates();
    }
  }, [user?.id]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('is_public', true)
        .order('difficulty', { ascending: true });

      if (error) throw error;

      const typedTemplates: WorkoutTemplate[] = (data || []).map((template: any) => ({
        ...template,
        difficulty: template.difficulty as 'beginner' | 'intermediate' | 'advanced',
        workout_days: Array.isArray(template.workout_days) 
          ? template.workout_days 
          : JSON.parse(template.workout_days as string),
      }));

      setTemplates(typedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load workout templates",
        variant: "destructive"
      });
    }
  };

  const fetchUserTemplates = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('workout_plans_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedUserTemplates: WorkoutTemplate[] = (data || []).map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        difficulty: plan.difficulty || 'beginner',
        goal: plan.goal || 'general_fitness',
        duration_weeks: plan.duration_weeks || 4,
        frequency: plan.frequency || 3,
        workout_days: Array.isArray(plan.workout_days) 
          ? plan.workout_days 
          : JSON.parse(plan.workout_days as string || '[]'),
        created_at: plan.created_at,
        updated_at: plan.updated_at,
        is_public: false,
        created_by: user.id
      }));

      setUserTemplates(typedUserTemplates);
    } catch (error) {
      console.error('Error fetching user templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkoutFromTemplate = async (template: WorkoutTemplate) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a workout plan.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create workout plan from template
      const { data: workoutPlan, error } = await supabase
        .from('workout_plans')
        .insert({
          workout_plans_user_id: user.id,
          name: template.name,
          description: template.description,
          difficulty: template.difficulty,
          goal: template.goal,
          duration_weeks: template.duration_weeks,
          frequency: template.frequency,
          workout_days: JSON.stringify(template.workout_days)
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Workout plan "${template.name}" created successfully!`,
      });

      // Refresh user templates
      await fetchUserTemplates();
    } catch (error) {
      console.error('Error creating workout from template:', error);
      toast({
        title: "Error",
        description: "Failed to create workout plan from template.",
        variant: "destructive"
      });
    }
  };

  const deleteUserTemplate = async (templateId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', templateId)
        .eq('workout_plans_user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workout template deleted successfully!",
      });

      // Refresh user templates
      await fetchUserTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete workout template.",
        variant: "destructive"
      });
    }
  };

  const TemplateCard = ({ template, isUserTemplate = false }: { template: WorkoutTemplate; isUserTemplate?: boolean }) => (
    <Card className="bg-quantum-black/30 border-quantum-cyan/20 hover:border-quantum-cyan/40 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-quantum-cyan">{template.name}</CardTitle>
            <p className="text-sm text-gray-400 mt-1">{template.description}</p>
          </div>
          <Badge 
            variant="outline" 
            className={`
              ${template.difficulty === 'beginner' ? 'border-green-500 text-green-400' : 
                template.difficulty === 'intermediate' ? 'border-yellow-500 text-yellow-400' : 
                'border-red-500 text-red-400'}
            `}
          >
            {template.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
          <div className="bg-quantum-black/40 p-2 rounded">
            <div className="text-xs text-gray-500">Duration</div>
            <div>{template.duration_weeks}wks</div>
          </div>
          <div className="bg-quantum-black/40 p-2 rounded">
            <div className="text-xs text-gray-500">Frequency</div>
            <div>{template.frequency}/wk</div>
          </div>
          <div className="bg-quantum-black/40 p-2 rounded">
            <div className="text-xs text-gray-500">Days</div>
            <div>{template.workout_days?.length || 0}</div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Goal: {template.goal}</h4>
          <div className="text-xs text-gray-400">
            {template.workout_days?.map((day, index) => (
              <div key={index} className="mb-1">
                • {day.day_name} ({day.exercises?.length || 0} exercises)
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {isUserTemplate ? (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => {/* TODO: Edit functionality */}}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-400 border-red-400 hover:bg-red-400/10"
                onClick={() => deleteUserTemplate(template.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                className="bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90 flex-1"
              >
                <Play className="h-3 w-3 mr-1" />
                Start
              </Button>
            </>
          ) : (
            <Button 
              size="sm" 
              className="bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90 w-full"
              onClick={() => createWorkoutFromTemplate(template)}
            >
              <PlusCircle className="h-3 w-3 mr-1" />
              Use Template
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-quantum-cyan">Workout Templates</h2>
      </div>

      <Tabs defaultValue="public" className="space-y-4">
        <TabsList>
          <TabsTrigger value="public">Public Templates</TabsTrigger>
          <TabsTrigger value="my-templates">My Templates ({userTemplates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="public">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-templates">
          {userTemplates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">You haven't created any workout templates yet.</p>
              <p className="text-sm text-gray-500">Use public templates to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} isUserTemplate />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutTemplates;
