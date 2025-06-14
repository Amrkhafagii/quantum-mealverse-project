
export interface UserProfile {
  id: string;
  fitness_profiles_user_id: string;
  display_name?: string;
  height?: number;
  weight: number;
  goal_weight?: number;
  date_of_birth?: string | null;
  gender?: string;
  fitness_level?: string;
  fitness_goals?: string[];
  dietary_preferences?: string[];
  dietary_restrictions?: string[];
  created_at?: string;
  updated_at?: string;
  activity_level?: string;
  
  // Backward compatibility fields
  user_id?: string;
  user_profiles_user_id?: string;
  age?: number;
  fitness_goal?: string;
}

export interface UserMeasurement {
  id: string;
  user_measurements_user_id: string;
  date: string;
  weight: number;
  body_fat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  legs?: number;
  notes?: string;
  
  // Backward compatibility
  user_id?: string;
}
