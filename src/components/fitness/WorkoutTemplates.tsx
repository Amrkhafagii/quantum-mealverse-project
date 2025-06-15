
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, Clock, Target, TrendingUp, Search, Filter } from 'lucide-react';
import { WorkoutTemplate } from '@/types/fitness/exercises';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface WorkoutTemplatesProps {
  onTemplateSelect?: (template: WorkoutTemplate) => void;
  showApplyButton?: boolean;
}

export const WorkoutTemplates: React.FC<WorkoutTemplatesProps> = ({
  onTemplateSelect,
  showApplyButton = true
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  
  // Filters
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [goalFilter, setGoalFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [templates, difficultyFilter, goalFilter, durationFilter, searchTerm]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load workout templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...templates];

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(t => t.difficulty === difficultyFilter);
    }

    // Apply goal filter
    if (goalFilter !== 'all') {
      filtered = filtered.filter(t => t.goal === goalFilter);
    }

    // Apply duration filter
    if (durationFilter !== 'all') {
      const weeks = parseInt(durationFilter);
      filtered = filtered.filter(t => t.duration_weeks === weeks);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleApplyTemplate = async (template: WorkoutTemplate) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to apply workout templates",
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
          name: `${template.name} - Personal Plan`,
          description: template.description,
          difficulty: template.difficulty,
          goal: template.goal,
          duration_weeks: template.duration_weeks,
          is_active: true
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create workout days from template
      if (Array.isArray(template.workout_days)) {
        for (const day of template.workout_days) {
          const { error: dayError } = await supabase
            .from('workout_days')
            .insert({
              workout_plan_id: workoutPlan.id,
              day_name: day.day_name,
              exercises: day.exercises || []
            });

          if (dayError) throw dayError;
        }
      }

      toast({
        title: "Template Applied!",
        description: `${template.name} has been added to your workout plans`,
      });

      if (onTemplateSelect) {
        onTemplateSelect(template);
      }
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
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-quantum-cyan">Workout Templates</h2>
          <Badge variant="outline" className="bg-quantum-darkBlue/20">
            {filteredTemplates.length} templates
          </Badge>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={goalFilter} onValueChange={setGoalFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Goals</SelectItem>
              <SelectItem value="weight_loss">Weight Loss</SelectItem>
              <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
              <SelectItem value="strength">Strength</SelectItem>
              <SelectItem value="endurance">Endurance</SelectItem>
              <SelectItem value="general_fitness">General Fitness</SelectItem>
            </SelectContent>
          </Select>

          <Select value={durationFilter} onValueChange={setDurationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Duration</SelectItem>
              <SelectItem value="4">4 weeks</SelectItem>
              <SelectItem value="8">8 weeks</SelectItem>
              <SelectItem value="12">12 weeks</SelectItem>
              <SelectItem value="16">16 weeks</SelectItem>
            </SelectContent>
          </Select>
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
                <Badge className={getDifficultyColor(template.difficulty)}>
                  {template.difficulty}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Duration:</span>
                  </div>
                  <span className="font-medium">{template.duration_weeks} weeks</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Frequency:</span>
                  </div>
                  <span className="font-medium">{template.frequency}x/week</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Goal:</span>
                  </div>
                  <span className="font-medium capitalize">
                    {template.goal?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1" size="sm">
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>{template.name}</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh]">
                      <div className="space-y-4">
                        <p className="text-gray-600">{template.description}</p>
                        {Array.isArray(template.workout_days) && template.workout_days.map((day: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">{day.day_name}</h4>
                            <div className="space-y-1">
                              {day.exercises?.map((exercise: any, exIndex: number) => (
                                <div key={exIndex} className="text-sm text-gray-600">
                                  • {exercise.name} - {exercise.sets} sets × {exercise.reps} reps
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>

                {showApplyButton && (
                  <Button
                    onClick={() => handleApplyTemplate(template)}
                    className="cyber-button flex-1"
                    size="sm"
                  >
                    Apply
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No templates found</p>
          <p className="text-sm text-gray-400">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
};

export default WorkoutTemplates;
