
import { WorkoutDay } from '../fitness/workouts';

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscle_groups: string[];
  equipment_needed: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string[];
  video_url?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks?: number;
  frequency_per_week?: number;
  goal?: string;
  workout_days: WorkoutDay[];
  is_public: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseSelection {
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: string | number;
  weight?: number;
  duration?: string;
  rest_time?: number;
  notes?: string;
}
