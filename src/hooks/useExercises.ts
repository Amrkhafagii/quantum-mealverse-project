
import { useState, useEffect } from 'react';
import { Exercise } from '@/types/fitness/exercises';

// Mock exercise data with the required properties
const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'Push-ups',
    target_muscle: 'chest',
    sets: 3,
    reps: 10,
    description: 'Classic bodyweight exercise for chest, shoulders, and triceps',
    muscle_groups: ['chest', 'shoulders', 'triceps'],
    difficulty: 'beginner',
    instructions: 'Start in plank position, lower body until chest nearly touches floor, push back up'
  },
  {
    id: '2',
    name: 'Squats',
    target_muscle: 'quadriceps',
    sets: 3,
    reps: 15,
    description: 'Fundamental lower body exercise targeting legs and glutes',
    muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
    difficulty: 'beginner',
    instructions: 'Stand with feet shoulder-width apart, lower hips back and down, return to standing'
  },
  {
    id: '3',
    name: 'Deadlifts',
    target_muscle: 'hamstrings',
    sets: 3,
    reps: 8,
    description: 'Compound movement for posterior chain strength',
    muscle_groups: ['hamstrings', 'glutes', 'back'],
    difficulty: 'intermediate',
    instructions: 'Hinge at hips, keep back straight, lift weight by extending hips and knees'
  },
  {
    id: '4',
    name: 'Pull-ups',
    target_muscle: 'back',
    sets: 3,
    reps: 5,
    description: 'Upper body pulling exercise for back and biceps',
    muscle_groups: ['back', 'biceps'],
    difficulty: 'intermediate',
    instructions: 'Hang from bar, pull body up until chin clears bar, lower with control'
  },
  {
    id: '5',
    name: 'Bench Press',
    target_muscle: 'chest',
    sets: 3,
    reps: 8,
    description: 'Classic chest building exercise',
    muscle_groups: ['chest', 'shoulders', 'triceps'],
    difficulty: 'intermediate',
    instructions: 'Lie on bench, lower bar to chest, press up to full extension'
  },
  {
    id: '6',
    name: 'Plank',
    target_muscle: 'abs',
    sets: 3,
    reps: '60 seconds',
    description: 'Isometric core strengthening exercise',
    muscle_groups: ['abs', 'core'],
    difficulty: 'beginner',
    instructions: 'Hold plank position with straight line from head to heels'
  }
];

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setExercises(mockExercises);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const searchExercises = (query: string) => {
    if (!query.trim()) return exercises;
    
    return exercises.filter(exercise =>
      exercise.name.toLowerCase().includes(query.toLowerCase()) ||
      exercise.muscle_groups?.some(group => 
        group.toLowerCase().includes(query.toLowerCase())
      ) ||
      exercise.target_muscle.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getExercisesByMuscleGroup = (muscleGroup: string) => {
    return exercises.filter(exercise =>
      exercise.muscle_groups?.includes(muscleGroup) ||
      exercise.target_muscle === muscleGroup
    );
  };

  const getExercisesByDifficulty = (difficulty: string) => {
    return exercises.filter(exercise => exercise.difficulty === difficulty);
  };

  return {
    exercises,
    isLoading,
    searchExercises,
    getExercisesByMuscleGroup,
    getExercisesByDifficulty
  };
};
