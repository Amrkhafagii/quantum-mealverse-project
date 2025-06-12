
export interface Team {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  creator_id?: string;
  created_at: string;
  is_active: boolean;
  avatar_url?: string;
  member_count?: number;
  total_points?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  start_date: string;
  end_date: string;
  target_value: number;
  goal_value?: number;
  created_by: string;
  team_id?: string;
  is_active: boolean;
  participants_count?: number;
  reward_points?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'member' | 'admin' | 'owner';
  joined_date: string;
  joined_at?: string;
  is_active: boolean;
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
