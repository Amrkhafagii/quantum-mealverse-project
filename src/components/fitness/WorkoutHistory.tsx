
import React from 'react';
import ResponsiveWorkoutHistory from './ResponsiveWorkoutHistory';
import { WorkoutHistoryItem } from '@/types/fitness';

interface WorkoutHistoryProps {
  userId?: string;
  workoutHistory: WorkoutHistoryItem[];
  isLoading: boolean;
}

const WorkoutHistory: React.FC<WorkoutHistoryProps> = (props) => {
  return <ResponsiveWorkoutHistory {...props} />;
};

export default WorkoutHistory;
