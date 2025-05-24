
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Clock, 
  Target,
  Shuffle,
  Play,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

interface WorkoutVariation {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus: string[];
  exercises: string[];
  equipment: string[];
  personalizedReason: string;
}

export const WorkoutVariations: React.FC = () => {
  const [selectedVariation, setSelectedVariation] = useState<WorkoutVariation | null>(null);

  const workoutVariations: WorkoutVariation[] = [
    {
      id: '1',
      name: 'Quick HIIT Blast',
      description: 'High-intensity interval training optimized for your fitness level',
      duration: 20,
      difficulty: 'intermediate',
      focus: ['cardio', 'fat burning'],
      exercises: ['burpees', 'mountain climbers', 'jump squats', 'high knees'],
      equipment: ['bodyweight'],
      personalizedReason: 'Based on your weight loss goal and 20-minute time preference'
    },
    {
      id: '2',
      name: 'Strength Builder',
      description: 'Progressive strength training with compound movements',
      duration: 45,
      difficulty: 'intermediate',
      focus: ['strength', 'muscle building'],
      exercises: ['squats', 'deadlifts', 'bench press', 'rows'],
      equipment: ['dumbbells', 'barbell'],
      personalizedReason: 'Matches your strength goals and available equipment'
    },
    {
      id: '3',
      name: 'Recovery Flow',
      description: 'Low-intensity movement for active recovery',
      duration: 30,
      difficulty: 'beginner',
      focus: ['flexibility', 'recovery'],
      exercises: ['dynamic stretching', 'yoga poses', 'foam rolling'],
      equipment: ['bodyweight', 'yoga mat'],
      personalizedReason: 'Perfect for your scheduled rest days'
    },
    {
      id: '4',
      name: 'Core Power',
      description: 'Targeted core strengthening with progressive difficulty',
      duration: 25,
      difficulty: 'intermediate',
      focus: ['core', 'stability'],
      exercises: ['planks', 'russian twists', 'dead bugs', 'mountain climbers'],
      equipment: ['bodyweight'],
      personalizedReason: 'Addresses core weakness identified in your form analysis'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-yellow-500';
      case 'advanced':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const startWorkout = (variation: WorkoutVariation) => {
    setSelectedVariation(variation);
    // Here you would integrate with the workout execution system
    console.log('Starting workout:', variation.name);
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shuffle className="mr-2 h-5 w-5 text-quantum-cyan" />
          Personalized Workout Variations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recommended" className="w-full">
          <TabsList className="bg-quantum-black/30 mb-4">
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="quick">Quick Sessions</TabsTrigger>
            <TabsTrigger value="focused">Focused Training</TabsTrigger>
          </TabsList>

          <TabsContent value="recommended">
            <div className="grid gap-4">
              {workoutVariations.map((variation, index) => (
                <motion.div
                  key={variation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-quantum-black/30 border border-quantum-cyan/10 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{variation.name}</h3>
                      <p className="text-gray-300 text-sm mb-2">{variation.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(variation.difficulty)}>
                        {variation.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-quantum-cyan" />
                      <span className="text-sm">{variation.duration} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-quantum-cyan" />
                      <span className="text-sm">{variation.focus.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-quantum-cyan" />
                      <span className="text-sm">{variation.exercises.length} exercises</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-quantum-cyan" />
                      <span className="text-sm">{variation.equipment.join(', ')}</span>
                    </div>
                  </div>

                  <div className="bg-quantum-darkBlue/20 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-400">
                      <strong>Why this works for you:</strong> {variation.personalizedReason}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => startWorkout(variation)}
                      className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Workout
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quick">
            <div className="grid gap-4">
              {workoutVariations
                .filter(v => v.duration <= 30)
                .map((variation, index) => (
                  <motion.div
                    key={variation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-quantum-black/30 border border-quantum-cyan/10 rounded-lg p-4"
                  >
                    {/* Same content as recommended tab but filtered */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{variation.name}</h3>
                        <p className="text-gray-300 text-sm">{variation.description}</p>
                      </div>
                      <Badge className={getDifficultyColor(variation.difficulty)}>
                        {variation.difficulty}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => startWorkout(variation)}
                        className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Workout
                      </Button>
                    </div>
                  </motion.div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="focused">
            <div className="grid gap-4">
              {workoutVariations
                .filter(v => v.focus.includes('strength') || v.focus.includes('core'))
                .map((variation, index) => (
                  <motion.div
                    key={variation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-quantum-black/30 border border-quantum-cyan/10 rounded-lg p-4"
                  >
                    {/* Same content as recommended tab but filtered */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{variation.name}</h3>
                        <p className="text-gray-300 text-sm">{variation.description}</p>
                      </div>
                      <Badge className={getDifficultyColor(variation.difficulty)}>
                        {variation.difficulty}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => startWorkout(variation)}
                        className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Workout
                      </Button>
                    </div>
                  </motion.div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
