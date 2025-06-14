
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

      // Type cast and fill in all required Exercise fields, defaulting/null-checking as needed
      const typedExercises: Exercise[] = (data || []).map((exercise: any) => {
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

        // Normalize instructions to a string array
        let instructions: string[];
        if (Array.isArray(exercise.instructions)) {
          instructions = exercise.instructions.map((item: any) => String(item));
        } else if (typeof exercise.instructions === "string") {
          // Split on \n or treat as single-line array
          if (exercise.instructions.includes('\n')) {
            instructions = exercise.instructions.split('\n').map((g: string) => g.trim()).filter(Boolean);
          } else if (exercise.instructions.includes(',')) {
            // fallback for comma-separated instructions
            instructions = exercise.instructions.split(',').map((g: string) => g.trim()).filter(Boolean);
          } else if (exercise.instructions.trim() !== '') {
            instructions = [exercise.instructions.trim()];
          } else {
            instructions = [];
          }
        } else {
          instructions = [];
        }

        return {
          id: exercise.id,
          exercise_id: exercise.exercise_id,
          name: exercise.name ?? "",
          exercise_name: exercise.exercise_name,
          target_muscle: exercise.target_muscle ?? (muscleGroups[0] ?? ""),
          sets: typeof exercise.sets === "number" ? exercise.sets : 3,
          reps: typeof exercise.reps === "number" || typeof exercise.reps === "string" ? exercise.reps : 10,
          weight: exercise.weight,
          duration: exercise.duration,
          rest_time: exercise.rest_time,
          rest: exercise.rest,
          rest_seconds: exercise.rest_seconds,
          instructions, // always string[]
          description: exercise.description ?? "",
          muscle_groups: muscleGroups,
          difficulty: exercise.difficulty as 'beginner' | 'intermediate' | 'advanced',
          video_url: exercise.video_url ?? "",
          equipment_needed: Array.isArray(exercise.equipment_needed)
            ? exercise.equipment_needed.map(String)
            : typeof exercise.equipment_needed === "string"
              ? exercise.equipment_needed.split(",").map((g: string) => g.trim())
              : [],
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
      exercise.muscle_groups?.includes(muscleGroup.toLowerCase())
    );
  };

  const getExercisesByDifficulty = (difficulty: string) => {
    return exercises.filter(exercise => exercise.difficulty === difficulty);
  };

  const searchExercises = (query: string) => {
    return exercises.filter(exercise =>
      exercise.name.toLowerCase().includes(query.toLowerCase()) ||
      (exercise.muscle_groups ?? []).some(group =>
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
