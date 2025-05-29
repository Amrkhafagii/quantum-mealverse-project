
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Team, TeamMember, Challenge, TeamChallengeProgress } from '@/types/fitness/challenges';

export function useTeamChallenges() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamChallenges, setTeamChallenges] = useState<Challenge[]>([]);
  const [teamProgress, setTeamProgress] = useState<TeamChallengeProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTeams();
      fetchUserTeam();
      fetchTeamChallenges();
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserTeam = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          team:teams(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data && data.team) {
        setUserTeam(data.team as Team);
        fetchTeamMembers(data.team.id);
        fetchTeamProgress(data.team.id);
      }
    } catch (error) {
      console.error('Error fetching user team:', error);
    }
  };

  const fetchTeamMembers = async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .eq('is_active', true);

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchTeamChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('challenge_type', 'team')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      if (error) throw error;
      setTeamChallenges(data || []);
    } catch (error) {
      console.error('Error fetching team challenges:', error);
    }
  };

  const fetchTeamProgress = async (teamId: string) => {
    try {
      // Since team_challenge_progress might not be in Supabase types yet, we'll use a generic query
      const { data, error } = await supabase
        .rpc('get_team_challenge_progress', { team_id: teamId });

      if (error && error.code !== '42883') { // Function doesn't exist error
        console.error('Error fetching team progress:', error);
        return;
      }
      
      // For now, set empty array until the database function is created
      setTeamProgress([]);
    } catch (error) {
      console.error('Error fetching team progress:', error);
      setTeamProgress([]);
    }
  };

  const joinTeam = async (teamId: string) => {
    if (!user) return false;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('team_members')
        .insert([{
          user_id: user.id,
          team_id: teamId,
          role: 'member'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "You've joined the team!",
      });

      await fetchUserTeam();
      return true;
    } catch (error) {
      console.error('Error joining team:', error);
      toast({
        title: "Error",
        description: "Failed to join team",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const leaveTeam = async () => {
    if (!user || !userTeam) return false;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('user_id', user.id)
        .eq('team_id', userTeam.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "You've left the team",
      });

      setUserTeam(null);
      setTeamMembers([]);
      setTeamProgress([]);
      return true;
    } catch (error) {
      console.error('Error leaving team:', error);
      toast({
        title: "Error",
        description: "Failed to leave team",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createTeam = async (teamData: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return false;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          name: teamData.name,
          description: teamData.description,
          image_url: teamData.image_url,
          created_by: user.id,
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
          user_id: user.id,
          team_id: data.id,
          role: 'admin'
        }]);

      toast({
        title: "Success",
        description: "Team created successfully!",
      });

      await fetchTeams();
      await fetchUserTeam();
      return true;
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    teams,
    userTeam,
    teamMembers,
    teamChallenges,
    teamProgress,
    isLoading,
    joinTeam,
    leaveTeam,
    createTeam,
    refetch: () => {
      fetchTeams();
      fetchUserTeam();
      fetchTeamChallenges();
    }
  };
}
