
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Dumbbell } from 'lucide-react';
import { useExercises } from '@/hooks/useExercises';
import { Exercise } from '@/types/fitness/exercises';

interface ExerciseSelectorProps {
  onExerciseSelect: (exercise: Exercise) => void;
  selectedExercises: Exercise[];
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  onExerciseSelect,
  selectedExercises
}) => {
  const { exercises, isLoading, searchExercises } = useExercises();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

  const muscleGroups = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'glutes', 'abs', 'core'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = searchQuery === '' || 
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.muscle_groups.some(group => 
        group.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesMuscleGroup = selectedMuscleGroup === '' || 
      exercise.muscle_groups.includes(selectedMuscleGroup);
    
    const matchesDifficulty = selectedDifficulty === '' || 
      exercise.difficulty === selectedDifficulty;

    return matchesSearch && matchesMuscleGroup && matchesDifficulty;
  });

  const isExerciseSelected = (exercise: Exercise) => {
    return selectedExercises.some(selected => selected.id === exercise.id);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Dumbbell className="mr-2 h-5 w-5" />
          Exercise Library
        </CardTitle>
        
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex flex-wrap gap-1">
              <Button
                variant={selectedMuscleGroup === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMuscleGroup('')}
              >
                All Muscles
              </Button>
              {muscleGroups.map(group => (
                <Button
                  key={group}
                  variant={selectedMuscleGroup === group ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMuscleGroup(group)}
                  className="capitalize"
                >
                  {group}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            {difficulties.map(difficulty => (
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
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="text-center py-8">Loading exercises...</div>
          ) : (
            <div className="space-y-2">
              {filteredExercises.map(exercise => (
                <div
                  key={exercise.id}
                  className={`p-3 border rounded-lg transition-colors ${
                    isExerciseSelected(exercise) 
                      ? 'border-quantum-cyan bg-quantum-cyan/10' 
                      : 'border-border hover:border-quantum-cyan/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{exercise.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {exercise.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {exercise.muscle_groups.map(group => (
                          <Badge key={group} variant="secondary" className="text-xs capitalize">
                            {group}
                          </Badge>
                        ))}
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {exercise.difficulty}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onExerciseSelect(exercise)}
                      disabled={isExerciseSelected(exercise)}
                      className="ml-2"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
