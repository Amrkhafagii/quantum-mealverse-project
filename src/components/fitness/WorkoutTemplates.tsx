
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Clock, Target, TrendingUp, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  goal: string;
  duration_weeks: number;
  frequency: number;
  workout_days: any[];
  created_at?: string;
  updated_at?: string;
  is_public?: boolean;
  created_by?: string;
}

const WorkoutTemplates: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedGoal, setSelectedGoal] = useState<string>('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('is_public', true)
        .order('difficulty');

      if (error) throw error;
      
      // Map the data to match our interface
      const mappedTemplates: WorkoutTemplate[] = (data || []).map((template: any) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        difficulty: template.difficulty as 'beginner' | 'intermediate' | 'advanced',
        goal: template.goal,
        duration_weeks: template.duration_weeks,
        frequency: template.frequency,
        workout_days: Array.isArray(template.workout_days) 
          ? template.workout_days 
          : JSON.parse(template.workout_days as string || '[]'),
        created_at: template.created_at,
        updated_at: template.updated_at,
        is_public: template.is_public,
        created_by: template.created_by
      }));

      setTemplates(mappedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGoalColor = (goal: string) => {
    switch (goal) {
      case 'weight_loss': return 'bg-blue-100 text-blue-800';
      case 'muscle_gain': return 'bg-purple-100 text-purple-800';
      case 'strength': return 'bg-red-100 text-red-800';
      case 'endurance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTemplates = templates.filter(template => {
    const difficultyMatch = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    const goalMatch = selectedGoal === 'all' || template.goal === selectedGoal;
    return difficultyMatch && goalMatch;
  });

  const createWorkoutPlanFromTemplate = async (template: WorkoutTemplate) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a workout plan",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .insert({
          user_id: user.id,
          name: template.name,
          description: template.description,
          difficulty: template.difficulty,
          goal: template.goal,
          frequency: template.frequency,
          duration_weeks: template.duration_weeks,
          workout_days: template.workout_days
        })
        .select()
        .single();

      if (error) throw error;

      // Create workout days
      if (template.workout_days && template.workout_days.length > 0) {
        const workoutDaysPromises = template.workout_days.map((day: any, index: number) =>
          supabase
            .from('workout_plans')
            .update({
              workout_days: template.workout_days
            })
            .eq('id', data.id)
        );

        await Promise.all(workoutDaysPromises);
      }

      toast({
        title: "Success!",
        description: `Created workout plan: ${template.name}`,
        variant: "default"
      });

    } catch (error) {
      console.error('Error creating workout plan:', error);
      toast({
        title: "Error",
        description: "Failed to create workout plan",
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-quantum-cyan">Workout Templates</h2>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {filteredTemplates.length} Templates
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Difficulty</label>
          <div className="flex gap-2">
            {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
              <Button
                key={level}
                variant={selectedDifficulty === level ? 'default' : 'outline'}
                onClick={() => setSelectedDifficulty(level)}
                className="capitalize text-xs"
                size="sm"
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Goal</label>
          <div className="flex gap-2">
            {['all', 'general_fitness', 'weight_loss', 'muscle_gain', 'strength', 'endurance'].map((goal) => (
              <Button
                key={goal}
                variant={selectedGoal === goal ? 'default' : 'outline'}
                onClick={() => setSelectedGoal(goal)}
                className="capitalize text-xs"
                size="sm"
              >
                {goal.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="holographic-card hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-quantum-cyan">
                  {template.name}
                </CardTitle>
                <div className="flex gap-1">
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                </div>
              </div>
              <Badge className={getGoalColor(template.goal)}>
                {template.goal.replace('_', ' ')}
              </Badge>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-300">{template.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Duration:</span>
                  </div>
                  <span className="font-medium text-white">{template.duration_weeks} weeks</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Frequency:</span>
                  </div>
                  <span className="font-medium text-white">{template.frequency}x/week</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Workouts:</span>
                  </div>
                  <span className="font-medium text-white">{template.workout_days.length} days</span>
                </div>
              </div>

              {/* Preview of workout days */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">Workout Days:</p>
                <ScrollArea className="h-20">
                  <div className="space-y-1">
                    {template.workout_days.slice(0, 3).map((day: any, index: number) => (
                      <div key={index} className="text-xs text-gray-400 flex justify-between">
                        <span>{day.day_name}</span>
                        <span>{day.exercises?.length || 0} exercises</span>
                      </div>
                    ))}
                    {template.workout_days.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{template.workout_days.length - 3} more days
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <Button
                onClick={() => createWorkoutPlanFromTemplate(template)}
                className="w-full cyber-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Workout Plan
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No templates found matching your criteria.</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters to see more options.</p>
        </div>
      )}
    </div>
  );
};

export default WorkoutTemplates;
