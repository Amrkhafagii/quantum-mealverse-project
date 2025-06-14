
export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  workout_days: import('./workouts').WorkoutDay[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
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
  duration?: number;
  rest_time?: number;
  rest?: number;
  rest_seconds?: number;
  instructions?: string;
  description?: string;
  muscle_groups?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  video_url?: string;
  equipment_needed?: string[];
}

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  description?: string;
  muscle_groups: string[];
  equipment_needed?: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string;
  video_url?: string;
  image_url?: string;
}
