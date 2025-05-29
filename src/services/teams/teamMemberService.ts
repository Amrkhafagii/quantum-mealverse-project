
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types/fitness/challenges';

export const fetchTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId)
    .eq('is_active', true);

  if (error) throw error;
  
  // Safely map database fields to our TeamMember type
  return (data || []).map((member: any) => ({
    id: member.id,
    user_id: member.user_id,
    team_id: member.team_id,
    role: member.role,
    joined_date: member.joined_at || member.joined_date,
    joined_at: member.joined_at || member.joined_date,
    user_name: undefined, // Not available in current query
    profile_image: undefined, // Not available in current query
    points_contributed: member.contribution_points || 0,
    contribution_points: member.contribution_points || 0,
    is_active: member.is_active !== false
  }));
};

export const joinTeam = async (userId: string, teamId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('team_members')
    .insert([{
      user_id: userId,
      team_id: teamId,
      role: 'member'
    }]);

  if (error) throw error;
  return true;
};

export const leaveTeam = async (userId: string, teamId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('user_id', userId)
    .eq('team_id', teamId);

  if (error) throw error;
  return true;
};
