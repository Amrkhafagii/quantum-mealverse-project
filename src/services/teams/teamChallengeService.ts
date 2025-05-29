
import { supabase } from '@/integrations/supabase/client';
import { Challenge, TeamChallengeProgress } from '@/types/fitness/challenges';

export const fetchTeamChallenges = async (): Promise<Challenge[]> => {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('type', 'team')
    .eq('is_active', true)
    .gte('end_date', new Date().toISOString())
    .order('start_date', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const fetchTeamProgress = async (teamId: string): Promise<TeamChallengeProgress[]> => {
  // For now, return empty array until the database function is created
  // In the future, this would query team_challenge_progress table
  return [];
};
