
// Fitness and workout related types with updated user ID naming

export interface WorkoutPlan {
  id: string;
  workout_plans_user_id: string; // Updated to match new naming convention
  name: string;
  description?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  exercises: WorkoutExercise[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSession {
  id: string;
  workout_sessions_user_id: string; // Updated to match new naming convention
  workout_plan_id?: string;
  name: string;
  scheduled_date: string;
  scheduled_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  exercises_completed: WorkoutExerciseLog[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  description?: string;
  muscle_groups: string[];
  equipment?: string[];
  instructions: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  sets: number;
  reps: number;
  weight?: number;
  duration_seconds?: number;
  rest_seconds?: number;
}

export interface WorkoutExerciseLog {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  exercise_name: string;
  sets_completed: WorkoutSet[];
  notes?: string;
  completed_at: string;
}

export interface WorkoutSet {
  set_number: number;
  reps: number;
  weight?: number;
  duration_seconds?: number;
  rest_seconds?: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
}

export interface WorkoutLog {
  id: string;
  workout_logs_user_id: string; // Updated to match new naming convention
  workout_plan_id?: string;
  date: string;
  duration_minutes: number;
  exercises_completed: any[]; // JSON data
  total_sets: number;
  total_reps: number;
  total_volume: number;
  average_heart_rate?: number;
  calories_burned?: number;
  notes?: string;
  created_at: string;
}

export interface ExerciseProgress {
  id: string;
  exercise_progress_user_id: string; // Updated to match new naming convention
  exercise_name: string;
  workout_log_id: string;
  max_weight: number;
  max_reps: number;
  total_volume: number;
  one_rep_max?: number;
  recorded_date: string;
  created_at: string;
}

export interface UserMeasurements {
  id: string;
  user_measurements_user_id: string; // Updated to match new naming convention
  date: string;
  weight?: number;
  height?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  bicep?: number;
  thigh?: number;
  created_at: string;
}

export interface FitnessGoal {
  id: string;
  fitness_goals_user_id: string; // Updated to match new naming convention
  goal_type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness';
  target_value: number;
  current_value: number;
  target_date: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedMealPlan {
  id: string;
  saved_meal_plans_user_id: string; // Updated to match new naming convention
  name: string;
  description?: string;
  meal_plan_data: any; // JSON data containing the meal plan
  nutritional_targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface UserProgress {
  id: string;
  user_progress_user_id: string; // Updated to match new naming convention
  date: string;
  weight?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  workout_frequency: number;
  average_session_duration: number;
  total_workouts_completed: number;
  calories_burned: number;
  achievements_unlocked: string[];
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  points: number;
}

export interface AchievementProgress {
  id: string;
  achievement_progress_user_id: string; // Updated to match new naming convention
  achievement_id: string;
  current_progress: number;
  target_progress: number;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  type: string;
  target_value: number;
  start_date: string;
  end_date: string;
  created_by: string;
  team_id?: string;
  participants_count?: number;
  is_active: boolean;
  goal_value?: number;
  reward_points?: number;
  prize_description?: string;
  rules?: string;
  status?: string;
  goal_type?: string;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  challenge_participants_user_id: string; // Updated to match new naming convention
  team_id?: string;
  joined_date: string;
  progress: number;
  completed: boolean;
  completion_date?: string;
}
