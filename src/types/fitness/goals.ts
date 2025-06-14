
export type GoalStatus = 'completed' | 'active' | 'not_started' | 'in_progress' | 'failed' | 'abandoned';

export interface FitnessGoal {
  id: string;
  fitness_goals_user_id: string; // Updated to match new naming convention
  title?: string; // Optional for backward compatibility
  name: string;
  description: string;
  target_value: number;
  current_value: number;
  start_date?: string; // Optional for backward compatibility
  target_date: string;
  category?: string; // Optional for backward compatibility
  status: GoalStatus;
  target_weight?: number;
  target_body_fat?: number;
  created_at?: string;
  updated_at?: string;
  type?: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'strength'; // Optional for backward compatibility
  goal_type?: string; // For database compatibility
  is_active?: boolean; // Optional for backward compatibility
}
