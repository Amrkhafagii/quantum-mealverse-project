
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Dumbbell, Filter, Book, Play } from 'lucide-react';
import { useExercises } from '@/hooks/useExercises';
import { Exercise } from '@/types/fitness/exercises';
import { Skeleton } from '@/components/ui/skeleton';

export const ExerciseLibrary: React.FC = () => {
  const { exercises, isLoading, searchExercises } = useExercises();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const muscleGroups = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'glutes', 'abs', 'core', 'full body'];
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

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-6 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Exercise List */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Book className="mr-2 h-5 w-5 text-quantum-cyan" />
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
                  className="pl-10 bg-quantum-black/50"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
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
              
              <div className="flex gap-2">
                <Button
                  variant={selectedDifficulty === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty('')}
                >
                  All Levels
                </Button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredExercises.map(exercise => (
                  <Card
                    key={exercise.id}
                    className={`cursor-pointer transition-colors ${
                      selectedExercise?.id === exercise.id 
                        ? 'border-quantum-cyan bg-quantum-cyan/10' 
                        : 'border-border hover:border-quantum-cyan/50 bg-quantum-black/30'
                    }`}
                    onClick={() => handleExerciseSelect(exercise)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{exercise.name}</h4>
                        <Dumbbell className="h-4 w-4 text-quantum-cyan" />
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {exercise.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {exercise.muscle_groups.slice(0, 3).map(group => (
                            <Badge key={group} variant="secondary" className="text-xs capitalize">
                              {group}
                            </Badge>
                          ))}
                          {exercise.muscle_groups.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{exercise.muscle_groups.length - 3}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="capitalize">
                            {exercise.difficulty}
                          </Badge>
                          <div className="flex gap-1">
                            {exercise.equipment_needed.slice(0, 2).map(equipment => (
                              <Badge key={equipment} variant="secondary" className="text-xs">
                                {equipment}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredExercises.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No exercises found matching your criteria.
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Details */}
      <div className="space-y-4">
        {selectedExercise ? (
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedExercise.name}</span>
                {selectedExercise.video_url && (
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Watch
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {selectedExercise.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedExercise.description}
                  </p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-2">Target Muscles</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedExercise.muscle_groups.map(group => (
                    <Badge key={group} variant="secondary" className="capitalize">
                      {group}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Equipment Needed</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedExercise.equipment_needed.map(equipment => (
                    <Badge key={equipment} variant="outline">
                      {equipment}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Difficulty</h4>
                <Badge variant="outline" className="capitalize">
                  {selectedExercise.difficulty}
                </Badge>
              </div>
              
              {selectedExercise.instructions && selectedExercise.instructions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Instructions</h4>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    {selectedExercise.instructions.map((instruction, index) => (
                      <li key={index} className="flex">
                        <span className="font-medium text-quantum-cyan mr-2">{index + 1}.</span>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="p-6 text-center">
              <Dumbbell className="h-12 w-12 text-quantum-cyan mx-auto mb-4" />
              <h3 className="font-medium mb-2">Select an Exercise</h3>
              <p className="text-sm text-muted-foreground">
                Choose an exercise from the library to view detailed instructions and information.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExerciseLibrary;
