export type GoalStatus = 'completed' | 'active' | 'not_started' | 'in_progress' | 'failed' | 'abandoned';

export interface FitnessGoal {
  id: string;
  user_id: string;
  title: string;
  name: string;
  description: string;
  target_value: number;
  current_value: number;
  start_date: string;
  target_date: string;
  category: string;
  status: GoalStatus;
  target_weight?: number;
  target_body_fat?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  currentstreak: number;
  longeststreak: number;
  last_activity_date: string;
  streak_type: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  date_achieved: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  points: number;
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  goal_type?: string;
  target_value: number;
  goal_value?: number;
  type: string;
  status?: string;
  team_id?: string;
  created_by: string;
  is_active: boolean;
  reward_points?: number;
  participants_count?: number;
}

export interface ChallengeParticipant {
  id: string;
  user_id: string;
  challenge_id: string;
  team_id?: string;
  joined_date: string;
  progress: number;
  completed: boolean;
}

export interface SavedMealPlan {
  id: string;
  user_id: string;
  name: string;
  meal_plan: any;
  expires_at?: string;
  is_active: boolean;
  date_created?: string;
  tdee_id?: string;
}

export interface SavedMealPlanWithExpiry extends SavedMealPlan {
  // No additional fields needed as we've moved is_active to the base interface
}

export interface SavedMealPlan {
  id: string;
  user_id: string;
  name: string;
  meal_plan: any;
  expires_at?: string;
  is_active: boolean;
  date_created?: string;
  tdee_id?: string;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  difficulty: string;
  frequency: number;
  duration_weeks: number;
  goal: string;
  workout_days: WorkoutDay[];
  created_at?: string;
  updated_at?: string;
}

export interface WorkoutDay {
  id: string;
  name: string;
  day_name: string;
  exercises: Exercise[];
  day_number?: number;
  target_muscle_groups?: string[];
  completed?: boolean;
  order?: number;
}

export interface Exercise {
  id: string;
  name: string;
  exercise_id?: string;
  exercise_name?: string;
  target_muscle?: string;
  sets: number;
  reps: string | number;
  weight?: number;
  duration?: number | string;
  rest_time?: number;
  rest?: number;
  rest_seconds?: number;
  completed?: boolean;
  instructions?: string;
  notes?: string;
}

export interface WorkoutSet {
  set_number: number;
  weight: number;
  reps: number | string;
  completed: boolean;
  exercise_id?: string;
  exercise_name?: string;
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

export interface WorkoutSchedule {
  id: string;
  user_id: string;
  workout_plan_id: string;
  days_of_week: number[];
  day_of_week?: string;
  start_date: string;
  end_date?: string;
  preferred_time?: string;
  time?: string;
  reminder?: boolean;
  active: boolean;
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

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  points: number;
  type: string;
  requirements: any;
  completed: boolean;
  deadline?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  creator_id?: string;
  created_at: string;
  members_count: number;
  member_count?: number;
  challenges_count?: number;
  image_url?: string;
  avatar_url?: string;
  total_points?: number;
}

export interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: string;
  joined_date: string;
  joined_at?: string;
  user_name?: string;
  profile_image?: string;
  points_contributed?: number;
  contribution_points?: number;
}

export interface StreakReward {
  id: string;
  days_required: number;
  streak_days?: number;
  days?: number;
  streak_length?: number;
  reward_name: string;
  title?: string;
  reward_description: string;
  reward_value: number | string;
  reward_type?: string;
  reward_image?: string;
  icon?: string;
  points?: number;
  is_claimed?: boolean;
}

export interface StreakRewardsProps {
  currentStreak: number;
  rewards: StreakReward[];
  userId?: string;
  longestStreak?: number;
  onClaimReward?: (rewardId: string) => void;
}
