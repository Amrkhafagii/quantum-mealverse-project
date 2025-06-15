
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Exercise } from '@/types/fitness/exercises';

interface ExerciseLibraryProps {
  onSelectExercise?: (exercise: Exercise) => void;
  mode?: 'browse' | 'select';
}

const sampleExercises: Exercise[] = [
  {
    id: '1',
    name: 'Push-ups',
    target_muscle: 'chest',
    sets: 3,
    reps: 12,
    rest: 60,
    description: 'Classic bodyweight exercise for upper body strength',
    muscle_groups: ['chest', 'shoulders', 'triceps'],
    difficulty: 'beginner',
    equipment_needed: ['bodyweight']
  },
  {
    id: '2',
    name: 'Squats',
    target_muscle: 'legs',
    sets: 3,
    reps: 15,
    rest: 90,
    description: 'Fundamental lower body exercise',
    muscle_groups: ['quadriceps', 'glutes', 'hamstrings'],
    difficulty: 'beginner',
    equipment_needed: ['bodyweight']
  },
  {
    id: '3',
    name: 'Deadlifts',
    target_muscle: 'back',
    sets: 3,
    reps: 8,
    rest: 120,
    weight: 135,
    description: 'Compound movement for posterior chain',
    muscle_groups: ['hamstrings', 'glutes', 'back'],
    difficulty: 'intermediate',
    equipment_needed: ['barbell', 'weights']
  },
  {
    id: '4',
    name: 'Plank',
    target_muscle: 'core',
    sets: 3,
    reps: '30-60 seconds',
    rest: 45,
    description: 'Isometric core strengthening exercise',
    muscle_groups: ['core', 'shoulders'],
    difficulty: 'beginner',
    equipment_needed: ['bodyweight']
  }
];

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  onSelectExercise,
  mode = 'browse'
}) => {
  const [exercises, setExercises] = useState<Exercise[]>(sampleExercises);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>(exercises);
  const [searchTerm, setSearchTerm] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  useEffect(() => {
    let filtered = exercises;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.target_muscle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply muscle group filter
    if (muscleFilter !== 'all') {
      filtered = filtered.filter(exercise =>
        exercise.target_muscle === muscleFilter ||
        exercise.muscle_groups?.includes(muscleFilter)
      );
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(exercise =>
        exercise.difficulty === difficultyFilter
      );
    }

    setFilteredExercises(filtered);
  }, [exercises, searchTerm, muscleFilter, difficultyFilter]);

  const handleSelectExercise = (exercise: Exercise) => {
    if (onSelectExercise) {
      onSelectExercise(exercise);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold text-quantum-cyan">Exercise Library</h2>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={muscleFilter} onValueChange={setMuscleFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Muscle Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Muscles</SelectItem>
              <SelectItem value="chest">Chest</SelectItem>
              <SelectItem value="back">Back</SelectItem>
              <SelectItem value="legs">Legs</SelectItem>
              <SelectItem value="shoulders">Shoulders</SelectItem>
              <SelectItem value="arms">Arms</SelectItem>
              <SelectItem value="core">Core</SelectItem>
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((exercise) => (
          <Card key={exercise.id} className="holographic-card hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-quantum-cyan">{exercise.name}</CardTitle>
                <Badge className={getDifficultyColor(exercise.difficulty || 'beginner')}>
                  {exercise.difficulty || 'beginner'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">{exercise.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Target:</span>
                  <span className="font-medium capitalize">{exercise.target_muscle}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sets × Reps:</span>
                  <span className="font-medium">{exercise.sets} × {exercise.reps}</span>
                </div>
                
                {exercise.weight && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Weight:</span>
                    <span className="font-medium">{exercise.weight} lbs</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Rest:</span>
                  <span className="font-medium">{exercise.rest}s</span>
                </div>
              </div>

              {exercise.muscle_groups && (
                <div className="flex flex-wrap gap-1">
                  {exercise.muscle_groups.map((muscle, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              )}

              {mode === 'select' && (
                <Button
                  onClick={() => handleSelectExercise(exercise)}
                  className="w-full cyber-button"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Exercise
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No exercises found matching your filters.</p>
        </div>
      )}
    </div>
  );
};
