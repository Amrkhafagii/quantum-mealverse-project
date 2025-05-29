
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Edit3, Calendar, Clock, Target } from 'lucide-react';
import type { WorkoutPlan } from '@/types/fitness/workouts';

interface WorkoutPlanCardProps {
  plan: WorkoutPlan;
  onStart: () => void;
  onEdit: () => void;
  detailed?: boolean;
}

export const WorkoutPlanCard: React.FC<WorkoutPlanCardProps> = ({
  plan,
  onStart,
  onEdit,
  detailed = false
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'border-green-500 text-green-500';
      case 'intermediate':
        return 'border-yellow-500 text-yellow-500';
      case 'advanced':
        return 'border-red-500 text-red-500';
      default:
        return 'border-gray-500 text-gray-500';
    }
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 hover:border-quantum-cyan/40 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-white text-lg">{plan.name}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-gray-400 hover:text-white"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
        {plan.description && (
          <p className="text-sm text-gray-400 line-clamp-2">{plan.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={getDifficultyColor(plan.difficulty)}>
            {plan.difficulty}
          </Badge>
          {plan.goal && (
            <Badge variant="outline" className="border-quantum-cyan/50 text-quantum-cyan">
              {plan.goal}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-300">{plan.frequency}/week</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-300">{plan.duration_weeks}w</span>
          </div>
        </div>

        {detailed && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">
                {plan.workout_days?.length || 0} workout days
              </span>
            </div>
          </div>
        )}

        <Button 
          onClick={onStart}
          className="w-full bg-quantum-cyan hover:bg-quantum-cyan/80"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Workout
        </Button>
      </CardContent>
    </Card>
  );
};
