
export interface WorkoutLog {
  id?: string;
  user_id: string;
  workout_plan_id: string;
  date: string;
  duration: number;
  calories_burned?: number | null;
  notes?: string | null;
  completed_exercises: CompletedExercise[];
  exercises_completed?: any[]; // For backward compatibility
}

export interface CompletedExercise {
  exercise_id?: string;
  name: string;
  sets_completed?: WorkoutSet[];
  notes?: string;
  exercise_name?: string;
  weight_used?: number[];
  reps_completed?: number[];
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
  calories_burned?: number;
}

export interface WorkoutSet {
  set_number: number;
  weight: number;
  reps: number | string;
  completed: boolean;
  notes?: string;
}
