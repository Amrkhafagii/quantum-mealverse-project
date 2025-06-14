
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkoutVariation {
  id: string;
  name: string;
  description: string;
  difficulty: string;
}

interface WorkoutVariationsProps {
  workoutId?: string;
}

const WorkoutVariations: React.FC<WorkoutVariationsProps> = ({ workoutId }) => {
  // Mock data for now since the database table doesn't exist
  const variations: WorkoutVariation[] = [
    {
      id: '1',
      name: 'Beginner Variation',
      description: 'Simplified version for beginners',
      difficulty: 'Easy'
    },
    {
      id: '2',
      name: 'Advanced Variation',
      description: 'More challenging version',
      difficulty: 'Hard'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Workout Variations</h3>
      {variations.map((variation) => (
        <Card key={variation.id}>
          <CardHeader>
            <CardTitle className="text-base">{variation.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">{variation.description}</p>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {variation.difficulty}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WorkoutVariations;
