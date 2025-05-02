
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
      
      // In a real implementation, we would fetch from Supabase
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
        created_by: 'user1',
        creator_id: 'user1', // Added for compatibility
        created_at: new Date().toISOString(),
        member_count: 8,
        members_count: 8, // Added for compatibility
        total_points: 2450
      },
      {
        id: '2',
        name: 'Weight Crushers',
        description: 'Focus on strength training and healthy nutrition.',
        created_by: 'user2',
        creator_id: 'user2', // Added for compatibility
        created_at: new Date().toISOString(),
        member_count: 5,
        members_count: 5, // Added for compatibility
        total_points: 1820
      },
      {
        id: '3',
        name: 'Cardio Kings',
        description: 'Running, cycling, swimming - we do it all!',
        created_by: 'user3',
        creator_id: 'user3', // Added for compatibility
        created_at: new Date().toISOString(),
        member_count: 12,
        members_count: 12, // Added for compatibility
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
        type: 'steps', // Modified to match Challenge type
        target_value: 300000,
        created_by: 'admin',
        participants_count: 24,
        is_active: true,
        // Compatibility properties
        status: 'active',
        goal_type: 'steps',
        goal_value: 300000,
        reward_points: 500
      },
      {
        id: '2',
        title: 'Team Weight Loss',
        description: 'Work together to lose a combined 50 pounds',
        start_date: lastWeek.toISOString(),
        end_date: nextMonth.toISOString(),
        type: 'weight', // Modified to match Challenge type
        target_value: 50,
        created_by: 'admin',
        participants_count: 15,
        is_active: true,
        team_id: '1',
        // Compatibility properties
        status: 'active',
        goal_type: 'weight',
        goal_value: 50,
        reward_points: 1000
      },
      {
        id: '3',
        title: 'Workout Streak',
        description: 'Complete at least 15 workouts in 21 days',
        start_date: nextWeek.toISOString(),
        end_date: new Date(nextWeek.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'workouts', // Modified to match Challenge type
        target_value: 15,
        created_by: 'admin',
        participants_count: 8,
        is_active: true,
        // Compatibility properties
        status: 'upcoming',
        goal_type: 'workouts',
        goal_value: 15,
        reward_points: 300
      }
    ];
  };

  const getMockUserTeams = (userId: string): TeamMember[] => {
    return [
      {
        id: 'member1',
        team_id: '1',
        user_id: userId,
        joined_date: new Date().toISOString(),
        joined_at: new Date().toISOString(), // Added for compatibility
        role: 'member',
        points_contributed: 320,
        contribution_points: 320 // Added for compatibility
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
    const newTeamMember: TeamMember = {
      id: `member-${Date.now()}`,
      team_id: teamId,
      user_id: userId,
      joined_date: new Date().toISOString(),
      joined_at: new Date().toISOString(),
      role: 'member',
      points_contributed: 0,
      contribution_points: 0
    };
    
    setUserTeams([...userTeams, newTeamMember]);
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
      </CardHeader>
      <CardContent>
        {/* Teams tab content */}
        {activeTab === 'teams' && (
          <div className="space-y-4">
            {teams.length > 0 ? (
              teams.map((team) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-lg border bg-black/20 border-quantum-purple/20 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={team.avatar_url} />
                        <AvatarFallback className={getTeamColor(team.id)}>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-quantum-purple">{team.name}</h3>
                        <p className="text-sm text-gray-400">{team.description}</p>
                      </div>
                    </div>
                    <Badge className={getChallengeStatusColor('active')}>
                      {team.member_count} members
                    </Badge>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-gray-400">Points: </span>
                      <span className="font-semibold text-quantum-purple">{team.total_points}</span>
                    </div>
                    
                    {isUserInTeam(team.id) ? (
                      <Badge variant="secondary">Already a Member</Badge>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => handleJoinTeam(team.id)}
                        className="bg-quantum-purple hover:bg-quantum-purple/80"
                      >
                        Join Team
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-6">No teams available at the moment.</p>
            )}
          </div>
        )}
        
        {/* Challenges tab content */}
        {activeTab === 'challenges' && (
          <div className="space-y-4">
            {challenges.length > 0 ? (
              challenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-lg border bg-black/20 border-quantum-cyan/20 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getChallengeStatusColor(challenge.status || 'active')}`}>
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-quantum-cyan">{challenge.title}</h3>
                        <p className="text-sm text-gray-400">{challenge.description}</p>
                      </div>
                    </div>
                    <Badge className={getTeamColor(challenge.id)}>
                      {challenge.type}
                    </Badge>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>0 / {challenge.target_value} {challenge.goal_type}</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-400">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {isUserInTeam(challenge.team_id || '') ? (
                      <Button 
                        size="sm"
                        onClick={() => handleJoinChallenge(challenge.id)}
                        className="bg-quantum-cyan hover:bg-quantum-cyan/80"
                      >
                        Join Challenge
                      </Button>
                    ) : (
                      challenge.team_id ? (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                          Team Required
                        </Badge>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => handleJoinChallenge(challenge.id)}
                          className="bg-quantum-cyan hover:bg-quantum-cyan/80"
                        >
                          Join Challenge
                        </Button>
                      )
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-6">No challenges available at the moment.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamChallenges;
