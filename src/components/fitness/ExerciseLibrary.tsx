import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ExerciseLibraryProps {
  userId?: string;
}

// Sample exercise data - in a real app, this would come from the database
const mockExercises = [
  {
    id: 'ex1',
    name: 'Bench Press',
    description: 'A compound exercise that develops the chest, shoulders, and triceps.',
    muscle_groups: ['chest', 'shoulders', 'triceps'],
    difficulty: 'intermediate',
    equipment_needed: ['barbell', 'bench'],
    instructions: [
      'Lie on a flat bench with your feet flat on the ground',
      'Grip the barbell with hands slightly wider than shoulder-width apart',
      'Lower the barbell to your chest, keeping elbows at a 45-degree angle',
      'Push the barbell back up to the starting position'
    ]
  },
  {
    id: 'ex2',
    name: 'Squats',
    description: 'A compound exercise that targets the quadriceps, hamstrings, and glutes.',
    muscle_groups: ['quadriceps', 'hamstrings', 'glutes'],
    difficulty: 'intermediate',
    equipment_needed: ['barbell', 'squat rack'],
    instructions: [
      'Position the barbell on your upper back, gripping it with hands wider than shoulder-width',
      'Feet should be shoulder-width apart with toes slightly pointed outward',
      'Bend at the hips and knees to lower your body until thighs are parallel to the ground',
      'Drive through your heels to return to the starting position'
    ]
  },
  {
    id: 'ex3',
    name: 'Pull-ups',
    description: 'An upper body compound exercise that works the back, biceps, and shoulders.',
    muscle_groups: ['back', 'biceps', 'shoulders'],
    difficulty: 'advanced',
    equipment_needed: ['pull-up bar'],
    instructions: [
      'Hang from a pull-up bar with hands slightly wider than shoulder-width apart',
      'Pull your body up until your chin clears the bar',
      'Lower yourself back down with control',
      'Repeat for the desired number of repetitions'
    ]
  },
  {
    id: 'ex4',
    name: 'Push-ups',
    description: 'A bodyweight exercise that targets the chest, shoulders, and triceps.',
    muscle_groups: ['chest', 'shoulders', 'triceps'],
    difficulty: 'beginner',
    equipment_needed: [],
    instructions: [
      'Start in a plank position with hands slightly wider than shoulder-width apart',
      'Keep your body in a straight line from head to heels',
      'Lower your chest to the ground by bending your elbows',
      'Push back up to the starting position'
    ]
  },
  {
    id: 'ex5',
    name: 'Deadlift',
    description: 'A compound exercise that works the entire posterior chain.',
    muscle_groups: ['back', 'glutes', 'hamstrings'],
    difficulty: 'advanced',
    equipment_needed: ['barbell'],
    instructions: [
      'Stand with feet hip-width apart, barbell over midfoot',
      'Bend at the hips and knees to grasp the barbell with hands shoulder-width apart',
      'Lift the barbell by extending hips and knees, keeping back straight',
      'Return the weight to the ground with control'
    ]
  }
];

const muscleGroups = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'quadriceps', label: 'Quadriceps' },
  { value: 'hamstrings', label: 'Hamstrings' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'calves', label: 'Calves' },
  { value: 'abs', label: 'Abs' }
];

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ userId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  
  const toggleExercise = (id: string) => {
    setExpandedExercise(expandedExercise === id ? null : id);
  };
  
  const filteredExercises = mockExercises.filter(exercise => {
    // Apply search filter
    if (searchQuery && !exercise.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Apply muscle group filter
    if (muscleFilter !== 'all' && !exercise.muscle_groups.includes(muscleFilter)) {
      return false;
    }
    
    // Apply difficulty filter
    if (difficultyFilter !== 'all' && exercise.difficulty !== difficultyFilter) {
      return false;
    }
    
    return true;
  });
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader className="border-b border-quantum-cyan/20">
        <CardTitle className="text-2xl text-quantum-cyan">Exercise Library</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={muscleFilter} onValueChange={setMuscleFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Muscle Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Muscle Groups</SelectItem>
                  {muscleGroups.map(group => (
                    <SelectItem key={group.value} value={group.value}>{group.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[140px]">
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
          
          <Tabs defaultValue="all" className="mt-6">
            <TabsList>
              <TabsTrigger value="all">All Exercises</TabsTrigger>
              <TabsTrigger value="weight">Weight Training</TabsTrigger>
              <TabsTrigger value="bodyweight">Bodyweight</TabsTrigger>
              <TabsTrigger value="cardio">Cardio</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4 space-y-3">
              {filteredExercises.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No exercises found matching your filters.</p>
                </div>
              ) : (
                filteredExercises.map(exercise => (
                  <div
                    key={exercise.id}
                    className="bg-quantum-darkBlue/40 rounded-md overflow-hidden"
                  >
                    <div
                      className="p-4 cursor-pointer flex justify-between items-center"
                      onClick={() => toggleExercise(exercise.id)}
                    >
                      <div>
                        <h3 className="font-medium flex items-center">
                          <Dumbbell className="h-4 w-4 mr-2 text-quantum-cyan" />
                          {exercise.name}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {exercise.muscle_groups.map(muscle => (
                            <Badge
                              key={muscle}
                              variant="outline"
                              className="text-xs bg-quantum-darkBlue/30"
                            >
                              {muscle}
                            </Badge>
                          ))}
                          <Badge
                            className={`text-xs ${
                              exercise.difficulty === 'beginner'
                                ? 'bg-green-600/20 text-green-400'
                                : exercise.difficulty === 'intermediate'
                                ? 'bg-yellow-600/20 text-yellow-400'
                                : 'bg-red-600/20 text-red-400'
                            }`}
                          >
                            {exercise.difficulty}
                          </Badge>
                        </div>
                      </div>
                      
                      {expandedExercise === exercise.id ? (
                        <ChevronUp className="h-5 w-5 text-quantum-cyan" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-quantum-cyan" />
                      )}
                    </div>
                    
                    {expandedExercise === exercise.id && (
                      <div className="p-4 pt-0 border-t border-quantum-cyan/20 mt-2">
                        <p className="text-gray-300 mb-3">{exercise.description}</p>
                        
                        {exercise.equipment_needed.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-quantum-cyan mb-1">Equipment Needed:</p>
                            <div className="flex flex-wrap gap-1">
                              {exercise.equipment_needed.map(equipment => (
                                <Badge key={equipment} variant="outline" className="bg-quantum-darkBlue/30">
                                  {equipment}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-sm font-medium text-quantum-cyan mb-1">Instructions:</p>
                          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                            {exercise.instructions.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>
            
            {/* Other tabs would be implemented similarly with filtered content */}
            <TabsContent value="weight" className="mt-4">
              <div className="text-center py-8 text-gray-400">
                <p>Weight training exercises will be displayed here.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="bodyweight" className="mt-4">
              <div className="text-center py-8 text-gray-400">
                <p>Bodyweight exercises will be displayed here.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="cardio" className="mt-4">
              <div className="text-center py-8 text-gray-400">
                <p>Cardio exercises will be displayed here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseLibrary;
