
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
      
      // Map database fields to our Team type
      const mappedTeams: Team[] = (data || []).map(team => ({
        id: team.id,
        name: team.name,
        description: team.description,
        created_by: team.created_by,
        creator_id: team.created_by,
        created_at: team.created_at,
        updated_at: team.updated_at,
        image_url: team.image_url,
        is_active: team.is_active,
        max_members: team.max_members,
        members_count: 0, // Will be populated separately if needed
        member_count: 0,
        challenges_count: 0,
        total_points: 0
      }));
      
      setTeams(mappedTeams);
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
        const team = data.team as any;
        const mappedTeam: Team = {
          id: team.id,
          name: team.name,
          description: team.description,
          created_by: team.created_by,
          creator_id: team.created_by,
          created_at: team.created_at,
          updated_at: team.updated_at,
          image_url: team.image_url,
          is_active: team.is_active,
          max_members: team.max_members,
          members_count: 0,
          member_count: 0,
          challenges_count: 0,
          total_points: 0
        };
        
        setUserTeam(mappedTeam);
        fetchTeamMembers(team.id);
        fetchTeamProgress(team.id);
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
      
      // Map database fields to our TeamMember type
      const mappedMembers: TeamMember[] = (data || []).map(member => ({
        id: member.id,
        user_id: member.user_id,
        team_id: member.team_id,
        role: member.role,
        joined_date: member.joined_at,
        joined_at: member.joined_at,
        points_contributed: member.points_contributed || 0,
        contribution_points: member.points_contributed || 0,
        is_active: member.is_active
      }));
      
      setTeamMembers(mappedMembers);
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
      // For now, set empty array until the database function is created
      // In the future, this would query team_challenge_progress table
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
