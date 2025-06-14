
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
  is_active?: boolean;
  goal_value?: number;
  reward_points?: number;
  prize_description?: string;
  rules?: string;
  status?: string;
  goal_type?: string;
}
