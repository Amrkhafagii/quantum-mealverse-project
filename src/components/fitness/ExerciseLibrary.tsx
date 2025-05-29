
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useExercises } from '@/hooks/useExercises';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { Search, Filter, Play, Info } from 'lucide-react';
import { Exercise } from '@/types/fitness/exercises';

const ITEM_HEIGHT = 120;
const BUFFER_SIZE = 5;

interface VirtualizedListProps {
  items: Exercise[];
  onExerciseSelect: (exercise: Exercise) => void;
}

const VirtualizedExerciseList: React.FC<VirtualizedListProps> = ({ items, onExerciseSelect }) => {
  const { isMobile } = useResponsive();
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE
    );
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * ITEM_HEIGHT;

  return (
    <div
      className="relative overflow-auto"
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      ref={(el) => {
        if (el) {
          setContainerHeight(el.clientHeight || 600);
        }
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleRange.startIndex * ITEM_HEIGHT}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onSelect={onExerciseSelect}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect: (exercise: Exercise) => void;
  isMobile: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onSelect, isMobile }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card 
      className={`mb-3 transition-all duration-200 hover:shadow-lg cursor-pointer ${
        isMobile ? 'mx-2' : ''
      }`}
      style={{ height: ITEM_HEIGHT - 12 }}
      onClick={() => onSelect(exercise)}
    >
      <CardContent className="p-4 h-full flex items-center">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{exercise.name}</h3>
            <Badge className={getDifficultyColor(exercise.difficulty)}>
              {exercise.difficulty}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {exercise.description || 'No description available'}
          </p>
          
          <div className="flex flex-wrap gap-1">
            {exercise.muscle_groups.slice(0, 3).map((group) => (
              <Badge key={group} variant="outline" className="text-xs">
                {group}
              </Badge>
            ))}
            {exercise.muscle_groups.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{exercise.muscle_groups.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        
        <div className="ml-4 flex gap-2">
          {exercise.video_url && (
            <Button size="sm" variant="outline">
              <Play className="h-4 w-4" />
            </Button>
          )}
          <Button size="sm" variant="outline">
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ExerciseLibrary: React.FC = () => {
  const { exercises, isLoading, fetchExercises, searchExercises, getExercisesByMuscleGroup, getExercisesByDifficulty } = useExercises();
  const { isMobile, isTablet } = useResponsive();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const muscleGroups = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const filteredExercises = useMemo(() => {
    let filtered = exercises;

    if (searchQuery) {
      filtered = searchExercises(searchQuery);
    }

    if (selectedMuscleGroup) {
      filtered = filtered.filter(exercise => 
        exercise.muscle_groups.includes(selectedMuscleGroup)
      );
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(exercise => 
        exercise.difficulty === selectedDifficulty
      );
    }

    return filtered;
  }, [exercises, searchQuery, selectedMuscleGroup, selectedDifficulty, searchExercises]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchExercises();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    // Handle exercise selection - could open modal, navigate, etc.
    console.log('Selected exercise:', exercise);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMuscleGroup('');
    setSelectedDifficulty('');
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} isRefreshing={isRefreshing}>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
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
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters:</span>
                {(selectedMuscleGroup || selectedDifficulty) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>

              {/* Muscle Groups */}
              <div>
                <p className="text-xs text-gray-600 mb-2">Muscle Groups:</p>
                <div className={`flex flex-wrap gap-2 ${isMobile ? 'max-h-24 overflow-y-auto' : ''}`}>
                  {muscleGroups.map((group) => (
                    <Badge
                      key={group}
                      variant={selectedMuscleGroup === group ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                      onClick={() => setSelectedMuscleGroup(
                        selectedMuscleGroup === group ? '' : group
                      )}
                    >
                      {group}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <p className="text-xs text-gray-600 mb-2">Difficulty:</p>
                <div className="flex gap-2">
                  {difficulties.map((difficulty) => (
                    <Badge
                      key={difficulty}
                      variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                      onClick={() => setSelectedDifficulty(
                        selectedDifficulty === difficulty ? '' : difficulty
                      )}
                    >
                      {difficulty}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>{filteredExercises.length} exercises found</span>
              {isLoading && <span>Loading...</span>}
            </div>
          </CardContent>
        </Card>

        {/* Exercise List */}
        <Card>
          <CardContent className="p-0">
            <VirtualizedExerciseList
              items={filteredExercises}
              onExerciseSelect={handleExerciseSelect}
            />
          </CardContent>
        </Card>
      </div>
    </PullToRefresh>
  );
};
