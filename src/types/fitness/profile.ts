
export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  weight: number;
  height: number;
  age?: number;
  gender: string;
  goal_weight?: number;
  fitness_level?: string;
  fitness_goals?: string[];
  profile_image?: string;
  date_of_birth?: string | null;
  dietary_preferences?: string[] | null;
  dietary_restrictions?: string[] | null;
  avatar_url?: string;
  username?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserMeasurement {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  body_fat?: number;
  body_fat_percentage?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  legs?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserWorkoutStats {
  total_workouts: number;
  streak_days?: number;
  streak?: number;
  most_active_day?: string;
  recent_workouts?: any[];
  achievements?: number;
  calories_burned?: number;
  calories_burned_total?: number;
  workout_time_total?: number;
  favorite_workout_type?: string;
}

export interface WorkoutRecommendation {
  id: string;
  title: string;
  name: string;
  description: string;
  type: string;
  reason?: string;
  confidence_score?: number;
  user_id: string;
  suggested_at?: string;
  dismissed?: boolean;
  applied?: boolean;
  applied_at?: string;
}
