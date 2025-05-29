
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
  challenge_type?: string;
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
  creator_id?: string; // Maps to database creator_id field
  created_at: string;
  member_count: number;
  members_count?: number; // Maps to database members_count field
  avatar_url?: string;
  image_url?: string; // Alias for avatar_url for component compatibility
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
  is_active: boolean;
}

export interface TeamChallengeProgress {
  id: string;
  team_id: string;
  challenge_id: string;
  total_progress: number;
  target_value: number;
  completed: boolean;
  completion_date?: string;
  created_at: string;
  updated_at: string;
  challenge?: Challenge;
  team?: Team;
}
