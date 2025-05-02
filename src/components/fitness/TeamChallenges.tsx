
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Users, Trophy, Calendar, Target } from 'lucide-react';
import { Team, Challenge, TeamMember } from '@/types/fitness';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

interface TeamChallengesProps {
  userId?: string;
}

const TeamChallenges: React.FC<TeamChallengesProps> = ({ userId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userTeams, setUserTeams] = useState<TeamMember[]>([]);
  const [activeTab, setActiveTab] = useState<'teams' | 'challenges'>('teams');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // For now we'll use mock data until the database tables are created
      setTimeout(() => {
        setTeams(getMockTeams());
        setChallenges(getMockChallenges());
        setUserTeams(getMockUserTeams(userId || ''));
        setLoading(false);
      }, 800);
      
      // In a real implementation, we would fetch from Supabase:
      /*
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .order('total_points', { ascending: false });
        
      if (teamError) throw teamError;
      
      const { data: userTeamData, error: userTeamError } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', userId);
        
      if (userTeamError) throw userTeamError;
      
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .order('start_date', { ascending: false });
        
      if (challengeError) throw challengeError;
      
      setTeams(teamData || []);
      setUserTeams(userTeamData || []);
      setChallenges(challengeData || []);
      */
    } catch (error) {
      console.error('Error loading team challenges data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load teams and challenges',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getMockTeams = (): Team[] => {
    return [
      {
        id: '1',
        name: 'Fitness Warriors',
        description: 'A team dedicated to consistent workout routines and maximum gains!',
        creator_id: 'user1',
        created_at: new Date().toISOString(),
        members_count: 8,
        total_points: 2450
      },
      {
        id: '2',
        name: 'Weight Crushers',
        description: 'Focus on strength training and healthy nutrition.',
        creator_id: 'user2',
        created_at: new Date().toISOString(),
        members_count: 5,
        total_points: 1820
      },
      {
        id: '3',
        name: 'Cardio Kings',
        description: 'Running, cycling, swimming - we do it all!',
        creator_id: 'user3',
        created_at: new Date().toISOString(),
        members_count: 12,
        total_points: 3150
      }
    ];
  };

  const getMockChallenges = (): Challenge[] => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);

    return [
      {
        id: '1',
        title: '30-Day Step Challenge',
        description: 'Reach 10,000 steps daily for 30 days straight',
        start_date: today.toISOString(),
        end_date: nextMonth.toISOString(),
        type: 'individual',
        status: 'active',
        goal_type: 'steps',
        goal_value: 300000,
        reward_points: 500,
        participants_count: 24
      },
      {
        id: '2',
        title: 'Team Weight Loss',
        description: 'Work together to lose a combined 50 pounds',
        start_date: lastWeek.toISOString(),
        end_date: nextMonth.toISOString(),
        type: 'team',
        status: 'active',
        goal_type: 'weight',
        goal_value: 50,
        reward_points: 1000,
        participants_count: 15
      },
      {
        id: '3',
        title: 'Workout Streak',
        description: 'Complete at least 15 workouts in 21 days',
        start_date: nextWeek.toISOString(),
        end_date: new Date(nextWeek.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'individual',
        status: 'upcoming',
        goal_type: 'workouts',
        goal_value: 15,
        reward_points: 300,
        participants_count: 8
      }
    ];
  };

  const getMockUserTeams = (userId: string): TeamMember[] => {
    return [
      {
        team_id: '1',
        user_id: userId,
        joined_at: new Date().toISOString(),
        role: 'member',
        contribution_points: 320
      }
    ];
  };

  const handleJoinTeam = (teamId: string) => {
    if (!userId) {
      toast({
        title: 'Login Required',
        description: 'Please log in to join a team',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Team Joined',
      description: 'You have successfully joined the team!',
    });
    
    // Optimistic update
    setUserTeams([...userTeams, {
      team_id: teamId,
      user_id: userId,
      joined_at: new Date().toISOString(),
      role: 'member',
      contribution_points: 0
    }]);
  };

  const handleJoinChallenge = (challengeId: string) => {
    if (!userId) {
      toast({
        title: 'Login Required',
        description: 'Please log in to join a challenge',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Challenge Joined',
      description: 'You have successfully joined the challenge!',
    });

    // In a real app, we would update the database
  };

  const isUserInTeam = (teamId: string) => {
    return userTeams.some(userTeam => userTeam.team_id === teamId);
  };

  // Get a consistent color for a team based on its ID
  const getTeamColor = (teamId: string) => {
    const colors = [
      'bg-quantum-cyan/20 text-quantum-cyan',
      'bg-quantum-purple/20 text-quantum-purple',
      'bg-emerald-500/20 text-emerald-500',
      'bg-amber-500/20 text-amber-500',
      'bg-blue-500/20 text-blue-500'
    ];
    
    const charSum = teamId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  const getChallengeStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500';
      case 'completed': return 'bg-blue-500/20 text-blue-500';
      case 'upcoming': return 'bg-amber-500/20 text-amber-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  if (loading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <p>Loading team challenges...</p>
        </CardContent>
      </Card>
    );
  }

  if (!userId) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-400">Sign in to view team challenges</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5 text-quantum-cyan" />
            Team Challenges
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === 'teams' ? "default" : "outline"} 
              size="sm"
              onClick={() => setActiveTab('teams')}
              className="text-xs h-7"
            >
              Teams
            </Button>
            <Button 
              variant={activeTab === 'challenges' ? "default" : "outline"} 
              size="sm"
              onClick={() => setActiveTab('challenges')}
              className="text-xs h-7"
            >
              Challenges
            </Button>
          </div>
        </div>
        <CardDescription>
          {activeTab === 'teams' 
            ? 'Join teams and compete together to earn points' 
            : 'Participate in challenges and win rewards'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {activeTab === 'teams' ? (
          <div className="space-y-4">
            {teams.map((team) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${getTeamColor(team.id)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-quantum-cyan">
                      <AvatarFallback className={getTeamColor(team.id)}>
                        {team.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                      {team.avatar_url && <AvatarImage src={team.avatar_url} alt={team.name} />}
                    </Avatar>
                    <div>
                      <h3 className="font-bold">{team.name}</h3>
                      <p className="text-xs text-gray-400">{team.description}</p>
                    </div>
                  </div>
                  <Badge className="bg-quantum-black/40">
                    {team.total_points} pts
                  </Badge>
                </div>
                
                <div className="mt-3 flex items-center text-sm text-gray-400">
                  <Users className="h-4 w-4 mr-1" /> {team.members_count} members
                </div>
                
                <div className="mt-3">
                  {isUserInTeam(team.id) ? (
                    <Badge variant="outline" className="border-quantum-cyan text-quantum-cyan">
                      Member
                    </Badge>
                  ) : (
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={() => handleJoinTeam(team.id)}
                      className="text-xs"
                    >
                      Join Team
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-quantum-black/40 border border-quantum-cyan/20"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-400" />
                      {challenge.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{challenge.description}</p>
                  </div>
                  <Badge className={getChallengeStatusColor(challenge.status)}>
                    {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center text-xs text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" /> 
                    {new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <Target className="h-3 w-3 mr-1" /> 
                    Goal: {challenge.goal_value} {challenge.goal_type}
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <Badge variant="outline" className="text-xs">
                    {challenge.type === 'individual' ? 'Individual' : 'Team'} Challenge
                  </Badge>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-quantum-cyan font-bold text-sm">+{challenge.reward_points} pts</span>
                    
                    {challenge.status !== 'completed' && (
                      <Button
                        size="sm"
                        onClick={() => handleJoinChallenge(challenge.id)}
                        className="text-xs h-7"
                      >
                        Join
                      </Button>
                    )}
                  </div>
                </div>
                
                {challenge.status === 'active' && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>0%</span>
                    </div>
                    <Progress value={0} className="h-1" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-gray-800 pt-4 flex justify-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => toast({
            title: 'Coming Soon',
            description: activeTab === 'teams' ? 'Create your own team in the next update!' : 'Create custom challenges in the next update!'
          })}
        >
          {activeTab === 'teams' ? 'Create Team' : 'Create Challenge'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TeamChallenges;
