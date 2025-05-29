
import { supabase } from '@/integrations/supabase/client';

// Define the Team interface directly to avoid type conflicts
interface Team {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  avatar_url?: string;
  is_active: boolean;
  max_members: number;
  members_count: number;
  member_count: number;
  challenges_count: number;
  total_points: number;
}

// Helper function to transform raw team data to our Team type
const transformTeam = (team: any): Team => ({
  id: team.id,
  name: team.name,
  description: team.description || undefined,
  created_by: team.created_by,
  creator_id: team.created_by,
  created_at: team.created_at,
  updated_at: team.created_at,
  image_url: team.avatar_url || undefined,
  avatar_url: team.avatar_url || undefined,
  is_active: team.is_active !== false,
  max_members: team.max_members || 50,
  members_count: team.member_count || 0,
  member_count: team.member_count || 0,
  challenges_count: 0,
  total_points: team.total_points || 0
});

export const fetchTeams = async (): Promise<Team[]> => {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      id,
      name,
      description,
      created_by,
      created_at,
      avatar_url,
      is_active,
      max_members,
      member_count,
      total_points
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return (data || []).map(transformTeam);
};

export const fetchUserTeam = async (userId: string): Promise<Team | null> => {
  const { data: membershipData, error: membershipError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (membershipError && membershipError.code !== 'PGRST116') throw membershipError;
  
  if (!membershipData) return null;

  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .select(`
      id,
      name,
      description,
      created_by,
      created_at,
      avatar_url,
      is_active,
      max_members,
      member_count,
      total_points
    `)
    .eq('id', membershipData.team_id)
    .single();

  if (teamError) throw teamError;
  
  return teamData ? transformTeam(teamData) : null;
};

interface CreateTeamData {
  name: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  max_members?: number;
}

export const createTeam = async (userId: string, teamData: CreateTeamData): Promise<boolean> => {
  const { data, error } = await supabase
    .from('teams')
    .insert([{
      name: teamData.name,
      description: teamData.description,
      avatar_url: teamData.image_url,
      created_by: userId,
      is_active: teamData.is_active,
      max_members: teamData.max_members
    }])
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from('team_members')
    .insert([{
      user_id: userId,
      team_id: data.id,
      role: 'admin'
    }]);

  return true;
};
