
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dumbbell, Clock, Target, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { WorkoutTemplate } from '@/types/fitness/exercises';

const WorkoutTemplates: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedGoal, setSelectedGoal] = useState<string>('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('is_public', true)
        .order('difficulty', { ascending: true });

      if (error) throw error;

      // Transform the data to match our WorkoutTemplate interface
      const typedTemplates: WorkoutTemplate[] = (data || []).map((template: any) => ({
        id: template.id,
        name: template.name,
        description: template.description || '',
        difficulty: template.difficulty as 'beginner' | 'intermediate' | 'advanced',
        goal: template.goal || 'general_fitness',
        duration_weeks: template.duration_weeks || 4,
        frequency: template.frequency || 3,
        workout_days: Array.isArray(template.workout_days) 
          ? template.workout_days 
          : JSON.parse(template.workout_days as string),
        created_at: template.created_at,
        updated_at: template.updated_at,
        is_public: template.is_public,
        created_by: template.created_by,
        duration_minutes: template.duration_minutes
      }));

      setTemplates(typedTemplates);
    } catch (error) {
      console.error('Error fetching workout templates:', error);
      toast({
        title: "Error",
        description: "Failed to load workout templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesDifficulty = selectedDifficulty === '' || template.difficulty === selectedDifficulty;
    const matchesGoal = selectedGoal === '' || template.goal === selectedGoal;
    return matchesDifficulty && matchesGoal;
  });

  const useTemplate = async (template: WorkoutTemplate) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use workout templates",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a new workout plan based on the template
      const { data: workoutPlan, error: planError } = await supabase
        .from('workout_plans')
        .insert({
          workout_plans_user_id: user.id,
          name: template.name,
          description: template.description,
          difficulty: template.difficulty,
          goal: template.goal,
          duration_weeks: template.duration_weeks,
          frequency: template.frequency,
          workout_days: template.workout_days,
          template_id: template.id
        })
        .select()
        .single();

      if (planError) throw planError;

      toast({
        title: "Template Applied!",
        description: `${template.name} has been added to your workout plans`,
      });

    } catch (error) {
      console.error('Error applying template:', error);
      toast({
        title: "Error",
        description: "Failed to apply workout template",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-quantum-cyan">Workout Templates</h2>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {templates.length} Available
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <Button
            variant={selectedDifficulty === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDifficulty('')}
          >
            All Levels
          </Button>
          {['beginner', 'intermediate', 'advanced'].map(difficulty => (
            <Button
              key={difficulty}
              variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDifficulty(difficulty)}
              className="capitalize"
            >
              {difficulty}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant={selectedGoal === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedGoal('')}
          >
            All Goals
          </Button>
          {['strength', 'cardio', 'weight_loss', 'muscle_gain', 'general_fitness'].map(goal => (
            <Button
              key={goal}
              variant={selectedGoal === goal ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGoal(goal)}
              className="capitalize"
            >
              {goal.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="holographic-card border-quantum-cyan/30 hover:border-quantum-cyan">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-quantum-cyan">{template.name}</CardTitle>
                <Badge 
                  variant={template.difficulty === 'beginner' ? 'secondary' : 
                          template.difficulty === 'intermediate' ? 'default' : 'destructive'}
                  className="capitalize"
                >
                  {template.difficulty}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-300">{template.description}</p>
              
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {template.duration_weeks} weeks
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Users className="h-3 w-3" />
                  {template.frequency}x/week
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Target className="h-3 w-3" />
                  <span className="capitalize">{template.goal.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Dumbbell className="h-3 w-3" />
                  {template.workout_days.length} days
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white">Workout Days:</h4>
                <ScrollArea className="h-20">
                  <div className="space-y-1">
                    {template.workout_days.map((day, index) => (
                      <div key={index} className="text-xs text-gray-400">
                        <span className="font-medium">{day.day_name}:</span> {day.exercises.length} exercises
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Button 
                onClick={() => useTemplate(template)}
                className="w-full bg-quantum-cyan hover:bg-quantum-cyan/80"
                disabled={!user}
              >
                Use This Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">No templates found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default WorkoutTemplates;
