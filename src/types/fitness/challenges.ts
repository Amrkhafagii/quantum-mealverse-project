
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
  created_by: string;
  is_active: boolean;
  reward_points?: number;
  participants_count?: number;
  challenge_type?: string;
}

export interface ChallengeParticipant {
  id: string;
  user_id: string;
  challenge_id: string;
  joined_date: string;
  progress: number;
  completed: boolean;
}
