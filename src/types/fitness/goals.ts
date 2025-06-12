
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
  type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'strength';
  is_active: boolean;
}
