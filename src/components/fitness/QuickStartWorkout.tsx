
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Dumbbell, Heart, Timer } from 'lucide-react';

interface QuickStartWorkoutProps {
  onStartWorkout: (planId: string) => void;
}

export const QuickStartWorkout: React.FC<QuickStartWorkoutProps> = ({
  onStartWorkout
}) => {
  const quickWorkouts = [
    {
      id: 'quick-cardio',
      name: '15-Min Cardio',
      description: 'Quick cardio boost',
      icon: <Heart className="h-5 w-5" />,
      duration: '15 min',
      color: 'text-red-500'
    },
    {
      id: 'quick-strength',
      name: 'Strength Circuit',
      description: 'Full body strength',
      icon: <Dumbbell className="h-5 w-5" />,
      duration: '20 min',
      color: 'text-blue-500'
    },
    {
      id: 'quick-hiit',
      name: 'HIIT Session',
      description: 'High intensity training',
      icon: <Zap className="h-5 w-5" />,
      duration: '12 min',
      color: 'text-yellow-500'
    }
  ];

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="text-quantum-cyan flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Quick Start Workouts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickWorkouts.map((workout) => (
            <Button
              key={workout.id}
              variant="outline"
              className="h-auto p-4 border-quantum-cyan/20 hover:border-quantum-cyan/40 flex flex-col items-start gap-2"
              onClick={() => onStartWorkout(workout.id)}
            >
              <div className="flex items-center gap-2 w-full">
                <span className={workout.color}>{workout.icon}</span>
                <span className="font-medium text-white">{workout.name}</span>
              </div>
              <div className="text-sm text-gray-400">{workout.description}</div>
              <div className="text-xs text-quantum-cyan">{workout.duration}</div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
