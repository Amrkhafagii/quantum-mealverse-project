
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users, Target, Plus, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutTemplate } from '@/types/fitness/exercises';

const WorkoutTemplates: React.FC = () => {
  const { user } = useAuth();
  const { templates, isLoading } = useWorkoutTemplates();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [creatingFromTemplate, setCreatingFromTemplate] = useState(false);

  const handleUseTemplate = async (template: WorkoutTemplate) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to use workout templates.",
        variant: "destructive"
      });
      return;
    }

    try {
      setCreatingFromTemplate(true);
      
      // Create a new workout plan based on the template
      const newPlan = {
        workout_plans_user_id: user.id,
        name: `${template.name} - Custom`,
        description: template.description,
        difficulty: template.difficulty,
        goal: template.goal || 'General Fitness',
        duration_weeks: template.duration_weeks || 4,
        frequency: template.frequency || 3,
        workout_days: JSON.stringify(template.workout_days),
        template_id: template.id,
        is_custom: true
      };

      const { data, error } = await supabase
        .from('workout_plans')
        .insert(newPlan)
        .select()
        .single();

      if (error) throw error;

      // Create workout days for the plan
      if (template.workout_days && template.workout_days.length > 0) {
        const workoutDaysInserts = template.workout_days.map((day, index) => ({
          workout_plan_id: data.id,
          day_name: day.day_name,
          day_number: index + 1,
          exercises: JSON.stringify(day.exercises)
        }));

        const { error: daysError } = await supabase
          .from('workout_days')
          .insert(workoutDaysInserts);

        if (daysError) {
          console.error('Error creating workout days:', daysError);
        }
      }

      toast({
        title: "Template Applied!",
        description: `Created a new workout plan based on "${template.name}"`,
      });

      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error using template:', error);
      toast({
        title: "Error",
        description: "Failed to create workout plan from template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCreatingFromTemplate(false);
    }
  };

  const TemplateCard = ({ template }: { template: WorkoutTemplate }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-quantum-black/30 border-quantum-cyan/10 hover:border-quantum-cyan/30 transition-all cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg text-white">{template.name}</CardTitle>
            <Badge variant="outline" className="bg-quantum-purple/20 text-quantum-purple capitalize">
              {template.difficulty}
            </Badge>
          </div>
          <p className="text-sm text-gray-400 line-clamp-2">{template.description}</p>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
            <div className="bg-quantum-black/40 p-2 rounded">
              <Clock className="h-4 w-4 mx-auto mb-1 text-quantum-cyan" />
              <div className="text-xs text-gray-500">Duration</div>
              <div>{template.duration_weeks || 4}wks</div>
            </div>
            <div className="bg-quantum-black/40 p-2 rounded">
              <Users className="h-4 w-4 mx-auto mb-1 text-quantum-cyan" />
              <div className="text-xs text-gray-500">Frequency</div>
              <div>{template.frequency || 3}/week</div>
            </div>
            <div className="bg-quantum-black/40 p-2 rounded">
              <Target className="h-4 w-4 mx-auto mb-1 text-quantum-cyan" />
              <div className="text-xs text-gray-500">Goal</div>
              <div className="truncate">{template.goal || 'Fitness'}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={() => setSelectedTemplate(template)}
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              View Details
            </Button>
            <Button 
              onClick={() => handleUseTemplate(template)}
              disabled={creatingFromTemplate}
              size="sm" 
              className="w-full bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              {creatingFromTemplate ? 'Creating...' : 'Use Template'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const TemplateDetails = ({ template }: { template: WorkoutTemplate }) => (
    <Card className="bg-quantum-black/30 border-quantum-cyan/20">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-quantum-cyan">{template.name}</CardTitle>
            <Badge variant="outline" className="mt-2 capitalize">
              {template.difficulty}
            </Badge>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedTemplate(null)}
          >
            Close
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-gray-300">{template.description}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-quantum-cyan">{template.duration_weeks || 4}</div>
              <div className="text-sm text-gray-400">Weeks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-quantum-cyan">{template.frequency || 3}</div>
              <div className="text-sm text-gray-400">Days/Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-quantum-cyan">{template.workout_days?.length || 0}</div>
              <div className="text-sm text-gray-400">Workout Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-quantum-cyan">
                {template.workout_days?.reduce((total, day) => total + (day.exercises?.length || 0), 0) || 0}
              </div>
              <div className="text-sm text-gray-400">Total Exercises</div>
            </div>
          </div>

          {template.workout_days && template.workout_days.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Workout Schedule</h4>
              <div className="space-y-3">
                {template.workout_days.map((day, index) => (
                  <div key={index} className="bg-quantum-black/40 p-3 rounded">
                    <h5 className="font-medium text-quantum-cyan mb-2">{day.day_name}</h5>
                    <div className="text-sm text-gray-300">
                      {day.exercises?.length || 0} exercises
                      {day.estimated_duration && (
                        <span className="ml-2 text-gray-400">
                          • ~{day.estimated_duration} minutes
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={() => handleUseTemplate(template)}
            disabled={creatingFromTemplate}
            className="w-full bg-quantum-cyan text-quantum-black hover:bg-quantum-cyan/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            {creatingFromTemplate ? 'Creating Workout Plan...' : 'Use This Template'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-quantum-cyan">Workout Templates</h2>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {templates.length} Available
        </Badge>
      </div>

      {selectedTemplate ? (
        <TemplateDetails template={selectedTemplate} />
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="beginner">Beginner</TabsTrigger>
            <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="beginner">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.filter(t => t.difficulty === 'beginner').map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="intermediate">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.filter(t => t.difficulty === 'intermediate').map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.filter(t => t.difficulty === 'advanced').map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {templates.length === 0 && (
        <div className="text-center py-12">
          <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-medium mb-2">No Templates Available</h3>
          <p className="text-gray-400">
            Workout templates will appear here once they're available.
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkoutTemplates;
