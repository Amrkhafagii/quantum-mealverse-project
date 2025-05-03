
export interface WorkoutSet {
  set_number: number;
  weight: number;
  reps: number | string;
  completed: boolean;
  exercise_id?: string;
  exercise_name?: string;
}

export interface ExerciseLog {
  exercise_id: string;
  sets_completed: number;
  reps_completed: string;
  weight_used?: number;
}

export interface CompletedExercise {
  exercise_id: string;
  name: string;
  exercise_name?: string;
  sets_completed: WorkoutSet[];
  weight_used?: number[];
  reps_completed?: number[];
  notes?: string;
  sets?: number;
  reps?: string | number;
  weight?: number;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  workout_plan_id: string;
  date: string;
  duration: number;
  calories_burned: number | null;
  notes?: string | null;
  exercises_completed?: ExerciseLog[];
  completed_exercises: CompletedExercise[];
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutHistoryItem {
  id: string;
  user_id: string;
  workout_log_id: string;
  date: string;
  workout_plan_name: string;
  workout_day_name: string;
  exercises_completed: number;
  total_exercises: number;
  duration: number;
  calories_burned: number;
}
