
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
