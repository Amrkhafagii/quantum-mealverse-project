
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutTemplate } from '@/types/fitness/exercises';
import { WorkoutDay } from '@/types/fitness/workouts';
import { useToast } from '@/hooks/use-toast';

export function useWorkoutTemplates() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('is_public', true)
        .order('difficulty', { ascending: true });

      if (error) throw error;
      
      // Type cast the data to match our interface with proper JSON parsing
      const typedTemplates: WorkoutTemplate[] = (data || []).map(template => ({
        ...template,
        difficulty: template.difficulty as 'beginner' | 'intermediate' | 'advanced',
        workout_days: Array.isArray(template.workout_days) 
          ? template.workout_days as WorkoutDay[]
          : JSON.parse(template.workout_days as string) as WorkoutDay[]
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const getTemplatesByDifficulty = (difficulty: string) => {
    return templates.filter(template => template.difficulty === difficulty);
  };

  return {
    templates,
    isLoading,
    fetchTemplates,
    getTemplatesByDifficulty
  };
}
