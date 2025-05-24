
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shuffle, 
  Dumbbell, 
  Target,
  Clock,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ExerciseVariation {
  id: string;
  name: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  muscleGroups: string[];
  description: string;
  benefits: string[];
}

export const WorkoutVariations: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [variations, setVariations] = useState<ExerciseVariation[]>([
    {
      id: '1',
      name: 'Bulgarian Split Squats',
      category: 'legs',
      difficulty: 'intermediate',
      equipment: ['bodyweight', 'dumbbells'],
      muscleGroups: ['quadriceps', 'glutes', 'calves'],
      description: 'Single-leg squat variation for improved balance and strength',
      benefits: ['Unilateral strength', 'Balance improvement', 'Core stability']
    },
    {
      id: '2',
      name: 'Pike Push-ups',
      category: 'shoulders',
      difficulty: 'intermediate',
      equipment: ['bodyweight'],
      muscleGroups: ['shoulders', 'triceps', 'core'],
      description: 'Bodyweight shoulder exercise that mimics overhead pressing',
      benefits: ['Shoulder strength', 'Core engagement', 'No equipment needed']
    },
    {
      id: '3',
      name: 'Single-Arm Dumbbell Row',
      category: 'back',
      difficulty: 'beginner',
      equipment: ['dumbbells', 'bench'],
      muscleGroups: ['lats', 'rhomboids', 'biceps'],
      description: 'Unilateral back exercise for improved muscle balance',
      benefits: ['Muscle balance', 'Core stability', 'Isolated back work']
    }
  ]);

  const categories = [
    { id: 'all', name: 'All', icon: Shuffle },
    { id: 'chest', name: 'Chest', icon: Dumbbell },
    { id: 'back', name: 'Back', icon: Target },
    { id: 'legs', name: 'Legs', icon: Zap },
    { id: 'shoulders', name: 'Shoulders', icon: Clock }
  ];

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

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shuffle className="mr-2 h-5 w-5 text-quantum-cyan" />
          Exercise Variations
        </CardTitle>
        <p className="text-sm text-gray-400">
          Discover new exercises to keep your workouts fresh and challenging
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

        {/* Exercise Variations */}
        <div className="space-y-4">
          {filteredVariations.map((variation, index) => (
            <motion.div
              key={variation.id}
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
                <Badge className={getDifficultyColor(variation.difficulty)}>
                  {variation.difficulty}
                </Badge>
              </div>

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
                  className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
                >
                  Add to Workout
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredVariations.length === 0 && (
          <div className="text-center py-8">
            <Shuffle className="mx-auto h-12 w-12 text-quantum-cyan/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Variations Found</h3>
            <p className="text-gray-400">
              Try selecting a different category to see available exercises
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
