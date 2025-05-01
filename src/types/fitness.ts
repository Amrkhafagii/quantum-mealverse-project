
import { MealPlan } from './food';

export interface UserMeasurement {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  body_fat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  legs?: number;
  notes?: string;
}

export interface UserTDEE {
  id: string;
  user_id: string;
  date: string;
  tdee: number;
  bmr: number;
  goal: 'maintain' | 'cut' | 'bulk';
  activity_level: string;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
  notes?: string;
}

export interface SavedMealPlan {
  id: string;
  user_id: string;
  name: string;
  date_created: string;
  tdee_id?: string;
  meal_plan: MealPlan;
}

export interface FitnessGoal {
  id: string;
  user_id: string;
  name: string;
  description: string;
  target_date?: string;
  status: 'active' | 'completed' | 'abandoned';
  target_weight?: number;
  target_body_fat?: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  gender?: string;
  date_of_birth?: string;
  height?: number;
  starting_weight?: number;
  goal_weight?: number;
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  fitness_goals?: string[];
  dietary_preferences?: string[];
  dietary_restrictions?: string[];
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  points: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  date_achieved: string;
  achievement?: Achievement;
}
