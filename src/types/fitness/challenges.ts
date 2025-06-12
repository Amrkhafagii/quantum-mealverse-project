
export interface Team {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  start_date: string;
  end_date: string;
  target_value: number;
  created_by: string;
  team_id?: string;
  is_active: boolean;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'member' | 'admin' | 'owner';
  joined_date: string;
  is_active: boolean;
}
