
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, Dumbbell, Users, Clock, Target } from 'lucide-react';
import { useExercises } from '@/hooks/useExercises';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { EnhancedTouchTarget, EnhancedResponsiveGrid } from '@/components/ui/enhanced-mobile-breakpoints';
import { Exercise } from '@/types/fitness/exercises';

export const ResponsiveExerciseLibrary: React.FC = () => {
  const { exercises, isLoading, searchExercises } = useExercises();
  const { isMobile, isTablet } = useResponsive();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');

  const filteredExercises = useMemo(() => {
    let filtered = searchQuery ? searchExercises(searchQuery) : exercises;
    
    if (selectedDifficulty) {
      filtered = filtered.filter(ex => ex.difficulty === selectedDifficulty);
    }
    
    if (selectedMuscleGroup) {
      filtered = filtered.filter(ex => 
        ex.target_muscle === selectedMuscleGroup || 
        ex.muscle_groups?.includes(selectedMuscleGroup)
      );
    }
    
    return filtered;
  }, [exercises, searchQuery, selectedDifficulty, selectedMuscleGroup, searchExercises]);

  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const muscleGroups = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio'];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const ExerciseCard: React.FC<{ exercise: Exercise }> = ({ exercise }) => (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 hover:border-quantum-cyan/40 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg text-white truncate pr-2">
            {exercise.name}
          </CardTitle>
          <Badge className={getDifficultyColor(exercise.difficulty || 'beginner')}>
            {exercise.difficulty || 'beginner'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
          {exercise.description || 'No description available'}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-quantum-cyan" />
            <span className="text-gray-400">Target:</span>
            <span className="text-white capitalize">{exercise.target_muscle}</span>
          </div>
          
          {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {exercise.muscle_groups.map((group, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {group}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Dumbbell className="h-4 w-4" />
            <span>{exercise.sets} sets</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{exercise.reps} reps</span>
          </div>
        </div>

        {exercise.instructions && (
          <div className="mt-3 pt-3 border-t border-quantum-cyan/10">
            <p className="text-xs text-gray-400 line-clamp-2">
              {exercise.instructions}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Card className="bg-quantum-black/30 border-quantum-cyan/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
            <p className="ml-3 text-center text-gray-400">Loading exercises...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header and Search */}
      <Card className="bg-quantum-black/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="text-quantum-cyan flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Exercise Library
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-quantum-darkBlue/50 border-quantum-cyan/20 text-white placeholder-gray-400"
            />
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-quantum-cyan" />
              <span className="text-sm text-gray-400">Filters:</span>
            </div>
            
            {/* Difficulty Filter */}
            <div className="space-y-2">
              <span className="text-xs text-gray-400">Difficulty:</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedDifficulty === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty('')}
                  className="text-xs"
                >
                  All
                </Button>
                {difficulties.map(diff => (
                  <Button
                    key={diff}
                    variant={selectedDifficulty === diff ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty(diff)}
                    className="text-xs capitalize"
                  >
                    {diff}
                  </Button>
                ))}
              </div>
            </div>

            {/* Muscle Group Filter */}
            <div className="space-y-2">
              <span className="text-xs text-gray-400">Muscle Group:</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedMuscleGroup === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMuscleGroup('')}
                  className="text-xs"
                >
                  All
                </Button>
                {muscleGroups.map(group => (
                  <Button
                    key={group}
                    variant={selectedMuscleGroup === group ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMuscleGroup(group)}
                    className="text-xs capitalize"
                  >
                    {group}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Grid */}
      <Card className="bg-quantum-black/30 border-quantum-cyan/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">
              {filteredExercises.length} Exercise{filteredExercises.length !== 1 ? 's' : ''}
            </h3>
          </div>

          <ScrollArea className="h-[60vh] lg:h-[70vh]">
            <EnhancedResponsiveGrid 
              cols={{ 
                xs: 1, 
                sm: 1, 
                md: 2, 
                lg: 2, 
                xl: 3 
              }} 
              gap="gap-4"
            >
              {filteredExercises.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </EnhancedResponsiveGrid>

            {filteredExercises.length === 0 && (
              <div className="text-center py-12">
                <Dumbbell className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No exercises found</h3>
                <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResponsiveExerciseLibrary;
