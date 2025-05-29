
import { supabase } from '@/integrations/supabase/client';
import type { Team } from '@/types/fitness/challenges';

// Define a simple interface for what we expect from the database
interface TeamDatabaseRow {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  creator_id: string | null;
  created_at: string;
  avatar_url: string | null;
  member_count: number | null;
  members_count: number | null;
  total_points: number | null;
}

// Transform function that maps database fields to Team interface
const transformTeam = (team: TeamDatabaseRow): Team => {
  return {
    id: team.id,
    name: team.name,
    description: team.description || undefined,
    created_by: team.created_by,
    creator_id: team.creator_id || undefined,
    created_at: team.created_at,
    avatar_url: team.avatar_url || undefined,
    image_url: team.avatar_url || undefined,
    member_count: team.member_count ?? 0,
    members_count: team.members_count ?? 0,
    total_points: team.total_points ?? 0
  };
};

export const fetchTeams = async (): Promise<Team[]> => {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      id,
      name,
      description,
      created_by,
      creator_id,
      created_at,
      avatar_url,
      member_count,
      members_count,
      total_points
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return (data || []).map(team => transformTeam(team as TeamDatabaseRow));
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
      creator_id,
      created_at,
      avatar_url,
      member_count,
      members_count,
      total_points
    `)
    .eq('id', membershipData.team_id)
    .single();

  if (teamError) throw teamError;
  
  return teamData ? transformTeam(teamData as TeamDatabaseRow) : null;
};

interface CreateTeamData {
  name: string;
  description?: string;
  image_url?: string;
}

export const createTeam = async (userId: string, teamData: CreateTeamData): Promise<boolean> => {
  const { data, error } = await supabase
    .from('teams')
    .insert([{
      name: teamData.name,
      description: teamData.description,
      avatar_url: teamData.image_url,
      created_by: userId,
      creator_id: userId
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
