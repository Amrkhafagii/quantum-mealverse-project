
export interface WorkoutGoal {
  id: string;
  user_id: string;
  goal_type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'strength';
  target_value: number;
  current_value: number;
  target_date: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsData {
  totalWorkouts: number;
  totalVolume: number;
  averageDuration: number;
  strongestExercise: string;
}
