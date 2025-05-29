
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Team, TeamMember, Challenge, TeamChallengeProgress } from '@/types/fitness/challenges';
import { fetchTeams, fetchUserTeam, createTeam } from '@/services/teams/teamService';
import { fetchTeamMembers, joinTeam as joinTeamService, leaveTeam as leaveTeamService } from '@/services/teams/teamMemberService';
import { fetchTeamChallenges, fetchTeamProgress } from '@/services/teams/teamChallengeService';

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
      loadTeams();
      loadUserTeam();
      loadTeamChallenges();
    }
  }, [user]);

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      const teamsData = await fetchTeams();
      setTeams(teamsData);
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

  const loadUserTeam = async () => {
    if (!user) return;

    try {
      const team = await fetchUserTeam(user.id);
      setUserTeam(team);
      
      if (team) {
        loadTeamMembers(team.id);
        loadTeamProgress(team.id);
      }
    } catch (error) {
      console.error('Error fetching user team:', error);
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    try {
      const members = await fetchTeamMembers(teamId);
      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const loadTeamChallenges = async () => {
    try {
      const challenges = await fetchTeamChallenges();
      setTeamChallenges(challenges);
    } catch (error) {
      console.error('Error fetching team challenges:', error);
    }
  };

  const loadTeamProgress = async (teamId: string) => {
    try {
      const progress = await fetchTeamProgress(teamId);
      setTeamProgress(progress);
    } catch (error) {
      console.error('Error fetching team progress:', error);
      setTeamProgress([]);
    }
  };

  const joinTeam = async (teamId: string) => {
    if (!user) return false;

    try {
      setIsLoading(true);
      await joinTeamService(user.id, teamId);

      toast({
        title: "Success",
        description: "You've joined the team!",
      });

      await loadUserTeam();
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
      await leaveTeamService(user.id, userTeam.id);

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

  const handleCreateTeam = async (teamData: { name: string; description?: string; image_url?: string }) => {
    if (!user) return false;

    try {
      setIsLoading(true);
      await createTeam(user.id, teamData);

      toast({
        title: "Success",
        description: "Team created successfully!",
      });

      await loadTeams();
      await loadUserTeam();
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
    createTeam: handleCreateTeam,
    refetch: () => {
      loadTeams();
      loadUserTeam();
      loadTeamChallenges();
    }
  };
}
