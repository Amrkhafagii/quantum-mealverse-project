
import { supabase } from '@/integrations/supabase/client';
import { Team } from '@/types/fitness/challenges';

// Simplified interface for raw team data from database
interface DatabaseTeam {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  avatar_url: string | null;
  is_active: boolean;
  max_members: number;
  member_count: number;
  total_points: number;
}

// Helper function to transform raw team data to our Team type
const transformTeam = (team: DatabaseTeam): Team => ({
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
    .select('id, name, description, created_by, created_at, avatar_url, is_active, max_members, member_count, total_points')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Explicitly cast the data to our expected type
  const teams = (data || []) as DatabaseTeam[];
  return teams.map(transformTeam);
};

export const fetchUserTeam = async (userId: string): Promise<Team | null> => {
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      *,
      team:teams(id, name, description, created_by, created_at, avatar_url, is_active, max_members, member_count, total_points)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  if (data?.team) {
    // Explicitly cast the nested team data
    const teamData = data.team as DatabaseTeam;
    return transformTeam(teamData);
  }
  
  return null;
};

export const createTeam = async (userId: string, teamData: Omit<Team, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
  const { data, error } = await supabase
    .from('teams')
    .insert([{
      name: teamData.name,
      description: teamData.description,
      image_url: teamData.image_url,
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
