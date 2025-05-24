
import React from 'react';
import { WorkoutScheduler as NewWorkoutScheduler } from './scheduling/WorkoutScheduler';

export interface WorkoutSchedulerProps {
  userId?: string;
  schedules?: any[];
  onScheduleCreated?: (userId?: string) => Promise<void>;
  refreshSchedules?: (userId?: string) => Promise<void>;
  refreshHistory?: (userId?: string) => Promise<void>;
  logWorkout?: (workoutLog: any) => Promise<boolean>;
}

const WorkoutScheduler: React.FC<WorkoutSchedulerProps> = (props) => {
  // Use the new scheduling component
  return <NewWorkoutScheduler />;
};

export default WorkoutScheduler;
