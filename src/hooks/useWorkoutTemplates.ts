
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutTemplate } from '@/types/fitness/exercises';
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
      setTemplates(data || []);
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
