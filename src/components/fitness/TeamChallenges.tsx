
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Calendar, Target } from 'lucide-react';
import { Team, Challenge, TeamMember } from '@/types/fitness';
import { getChallenges, getUserChallenges, joinChallenge } from '@/services/gamificationService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const TeamChallenges: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [challengesResult, userChallengesResult] = await Promise.all([
        getChallenges(),
        user?.id ? getUserChallenges(user.id) : { data: null }
      ]);
      
      if (challengesResult.data) {
        setChallenges(challengesResult.data);
      }
      
      if (userChallengesResult.data) {
        setUserChallenges(userChallengesResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockTeams: Team[] = [
    {
      id: 'team-1',
      name: 'Fitness Warriors',
      description: 'A team dedicated to strength training and muscle building',
      created_by: 'user-1',
      created_at: new Date().toISOString(),
      is_active: true,
      member_count: 15,
      total_points: 2500
    },
    {
      id: 'team-2',
      name: 'Cardio Kings',
      description: 'Running, cycling, and endurance challenges',
      created_by: 'user-2',
      created_at: new Date().toISOString(),
      is_active: true,
      member_count: 12,
      total_points: 1800
    },
    {
      id: 'team-3',
      name: 'Yoga Zen',
      description: 'Mindful movement and flexibility focused team',
      created_by: 'user-3',
      created_at: new Date().toISOString(),
      is_active: true,
      member_count: 8,
      total_points: 1200
    }
  ];

  const mockChallenges: Challenge[] = [
    {
      id: 'challenge-1',
      title: '30-Day Plank Challenge',
      description: 'Build core strength with daily plank exercises',
      type: 'endurance',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      target_value: 30,
      created_by: 'admin',
      is_active: true,
      participants_count: 45,
      reward_points: 500
    },
    {
      id: 'challenge-2',
      title: 'Weekly Steps Challenge',
      description: 'Reach 10,000 steps daily for one week',
      type: 'cardio',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      target_value: 70000,
      created_by: 'admin',
      is_active: true,
      participants_count: 32,
      reward_points: 300
    },
    {
      id: 'challenge-3',
      title: 'Strength Training Streak',
      description: 'Complete strength workouts for 14 consecutive days',
      type: 'strength',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      target_value: 14,
      created_by: 'admin',
      is_active: true,
      participants_count: 28,
      reward_points: 750
    }
  ];

  const mockTeamMembers: TeamMember[] = [
    {
      id: 'member-1',
      team_id: 'team-1',
      user_id: user?.id || 'user-1',
      role: 'member',
      joined_date: new Date().toISOString(),
      is_active: true
    },
    {
      id: 'member-2',
      team_id: 'team-2',
      user_id: 'user-2',
      role: 'admin',
      joined_date: new Date().toISOString(),
      is_active: true
    },
    {
      id: 'member-3',
      team_id: 'team-3',
      user_id: 'user-3',
      role: 'owner',
      joined_date: new Date().toISOString(),
      is_active: true
    }
  ];

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please log in to join challenges",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await joinChallenge(user.id, challengeId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Successfully joined the challenge!",
        });
        fetchData();
      } else {
        throw new Error('Failed to join challenge');
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Error",
        description: "Failed to join challenge",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">Loading challenges...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayTeams = teams.length > 0 ? teams : mockTeams;
  const displayChallenges = challenges.length > 0 ? challenges : mockChallenges;

  return (
    <div className="space-y-6">
      {/* Teams Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Fitness Teams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayTeams.map((team) => (
              <div key={team.id} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{team.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{team.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span>{team.member_count} members</span>
                  <Badge variant="secondary">{team.total_points} pts</Badge>
                </div>
                <Button className="w-full mt-3" variant="outline">
                  Join Team
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Active Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayChallenges.map((challenge) => (
              <div key={challenge.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{challenge.title}</h3>
                  <Badge variant="outline">{challenge.type}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>Target: {challenge.target_value}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{challenge.participants_count} participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Ends: {new Date(challenge.end_date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {challenge.reward_points} points
                  </Badge>
                  <Button 
                    size="sm"
                    onClick={() => handleJoinChallenge(challenge.id)}
                  >
                    Join Challenge
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamChallenges;
