
export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  goal: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  frequency: number;
  duration_weeks: number;
  workout_days: WorkoutDay[];
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface WorkoutDay {
  id?: string;
  name?: string;
  day_name: string;
  exercises: Exercise[];
}

export interface Exercise {
  id?: string;
  exercise_id?: string;
  name: string;
  exercise_name?: string;
  target_muscle: string;
  sets: number;
  reps: number | string;
  weight?: number;
  rest: number;
  rest_time?: number;
  rest_seconds?: number;
  notes?: string;
  preparation_time?: number;
  duration?: number;
}

export interface WorkoutLog {
  id?: string;
  user_id: string;
  workout_plan_id?: string;
  date: string;
  duration?: number;
  calories_burned?: number;
  notes?: string;
  completed_exercises: CompletedExercise[];
  exercises_completed?: CompletedExercise[];
  created_at?: string;
}

export interface CompletedExercise {
  exercise_id?: string;
  name?: string;
  exercise_name: string;
  sets_completed: ExerciseSet[];
  reps_completed?: number[];
  weight_used?: number[];
  notes?: string;
}

export interface ExerciseSet {
  id?: string;
  user_id: string;
  exercise_name: string;
  weight: number;
  reps: number;
  rest_time?: number;
  notes?: string;
  workout_log_id?: string;
  created_at?: string;
}

export interface WorkoutSet {
  id?: string;
  exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
  rest_time?: number;
  completed?: boolean;
}

export interface WorkoutSchedule {
  id?: string;
  user_id: string;
  workout_plan_id?: string;
  day_of_week?: number;
  days_of_week: number[];
  time?: string;
  preferred_time?: string;
  reminder?: boolean;
  start_date?: string;
  end_date?: string;
  active?: boolean;
}

export interface WorkoutHistoryItem {
  id: string;
  user_id: string;
  workout_log_id?: string;
  date: string;
  workout_plan_name: string;
  workout_day_name: string;
  duration: number;
  exercises_completed: number;
  total_exercises: number;
  calories_burned?: number;
  created_at?: string;
}

export interface WorkoutRecommendation {
  id: string;
  title: string;
  name: string;
  description: string;
  type: string;
  reason: string;
  confidence_score: number;
  user_id: string;
  suggested_at: string;
  dismissed: boolean;
  applied: boolean;
  applied_at?: string;
}
