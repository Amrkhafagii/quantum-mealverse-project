
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
