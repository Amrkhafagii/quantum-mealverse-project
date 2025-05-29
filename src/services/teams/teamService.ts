
import { supabase } from '@/integrations/supabase/client';
import { Team } from '@/types/fitness/challenges';

export const fetchTeams = async (): Promise<Team[]> => {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      id,
      name,
      description,
      created_by,
      created_at,
      updated_at,
      avatar_url,
      is_active,
      max_members,
      member_count,
      total_points
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Safely map database fields to our Team type
  return (data || []).map((team) => ({
    id: team.id,
    name: team.name,
    description: team.description || undefined,
    created_by: team.created_by,
    creator_id: team.created_by,
    created_at: team.created_at,
    updated_at: team.updated_at || team.created_at,
    image_url: team.avatar_url || undefined,
    avatar_url: team.avatar_url || undefined,
    is_active: team.is_active !== false,
    max_members: team.max_members || 50,
    members_count: team.member_count || 0,
    member_count: team.member_count || 0,
    challenges_count: 0, // Default value since it's not in database
    total_points: team.total_points || 0
  }));
};

export const fetchUserTeam = async (userId: string): Promise<Team | null> => {
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      *,
      team:teams(
        id,
        name,
        description,
        created_by,
        created_at,
        updated_at,
        avatar_url,
        is_active,
        max_members,
        member_count,
        total_points
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  if (data?.team) {
    const team = data.team;
    return {
      id: team.id,
      name: team.name,
      description: team.description || undefined,
      created_by: team.created_by,
      creator_id: team.created_by,
      created_at: team.created_at,
      updated_at: team.updated_at || team.created_at,
      image_url: team.avatar_url || undefined,
      avatar_url: team.avatar_url || undefined,
      is_active: team.is_active !== false,
      max_members: team.max_members || 50,
      members_count: team.member_count || 0,
      member_count: team.member_count || 0,
      challenges_count: 0,
      total_points: team.total_points || 0
    };
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

  // Automatically join the creator to the team
  await supabase
    .from('team_members')
    .insert([{
      user_id: userId,
      team_id: data.id,
      role: 'admin'
    }]);

  return true;
};
