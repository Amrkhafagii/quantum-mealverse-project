
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Check, Clock } from 'lucide-react';

interface ActiveWorkout {
  id: string;
  planName: string;
  currentExercise: string;
  exerciseCount: number;
  totalExercises: number;
  duration: number;
  startedAt: string;
}

interface ActiveWorkoutCardProps {
  workout: ActiveWorkout;
  onContinue: () => void;
  onComplete: () => void;
}

export const ActiveWorkoutCard: React.FC<ActiveWorkoutCardProps> = ({
  workout,
  onContinue,
  onComplete
}) => {
  const progress = (workout.exerciseCount / workout.totalExercises) * 100;
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card className="bg-gradient-to-r from-quantum-cyan/10 to-quantum-darkBlue/30 border-quantum-cyan/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-quantum-cyan">Active Workout</CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            {formatDuration(workout.duration)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-white font-medium mb-1">{workout.planName}</h3>
          <p className="text-sm text-gray-400">Current: {workout.currentExercise}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="text-white">{workout.exerciseCount}/{workout.totalExercises} exercises</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex gap-2">
          <Button onClick={onContinue} className="flex-1 bg-quantum-cyan hover:bg-quantum-cyan/80">
            <Play className="h-4 w-4 mr-2" />
            Continue
          </Button>
          <Button onClick={onComplete} variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10">
            <Check className="h-4 w-4 mr-2" />
            Complete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
