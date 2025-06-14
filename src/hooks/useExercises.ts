
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/fitness/exercises';
import { useToast } from '@/hooks/use-toast';

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
      if (error) throw error;

      // Type cast the difficulty and make sure all muscle_groups are string[]
      const typedExercises: Exercise[] = (data || []).map(exercise => ({
        ...exercise,
        difficulty: exercise.difficulty as 'beginner' | 'intermediate' | 'advanced',
        muscle_groups: Array.isArray(exercise.muscle_groups)
          ? exercise.muscle_groups
          : typeof exercise.muscle_groups === "string"
            ? exercise.muscle_groups.split(",").map((g: string) => g.trim()) : [],
      }));

      setExercises(typedExercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast({
        title: "Error",
        description: "Failed to load exercises",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const getExercisesByMuscleGroup = (muscleGroup: string) => {
    return exercises.filter(exercise => 
      exercise.muscle_groups.includes(muscleGroup.toLowerCase())
    );
  };

  const getExercisesByDifficulty = (difficulty: string) => {
    return exercises.filter(exercise => exercise.difficulty === difficulty);
  };

  const searchExercises = (query: string) => {
    return exercises.filter(exercise =>
      exercise.name.toLowerCase().includes(query.toLowerCase()) ||
      exercise.muscle_groups.some(group => 
        group.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  return {
    exercises,
    isLoading,
    fetchExercises,
    getExercisesByMuscleGroup,
    getExercisesByDifficulty,
    searchExercises
  };
}
