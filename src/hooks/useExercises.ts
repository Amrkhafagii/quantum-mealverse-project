
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

      // Type cast and fill in all required Exercise fields
      const typedExercises: Exercise[] = (data || []).map(exercise => {
        // Defensive conversion of muscle_groups
        const rawMuscleGroups = exercise.muscle_groups;
        let muscleGroups: string[];
        if (Array.isArray(rawMuscleGroups)) {
          muscleGroups = rawMuscleGroups.map(String);
        } else if (typeof rawMuscleGroups === "string") {
          muscleGroups = rawMuscleGroups.split(",").map((g: string) => g.trim());
        } else {
          muscleGroups = [];
        }

        return {
          ...exercise,
          difficulty: exercise.difficulty as 'beginner' | 'intermediate' | 'advanced',
          muscle_groups: muscleGroups,
          // Ensure required fields exist, else fallback/default
          target_muscle: exercise.target_muscle || muscleGroups[0] || "",
          sets: typeof exercise.sets === "number" ? exercise.sets : 3, // default 3
          reps: typeof exercise.reps === "number" ? exercise.reps : 10, // default 10
        };
      });

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
