
export interface WorkoutGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  goal_type: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'general_fitness';
  target_value?: number;
  current_value?: number;
  unit?: string;
  target_date?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutAnalytics {
  id: string;
  user_id: string;
  metric_type: string;
  metric_value: number;
  metric_date: string;
  metadata?: any;
  created_at?: string;
}

export interface ExerciseProgress {
  id: string;
  user_id: string;
  exercise_name: string;
  workout_log_id?: string;
  max_weight?: number;
  max_reps?: number;
  total_volume?: number;
  one_rep_max?: number;
  recorded_date: string;
  created_at?: string;
}

export interface ProgressChartData {
  date: string;
  value: number;
  label: string;
}

export interface WorkoutPerformanceMetrics {
  totalWorkouts: number;
  totalVolume: number;
  averageDuration: number;
  strongestExercise: string;
  improvementRate: number;
  consistencyScore: number;
}
