import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shuffle, 
  Dumbbell, 
  Target,
  Clock,
  Zap,
  Plus,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { ExerciseVariation } from "@/types/fitness";

interface ExerciseVariation {
  name: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  muscleGroups: string[];
  description: string;
  benefits: string[];
  sets?: number;
  reps?: string;
  alternatives?: string[];
}

export const WorkoutVariations = ({ workoutId }: any) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [variations, setVariations] = useState<ExerciseVariation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedExercises, setAddedExercises] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', name: 'All', icon: Shuffle },
    { id: 'chest', name: 'Chest', icon: Dumbbell },
    { id: 'back', name: 'Back', icon: Target },
    { id: 'legs', name: 'Legs', icon: Zap },
    { id: 'shoulders', name: 'Shoulders', icon: Clock }
  ];

  const loadPersonalizedVariations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Get user's workout preferences and recent progress
      const { data: userPreferences } = await supabase
        .from('user_workout_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: recentProgress } = await supabase
        .from('exercise_progress')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

      const { data: currentPlan } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Generate personalized variations
      const personalizedVariations = await generateVariationsFromData(
        userPreferences,
        recentProgress,
        currentPlan
      );

      setVariations(personalizedVariations);
    } catch (error) {
      console.error('Error loading personalized variations:', error);
      // Fallback to basic variations
      setVariations(getBasicVariations());
    } finally {
      setIsLoading(false);
    }
  };

  const generateVariationsFromData = async (
    userPreferences: any,
    recentProgress: any[],
    currentPlan: any
  ): Promise<ExerciseVariation[]> => {
    const fitnessLevel = userPreferences?.fitness_level || 'beginner';
    const availableEquipment = userPreferences?.available_equipment || ['bodyweight'];
    const preferredTypes = userPreferences?.preferred_workout_types || [];
    
    // Analyze which muscle groups need more attention
    const muscleGroupActivity = analyzeMuscleGroupActivity(recentProgress);
    const underworkedGroups = getUnderworkedGroups(muscleGroupActivity);
    
    const variations: ExerciseVariation[] = [];

    // Generate variations based on underworked muscle groups
    underworkedGroups.forEach(group => {
      const groupVariations = getVariationsForMuscleGroup(group, fitnessLevel, availableEquipment);
      variations.push(...groupVariations);
    });

    // Add general variations based on preferences
    if (preferredTypes.includes('strength')) {
      variations.push(...getStrengthVariations(fitnessLevel, availableEquipment));
    }
    
    if (preferredTypes.includes('cardio')) {
      variations.push(...getCardioVariations(fitnessLevel, availableEquipment));
    }

    // Add progressive variations if user is ready
    if (recentProgress && recentProgress.length > 0) {
      const progressiveVariations = getProgressiveVariations(recentProgress, fitnessLevel);
      variations.push(...progressiveVariations);
    }

    return variations.slice(0, 8); // Limit to 8 variations
  };

  const analyzeMuscleGroupActivity = (recentProgress: any[]): Record<string, number> => {
    const muscleGroups = {
      chest: ['bench', 'push', 'chest', 'press', 'fly'],
      back: ['pull', 'row', 'lat', 'deadlift', 'chin'],
      legs: ['squat', 'lunge', 'leg', 'calf', 'quad'],
      shoulders: ['shoulder', 'lateral', 'front', 'deltoid'],
      arms: ['bicep', 'tricep', 'curl', 'extension']
    };

    const activity = Object.keys(muscleGroups).reduce((acc, group) => {
      acc[group] = 0;
      return acc;
    }, {} as Record<string, number>);

    recentProgress?.forEach(exercise => {
      const exerciseName = exercise.exercise_name?.toLowerCase() || '';
      Object.entries(muscleGroups).forEach(([group, patterns]) => {
        if (patterns.some(pattern => exerciseName.includes(pattern))) {
          activity[group]++;
        }
      });
    });

    return activity;
  };

  const getUnderworkedGroups = (muscleGroupActivity: Record<string, number>): string[] => {
    const totalActivity = Object.values(muscleGroupActivity).reduce((sum, count) => sum + count, 0);
    if (totalActivity === 0) return ['chest', 'back', 'legs']; // Default if no data
    
    const avgActivity = totalActivity / Object.keys(muscleGroupActivity).length;
    return Object.entries(muscleGroupActivity)
      .filter(([group, count]) => count < avgActivity * 0.7)
      .map(([group]) => group);
  };

  const getVariationsForMuscleGroup = (
    group: string, 
    fitnessLevel: string, 
    equipment: string[]
  ): ExerciseVariation[] => {
    const exerciseLibrary: Record<string, ExerciseVariation[]> = {
      chest: [
        {
          name: 'Push-up Variations',
          category: 'chest',
          difficulty: fitnessLevel as any,
          equipment: ['bodyweight'],
          muscleGroups: ['chest', 'triceps', 'shoulders'],
          description: 'Progressive push-up variations to build chest strength',
          benefits: ['Upper body strength', 'Core stability', 'No equipment needed'],
          sets: 3,
          reps: '8-12',
          alternatives: ['Incline Push-ups', 'Diamond Push-ups', 'Wide-grip Push-ups']
        },
        {
          name: 'Dumbbell Chest Press',
          category: 'chest',
          difficulty: 'intermediate' as any,
          equipment: ['dumbbells'],
          muscleGroups: ['chest', 'triceps', 'shoulders'],
          description: 'Effective chest builder using dumbbells',
          benefits: ['Muscle isolation', 'Unilateral strength', 'Range of motion'],
          sets: 3,
          reps: '8-10'
        }
      ],
      back: [
        {
          name: 'Bodyweight Rows',
          category: 'back',
          difficulty: 'beginner' as any,
          equipment: ['bodyweight', 'table'],
          muscleGroups: ['lats', 'rhomboids', 'biceps'],
          description: 'Horizontal pulling exercise using body weight',
          benefits: ['Back strength', 'Posture improvement', 'Minimal equipment'],
          sets: 3,
          reps: '6-10'
        },
        {
          name: 'Single-Arm Dumbbell Row',
          category: 'back',
          difficulty: 'intermediate' as any,
          equipment: ['dumbbells', 'bench'],
          muscleGroups: ['lats', 'rhomboids', 'biceps'],
          description: 'Unilateral back exercise for muscle balance',
          benefits: ['Muscle balance', 'Core stability', 'Isolated back work'],
          sets: 3,
          reps: '8-12'
        }
      ],
      legs: [
        {
          name: 'Bulgarian Split Squats',
          category: 'legs',
          difficulty: 'intermediate' as any,
          equipment: ['bodyweight'],
          muscleGroups: ['quadriceps', 'glutes', 'calves'],
          description: 'Single-leg squat variation for improved balance',
          benefits: ['Unilateral strength', 'Balance improvement', 'Glute activation'],
          sets: 3,
          reps: '8-12 each leg'
        },
        {
          name: 'Goblet Squats',
          category: 'legs',
          difficulty: 'beginner' as any,
          equipment: ['dumbbells'],
          muscleGroups: ['quadriceps', 'glutes', 'core'],
          description: 'Front-loaded squat for better form',
          benefits: ['Squat form', 'Core engagement', 'Lower body strength'],
          sets: 3,
          reps: '10-15'
        }
      ]
    };

    return exerciseLibrary[group]?.filter(exercise => 
      exercise.equipment.some(eq => equipment.includes(eq) || eq === 'bodyweight')
    ) || [];
  };

  const getStrengthVariations = (fitnessLevel: string, equipment: string[]): ExerciseVariation[] => {
    return [
      {
        name: 'Compound Strength Circuit',
        category: 'strength',
        difficulty: fitnessLevel as any,
        equipment: equipment,
        muscleGroups: ['full body'],
        description: 'Multi-joint exercises for maximum strength gains',
        benefits: ['Functional strength', 'Time efficient', 'Hormone optimization'],
        sets: 4,
        reps: '5-8'
      }
    ];
  };

  const getCardioVariations = (fitnessLevel: string, equipment: string[]): ExerciseVariation[] => {
    return [
      {
        name: 'HIIT Bodyweight Circuit',
        category: 'cardio',
        difficulty: fitnessLevel as any,
        equipment: ['bodyweight'],
        muscleGroups: ['full body'],
        description: 'High-intensity interval training for cardiovascular health',
        benefits: ['Fat burning', 'Cardiovascular health', 'Time efficient'],
        sets: 4,
        reps: '30s work / 15s rest'
      }
    ];
  };

  const getProgressiveVariations = (recentProgress: any[], fitnessLevel: string): ExerciseVariation[] => {
    // Analyze progress and suggest harder variations
    return [
      {
        name: 'Progressive Overload Variation',
        category: 'progression',
        difficulty: 'intermediate' as any,
        equipment: ['progressive'],
        muscleGroups: ['adaptive'],
        description: 'Increased difficulty based on your recent progress',
        benefits: ['Continued progress', 'Muscle adaptation', 'Strength gains'],
        sets: 3,
        reps: 'Progressive'
      }
    ];
  };

  const getBasicVariations = (): ExerciseVariation[] => {
    return [
      {
        name: 'Push-up Variations',
        category: 'chest',
        difficulty: 'beginner',
        equipment: ['bodyweight'],
        muscleGroups: ['chest', 'triceps', 'shoulders'],
        description: 'Various push-up styles to target chest muscles',
        benefits: ['Upper body strength', 'Core stability', 'No equipment needed']
      },
      {
        name: 'Squat Variations',
        category: 'legs',
        difficulty: 'beginner',
        equipment: ['bodyweight'],
        muscleGroups: ['quadriceps', 'glutes', 'calves'],
        description: 'Different squat techniques for leg development',
        benefits: ['Lower body strength', 'Functional movement', 'Core engagement']
      }
    ];
  };

  const addToWorkout = (exercise: ExerciseVariation) => {
    setAddedExercises(prev => new Set([...prev, exercise.name]));
    toast({
      title: "Exercise Added",
      description: `${exercise.name} has been added to your variation list.`,
    });
  };

  const filteredVariations = selectedCategory === 'all' 
    ? variations 
    : variations.filter(v => v.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 border-green-500/30 text-green-400';
      case 'intermediate': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'advanced': return 'bg-red-500/20 border-red-500/30 text-red-400';
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  useEffect(() => {
    if (user) {
      loadPersonalizedVariations();
    }
  }, [user]);

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shuffle className="mr-2 h-5 w-5 text-quantum-cyan" />
          Personalized Exercise Variations
        </CardTitle>
        <p className="text-sm text-gray-400">
          AI-suggested exercise variations based on your progress and preferences
        </p>
      </CardHeader>
      <CardContent>
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`${
                  selectedCategory === category.id 
                    ? 'bg-quantum-cyan text-quantum-black' 
                    : 'border-quantum-cyan/30 hover:border-quantum-cyan/60'
                }`}
              >
                <Icon className="w-4 h-4 mr-1" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-quantum-cyan border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Generating personalized variations...</p>
          </div>
        )}

        {/* Exercise Variations */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredVariations.map((variation, index) => {
              const isAdded = addedExercises.has(variation.name);
              
              return (
                <motion.div
                  key={variation.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-quantum-black/30 border border-quantum-cyan/10 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-quantum-cyan">
                        {variation.name}
                      </h3>
                      <p className="text-sm text-gray-300 mt-1">
                        {variation.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getDifficultyColor(variation.difficulty)}>
                        {variation.difficulty}
                      </Badge>
                      {isAdded && (
                        <Badge className="bg-green-500/20 text-green-400">
                          <Check className="w-3 h-3 mr-1" />
                          Added
                        </Badge>
                      )}
                    </div>
                  </div>

                  {variation.sets && variation.reps && (
                    <div className="mb-3">
                      <span className="text-sm text-gray-400">
                        Suggested: {variation.sets} sets × {variation.reps} reps
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Muscle Groups</h4>
                      <div className="flex flex-wrap gap-1">
                        {variation.muscleGroups.map((muscle) => (
                          <Badge key={muscle} variant="outline" className="text-xs">
                            {muscle}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Equipment</h4>
                      <div className="flex flex-wrap gap-1">
                        {variation.equipment.map((equipment) => (
                          <Badge key={equipment} variant="outline" className="text-xs">
                            {equipment}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Benefits</h4>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {variation.benefits.slice(0, 2).map((benefit, idx) => (
                          <li key={idx}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {variation.alternatives && variation.alternatives.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Alternatives</h4>
                      <div className="flex flex-wrap gap-1">
                        {variation.alternatives.map((alt, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {alt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-quantum-cyan/30 hover:border-quantum-cyan/60"
                    >
                      View Instructions
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => addToWorkout(variation)}
                      disabled={isAdded}
                      className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-1" />
                          Add to Workout
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!isLoading && filteredVariations.length === 0 && (
          <div className="text-center py-8">
            <Shuffle className="mx-auto h-12 w-12 text-quantum-cyan/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Variations Available</h3>
            <p className="text-gray-400 mb-4">
              Complete a few workouts to get personalized exercise variations
            </p>
            <Button
              onClick={loadPersonalizedVariations}
              className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
            >
              Refresh Variations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutVariations;
