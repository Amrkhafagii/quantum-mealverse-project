import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from '@/components/ui/badge';
import { WorkoutHistoryItem } from '@/types/fitness/workouts';

interface WorkoutDetailProps {
  workout: WorkoutHistoryItem;
}

const WorkoutDetail: React.FC<WorkoutDetailProps> = ({ workout }) => {
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="text-quantum-cyan">{workout.workout_plan_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full space-y-4">
          <div className="flex justify-between">
            <Badge variant="secondary">Date: {workout.date}</Badge>
            <Badge variant="secondary">Duration: {workout.duration} minutes</Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Workout Details:</h3>
            <p>Exercises Completed: {workout.exercises_completed}</p>
            <p>Total Exercises: {workout.total_exercises}</p>
            {workout.calories_burned && <p>Calories Burned: {workout.calories_burned}</p>}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default WorkoutDetail;
