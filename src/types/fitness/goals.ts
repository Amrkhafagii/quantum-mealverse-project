
export type GoalStatus = 'completed' | 'active' | 'not_started' | 'in_progress' | 'failed' | 'abandoned';

export interface FitnessGoal {
  id: string;
  fitness_goals_user_id: string; // Updated to match new naming convention
  name: string;
  description: string;
  target_value: number;
  current_value: number;
  target_date: string;
  status: GoalStatus;
  goal_type?: string; // For database compatibility
  created_at?: string;
  updated_at?: string;
  
  // Additional optional properties for backward compatibility
  title?: string;
  target_weight?: number;
  target_body_fat?: number;
  category?: string;
  type?: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'strength';
  start_date?: string;
  is_active?: boolean;
}
