
export interface Challenge {
  id: string;
  title: string;
  description?: string;
  type: string;
  target_value: number;
  start_date: string;
  end_date: string;
  team_id?: string;
  participants_count?: number;
  is_active: boolean;
  goal_value?: number;
  reward_points?: number;
  prize_description?: string;
  rules?: string;
  status?: string;
  goal_type?: string;
  created_by: string;
}

export interface ChallengeParticipant {
  id: string;
  challenge_participants_user_id: string;
  challenge_id: string;
  team_id?: string;
  joined_date: string;
  progress: number;
  completed: boolean;
  completion_date?: string;
  challenge?: Challenge;
}
