import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Team, Challenge, TeamMember } from '@/types/fitness';
import { UsersRound, Trophy, Target, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface TeamChallengesProps {
  userId?: string;
}

const TeamChallenges: React.FC<TeamChallengesProps> = ({ userId }) => {
  const { user } = useAuth();
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [teammates, setTeammates] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teams' | 'challenges'>('teams');
  
  useEffect(() => {
    // In a real app, we would fetch from an API
    fetchTeamsAndChallenges();
  }, [userId]);
  
  const fetchTeamsAndChallenges = async () => {
    // Mock data for demonstration - in real app, fetch from backend
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Sample teams data
      const sampleTeams: Team[] = [
        {
          id: '1',
          name: 'Team Alpha',
          description: 'The best fitness team in the city!',
          creator_id: 'user123',
          created_by: 'JaneDoe', // Added for compatibility
          created_at: new Date().toISOString(),
          members_count: 8,
          member_count: 8,
          total_points: 2450,
          avatar_url: 'https://avatar.vercel.sh/team-alpha.png'
        },
        {
          id: '2',
          name: 'Workout Warriors',
          description: 'We crush every workout challenge!',
          creator_id: 'user456',
          created_by: 'JohnSmith', // Added for compatibility
          created_at: new Date().toISOString(),
          members_count: 12,
          member_count: 12,
          total_points: 3780,
          avatar_url: 'https://avatar.vercel.sh/workout-warriors.png'
        },
        {
          id: '3',
          name: 'Fitness Fanatics',
          description: 'Dedicated to health and fitness!',
          creator_id: 'user789',
          created_by: 'SamJones', // Added for compatibility
          created_at: new Date().toISOString(),
          members_count: 5,
          member_count: 5,
          total_points: 1560,
          avatar_url: 'https://avatar.vercel.sh/fitness-fanatics.png'
        }
      ];
      
      // Sample challenges data
      const sampleChallenges: Challenge[] = [
        {
          id: '1',
          title: '10K Steps Daily',
          description: 'Complete 10,000 steps every day for a week',
          type: 'steps',
          created_by: 'user123',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          target_value: 70000,
          goal_value: 70000, // Added for compatibility
          reward_points: 500,
          participants_count: 24,
          team_id: '1',
          is_active: true,
          goal_type: 'steps',
          status: 'active'
        },
        {
          id: '2',
          title: 'Weight Loss Challenge',
          description: 'Lose 2% of your body weight in 30 days',
          type: 'weight',
          created_by: 'user456',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          target_value: 2,
          goal_value: 2, // Added for compatibility
          reward_points: 1000,
          participants_count: 18,
          team_id: '2',
          is_active: true,
          goal_type: 'weight',
          status: 'active'
        },
        {
          id: '3',
          title: 'Workout Streak Challenge',
          description: 'Complete at least one workout every day for 14 days',
          type: 'streak',
          created_by: 'user789',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          target_value: 14,
          goal_value: 14, // Added for compatibility
          reward_points: 750,
          participants_count: 32,
          team_id: '3',
          is_active: true,
          goal_type: 'streak',
          status: 'active'
        }
      ];
      
      // Sample teammates data
      const sampleTeammates: TeamMember[] = [
        {
          id: '1',
          team_id: '1',
          user_id: 'user123',
          role: 'admin',
          joined_date: new Date().toISOString(),
          joined_at: new Date().toISOString(), // Added for compatibility
          user_name: 'Jane Doe',
          profile_image: 'https://avatar.vercel.sh/jane.png',
          points_contributed: 850,
          contribution_points: 850 // Added for compatibility
        },
        {
          id: '2',
          team_id: '1',
          user_id: 'user456',
          role: 'member',
          joined_date: new Date().toISOString(),
          joined_at: new Date().toISOString(), // Added for compatibility
          user_name: 'John Smith',
          profile_image: 'https://avatar.vercel.sh/john.png',
          points_contributed: 630,
          contribution_points: 630 // Added for compatibility
        },
        {
          id: '3',
          team_id: '1',
          user_id: 'user789',
          role: 'member',
          joined_date: new Date().toISOString(),
          joined_at: new Date().toISOString(), // Added for compatibility
          user_name: 'Sam Jones',
          profile_image: 'https://avatar.vercel.sh/sam.png',
          points_contributed: 410,
          contribution_points: 410 // Added for compatibility
        }
      ];
      
      setUserTeams(sampleTeams);
      setChallenges(sampleChallenges);
      setTeammates(sampleTeammates);
      setLoading(false);
    }, 800);
  };
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-quantum-cyan">Team Challenges</CardTitle>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant={activeTab === 'teams' ? 'default' : 'outline'}
              onClick={() => setActiveTab('teams')}
              className={activeTab === 'teams' ? 'bg-quantum-purple' : ''}
            >
              Teams
            </Button>
            <Button 
              size="sm" 
              variant={activeTab === 'challenges' ? 'default' : 'outline'}
              onClick={() => setActiveTab('challenges')}
              className={activeTab === 'challenges' ? 'bg-quantum-purple' : ''}
            >
              Challenges
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-4 text-center">Loading...</div>
        ) : activeTab === 'teams' ? (
          <div className="space-y-4">
            {userTeams.length === 0 ? (
              <div className="text-center py-8">
                <UsersRound className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Teams Yet</h3>
                <p className="text-sm text-gray-400 mb-4">Join a team or create your own to participate in challenges</p>
                <Button>Find Teams</Button>
              </div>
            ) : (
              <>
                {userTeams.map(team => (
                  <div key={team.id} className="border border-quantum-cyan/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 mr-3">
                          <AvatarImage src={team.avatar_url} alt={team.name} />
                          <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{team.name}</h3>
                          <div className="flex items-center text-xs text-gray-400">
                            <UsersRound className="h-3 w-3 mr-1" />
                            <span>{team.member_count} members</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{team.total_points} pts</div>
                        <Badge variant="outline" className="text-xs">
                          {team.id === '1' ? 'Admin' : 'Member'}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        View Team
                      </Button>
                      <Button variant="outline" size="sm">
                        Team Chat
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Challenges</h3>
                <p className="text-sm text-gray-400 mb-4">Join a team to participate in challenges</p>
                <Button>Browse Challenges</Button>
              </div>
            ) : (
              <>
                {challenges.map(challenge => (
                  <Card key={challenge.id} className="bg-quantum-black/30 border-quantum-purple/20">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium">{challenge.title}</h3>
                          <p className="text-sm text-gray-400">{challenge.description}</p>
                        </div>
                        <Badge className="bg-quantum-purple">
                          {challenge.participants_count} participants
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm mb-3">
                        <div className="flex items-center text-gray-400">
                          <Target className="h-4 w-4 mr-1" />
                          <span>Goal: {challenge.target_value} {challenge.type}</span>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            {new Date(challenge.end_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>45%</span> {/* This would be dynamic in a real app */}
                        </div>
                        <Progress value={45} className="h-2" /> {/* This would be dynamic */}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm">
                          <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                          <span>{challenge.reward_points} points</span>
                        </div>
                        <Button variant="link" className="text-quantum-cyan p-0 h-auto" size="sm">
                          View Details <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamChallenges;
