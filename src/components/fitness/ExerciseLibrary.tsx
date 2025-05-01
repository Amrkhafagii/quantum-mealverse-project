
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Exercise } from '@/types/fitness';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Filter, Search, Video, Dumbbell, List, Grid, BarChart4, Info } from 'lucide-react';

interface ExerciseLibraryProps {
  userId?: string;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ userId }) => {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchText, muscleFilter, difficultyFilter, equipmentFilter]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      // In a real app, we would fetch from the database
      // For now, we'll use mock data
      const mockExercises = generateMockExercises();
      setExercises(mockExercises);
      setFilteredExercises(mockExercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
      toast({
        title: 'Error',
        description: 'Failed to load exercises.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockExercises = (): Exercise[] => {
    const mockExercises: Exercise[] = [
      {
        id: '1',
        name: 'Bench Press',
        description: 'A compound exercise that works the chest, shoulders, and triceps.',
        muscle_groups: ['chest', 'shoulders', 'triceps'],
        equipment_needed: ['barbell', 'bench'],
        difficulty: 'intermediate',
        instructions: [
          'Lie on your back on a flat bench.',
          'Grip the barbell with hands slightly wider than shoulder-width apart.',
          'Lift the bar off the rack and hold it straight over you with arms locked.',
          'Lower the bar slowly until it touches your chest.',
          'Push the bar back to the starting position.'
        ],
        video_url: 'https://www.example.com/videos/bench-press.mp4',
        image_url: 'https://images.pexels.com/photos/3289711/pexels-photo-3289711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      },
      {
        id: '2',
        name: 'Squat',
        description: 'A compound exercise that works the quadriceps, hamstrings, and glutes.',
        muscle_groups: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
        equipment_needed: ['barbell', 'squat rack'],
        difficulty: 'intermediate',
        instructions: [
          'Stand with feet shoulder-width apart.',
          'Place the barbell behind your neck on your upper back.',
          'Bend your knees and lower your hips until your thighs are parallel to the ground.',
          'Push through your heels to return to the starting position.'
        ],
        video_url: 'https://www.example.com/videos/squat.mp4',
        image_url: 'https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      },
      {
        id: '3',
        name: 'Deadlift',
        description: 'A compound exercise that works the back, legs, and core.',
        muscle_groups: ['back', 'hamstrings', 'glutes', 'traps', 'forearms'],
        equipment_needed: ['barbell'],
        difficulty: 'advanced',
        instructions: [
          'Stand with feet hip-width apart and barbell over mid-foot.',
          'Bend at the hips and knees, gripping the bar with hands shoulder-width apart.',
          'Keeping your back straight, stand up with the weight.',
          'Lower the weight back to the ground with a controlled motion.'
        ],
        video_url: 'https://www.example.com/videos/deadlift.mp4',
        image_url: 'https://images.pexels.com/photos/4164766/pexels-photo-4164766.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      },
      {
        id: '4',
        name: 'Pull-Up',
        description: 'An upper-body compound exercise that primarily targets the lats.',
        muscle_groups: ['back', 'biceps', 'shoulders'],
        equipment_needed: ['pull-up bar'],
        difficulty: 'intermediate',
        instructions: [
          'Grip the pull-up bar with hands slightly wider than shoulder-width apart.',
          'Hang fully extended with arms straight.',
          'Pull yourself up until your chin is over the bar.',
          'Lower yourself back to the starting position with control.'
        ],
        video_url: 'https://www.example.com/videos/pull-up.mp4',
        image_url: 'https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      },
      {
        id: '5',
        name: 'Overhead Press',
        description: 'A compound exercise that targets the shoulders, triceps, and upper chest.',
        muscle_groups: ['shoulders', 'triceps', 'upper chest'],
        equipment_needed: ['barbell'],
        difficulty: 'intermediate',
        instructions: [
          'Stand with feet shoulder-width apart and grip the barbell at shoulder height.',
          'Press the barbell overhead until arms are fully extended.',
          'Lower the barbell back to shoulder height with control.'
        ],
        video_url: 'https://www.example.com/videos/overhead-press.mp4',
        image_url: 'https://images.pexels.com/photos/6454069/pexels-photo-6454069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      },
      {
        id: '6',
        name: 'Bicep Curl',
        description: 'An isolation exercise that targets the biceps.',
        muscle_groups: ['biceps'],
        equipment_needed: ['dumbbells', 'barbell'],
        difficulty: 'beginner',
        instructions: [
          'Stand with feet shoulder-width apart and hold a dumbbell in each hand at your sides.',
          'Keeping your upper arms stationary, curl the weights up to shoulder level.',
          'Lower the weights back to the starting position with control.'
        ],
        video_url: 'https://www.example.com/videos/bicep-curl.mp4',
        image_url: 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      },
      {
        id: '7',
        name: 'Tricep Pushdown',
        description: 'An isolation exercise that targets the triceps.',
        muscle_groups: ['triceps'],
        equipment_needed: ['cable machine'],
        difficulty: 'beginner',
        instructions: [
          'Stand facing a cable machine with a rope attachment at head height.',
          'Grip the rope with both hands and position your elbows close to your body.',
          'Push the rope down until your arms are fully extended.',
          'Slowly return to the starting position.'
        ],
        video_url: 'https://www.example.com/videos/tricep-pushdown.mp4',
        image_url: 'https://images.pexels.com/photos/6551138/pexels-photo-6551138.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      },
      {
        id: '8',
        name: 'Plank',
        description: 'A core exercise that targets the abdominals and lower back.',
        muscle_groups: ['abs', 'core', 'lower back'],
        equipment_needed: [],
        difficulty: 'beginner',
        instructions: [
          'Start in a push-up position but with your weight on your forearms.',
          'Keep your body in a straight line from head to heels.',
          'Engage your core and hold the position.'
        ],
        video_url: 'https://www.example.com/videos/plank.mp4',
        image_url: 'https://images.pexels.com/photos/6455815/pexels-photo-6455815.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      },
      {
        id: '9',
        name: 'Dumbbell Row',
        description: 'A unilateral back exercise that targets the lats and rhomboids.',
        muscle_groups: ['back', 'lats', 'rhomboids', 'biceps'],
        equipment_needed: ['dumbbell', 'bench'],
        difficulty: 'beginner',
        instructions: [
          'Place your right knee and hand on a bench with your left foot on the floor.',
          'Hold a dumbbell in your left hand hanging straight down.',
          'Pull the dumbbell up to your side, keeping your elbow close to your body.',
          'Lower the dumbbell back to the starting position.',
          'Complete all reps, then switch sides.'
        ],
        video_url: 'https://www.example.com/videos/dumbbell-row.mp4',
        image_url: 'https://images.pexels.com/photos/6740056/pexels-photo-6740056.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      },
      {
        id: '10',
        name: 'Leg Press',
        description: 'A compound exercise that targets the quadriceps, hamstrings, and glutes.',
        muscle_groups: ['quadriceps', 'hamstrings', 'glutes'],
        equipment_needed: ['leg press machine'],
        difficulty: 'beginner',
        instructions: [
          'Sit in the leg press machine with your feet on the platform shoulder-width apart.',
          'Release the safety bars and lower the platform until your knees form 90-degree angles.',
          'Push the platform back up until your legs are extended.',
          'Do not lock your knees at the top of the movement.'
        ],
        video_url: 'https://www.example.com/videos/leg-press.mp4',
        image_url: 'https://images.pexels.com/photos/6551133/pexels-photo-6551133.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      },
      // Add more mock exercises as needed
    ];

    return mockExercises;
  };

  const filterExercises = () => {
    let filtered = [...exercises];

    // Apply search text filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchLower) || 
        ex.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply muscle group filter
    if (muscleFilter !== 'all') {
      filtered = filtered.filter(ex => 
        ex.muscle_groups.includes(muscleFilter)
      );
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(ex => 
        ex.difficulty === difficultyFilter
      );
    }

    // Apply equipment filter
    if (equipmentFilter !== 'all') {
      filtered = filtered.filter(ex => 
        ex.equipment_needed && ex.equipment_needed.includes(equipmentFilter)
      );
    }

    setFilteredExercises(filtered);
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  const getUniqueEquipment = () => {
    const equipmentSet = new Set<string>();
    exercises.forEach(ex => {
      if (ex.equipment_needed) {
        ex.equipment_needed.forEach(eq => equipmentSet.add(eq));
      }
    });
    return Array.from(equipmentSet);
  };

  const getUniqueMuscleGroups = () => {
    const muscleSet = new Set<string>();
    exercises.forEach(ex => {
      ex.muscle_groups.forEach(m => muscleSet.add(m));
    });
    return Array.from(muscleSet);
  };

  // Function to sort exercises by property
  const sortExercises = (property: 'name' | 'difficulty') => {
    const sorted = [...filteredExercises].sort((a, b) => {
      if (property === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (property === 'difficulty') {
        const difficultyOrder: Record<string, number> = {
          beginner: 1,
          intermediate: 2,
          advanced: 3
        };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      }
      return 0;
    });
    
    setFilteredExercises(sorted);
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSearchText('');
    setMuscleFilter('all');
    setDifficultyFilter('all');
    setEquipmentFilter('all');
  };

  // Render difficulty badge with appropriate color
  const renderDifficultyBadge = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-800/50 text-green-300',
      intermediate: 'bg-blue-800/50 text-blue-300',
      advanced: 'bg-red-800/50 text-red-300'
    };
    
    return (
      <Badge className={`${colors[difficulty as keyof typeof colors]} capitalize`}>
        {difficulty}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-semibold text-quantum-cyan">Exercise Library</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search exercises..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 bg-quantum-darkBlue/30 border-quantum-cyan/20"
            />
          </div>
          
          <Button 
            variant="outline" 
            className="border-quantum-cyan/20 hover:bg-quantum-cyan/10 flex-shrink-0"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Select value={muscleFilter} onValueChange={setMuscleFilter}>
          <SelectTrigger className="w-[160px] bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <SelectValue placeholder="Muscle Group" />
          </SelectTrigger>
          <SelectContent className="bg-quantum-darkBlue border-quantum-cyan/20">
            <SelectItem value="all">All Muscle Groups</SelectItem>
            {getUniqueMuscleGroups().map((muscle) => (
              <SelectItem key={muscle} value={muscle} className="capitalize">{muscle}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-[140px] bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent className="bg-quantum-darkBlue border-quantum-cyan/20">
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
          <SelectTrigger className="w-[160px] bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <SelectValue placeholder="Equipment" />
          </SelectTrigger>
          <SelectContent className="bg-quantum-darkBlue border-quantum-cyan/20">
            <SelectItem value="all">All Equipment</SelectItem>
            {getUniqueEquipment().map((equipment) => (
              <SelectItem key={equipment} value={equipment} className="capitalize">{equipment}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className={`${viewMode === 'grid' ? 'bg-quantum-purple/20 border-quantum-purple' : 'border-gray-600'}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={18} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`${viewMode === 'list' ? 'bg-quantum-purple/20 border-quantum-purple' : 'border-gray-600'}`}
            onClick={() => setViewMode('list')}
          >
            <List size={18} />
          </Button>
        </div>
      </div>
      
      {showDetails && selectedExercise ? (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">{selectedExercise.name}</CardTitle>
              <CardDescription>{selectedExercise.description}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCloseDetails}>
              <X size={22} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="aspect-video rounded-lg overflow-hidden bg-quantum-black/50 flex items-center justify-center mb-4">
                  {selectedExercise.image_url ? (
                    <img 
                      src={selectedExercise.image_url} 
                      alt={selectedExercise.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <Dumbbell size={64} className="text-gray-600" />
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {renderDifficultyBadge(selectedExercise.difficulty)}
                  {selectedExercise.muscle_groups.map((muscle, idx) => (
                    <Badge key={idx} variant="outline" className="capitalize">
                      {muscle}
                    </Badge>
                  ))}
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Equipment Needed</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.equipment_needed && selectedExercise.equipment_needed.length > 0 ? (
                      selectedExercise.equipment_needed.map((equipment, idx) => (
                        <Badge key={idx} variant="secondary" className="capitalize">
                          {equipment}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">No equipment needed</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Instructions</h3>
                <ol className="list-decimal list-inside space-y-2 ml-1">
                  {selectedExercise.instructions.map((instruction, idx) => (
                    <li key={idx} className="text-sm text-gray-300">{instruction}</li>
                  ))}
                </ol>
                
                {selectedExercise.video_url && (
                  <div className="mt-6">
                    <Button 
                      variant="outline" 
                      className="border-quantum-cyan/20 hover:bg-quantum-cyan/10"
                      onClick={() => window.open(selectedExercise.video_url, '_blank')}
                    >
                      <Video size={18} className="mr-2" />
                      Watch Video Demonstration
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="bg-quantum-purple hover:bg-quantum-purple/90 w-full sm:w-auto"
            >
              Add to Workout
            </Button>
          </CardFooter>
        </Card>
      ) : loading ? (
        <div className="text-center py-12">
          <p>Loading exercises...</p>
        </div>
      ) : filteredExercises.length === 0 ? (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="pt-6 text-center">
            <Info size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">No exercises found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your filters or search terms.</p>
            <Button 
              variant="outline" 
              className="border-quantum-cyan/20 hover:bg-quantum-cyan/10"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredExercises.map((exercise) => (
            <Card 
              key={exercise.id} 
              className="bg-quantum-darkBlue/30 border-quantum-cyan/20 hover:border-quantum-cyan cursor-pointer transition-colors"
              onClick={() => handleExerciseClick(exercise)}
            >
              <div className="h-40 overflow-hidden">
                {exercise.image_url ? (
                  <img 
                    src={exercise.image_url} 
                    alt={exercise.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-quantum-black/50 flex items-center justify-center">
                    <Dumbbell size={48} className="text-gray-600" />
                  </div>
                )}
              </div>
              <CardContent className="pt-4">
                <h3 className="font-medium mb-1">{exercise.name}</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {renderDifficultyBadge(exercise.difficulty)}
                </div>
                <p className="text-sm text-gray-400 line-clamp-2">{exercise.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="px-0 py-0">
            <div className="divide-y divide-gray-700">
              {filteredExercises.map((exercise) => (
                <div 
                  key={exercise.id} 
                  className="px-4 py-3 hover:bg-quantum-black/30 cursor-pointer flex items-center"
                  onClick={() => handleExerciseClick(exercise)}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-quantum-black/50 flex items-center justify-center mr-4">
                    {exercise.image_url ? (
                      <img 
                        src={exercise.image_url} 
                        alt={exercise.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Dumbbell size={24} className="text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{exercise.name}</h3>
                      {renderDifficultyBadge(exercise.difficulty)}
                    </div>
                    <p className="text-sm text-gray-400 truncate">{exercise.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {exercise.muscle_groups.slice(0, 3).map((muscle, idx) => (
                        <Badge key={idx} variant="outline" className="capitalize text-xs py-0 px-1">
                          {muscle}
                        </Badge>
                      ))}
                      {exercise.muscle_groups.length > 3 && (
                        <Badge variant="outline" className="text-xs py-0 px-1">
                          +{exercise.muscle_groups.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExerciseLibrary;
