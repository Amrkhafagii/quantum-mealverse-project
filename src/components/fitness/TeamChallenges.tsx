
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// FIX: Import from achievements submodule
import { Team, TeamMember } from '@/types/fitness/achievements';
import { useAuth } from '@/hooks/useAuth';

const TeamChallenges: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);

  useEffect(() => {
    // Mock data loading or API calls can be placed here
    // For now, using mock data directly
  }, []);

  const mockTeams: Team[] = [
    {
      id: '1',
      name: 'Morning Warriors',
      description: 'Early morning workout enthusiasts',
      members: [],
      created_at: new Date().toISOString(),
      member_count: 12,
      total_points: 2450
    },
    {
      id: '2',
      name: 'Strength Squad',
      description: 'Focused on building strength and muscle',
      members: [],
      created_at: new Date().toISOString(),
      member_count: 8,
      total_points: 1890
    },
    {
      id: '3',
      name: 'Cardio Crushers',
      description: 'Cardiovascular fitness champions',
      members: [],
      created_at: new Date().toISOString(),
      member_count: 15,
      total_points: 3200
    }
  ];

  const mockChallenges = [
    {
      id: '1',
      title: '7-Day Workout Streak',
      description: 'Complete a workout every day for 7 days',
      type: 'workout',
      target_value: 7,
      start_date: new Date().toISOString(),
      end_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      created_by: 'admin',
      team_id: '1',
      participants_count: 10,
      goal_value: 7,
      reward_points: 150,
      prize_description: 'Bragging rights',
      rules: 'No skipping days!'
    },
    {
      id: '2',
      title: '10,000 Steps Challenge',
      description: 'Reach 10,000 steps every day for 30 days',
      type: 'activity',
      target_value: 10000,
      start_date: new Date().toISOString(),
      end_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
      created_by: 'admin',
      team_id: '2',
      participants_count: 5,
      goal_value: 300000,
      reward_points: 200,
      prize_description: 'A virtual high-five',
      rules: 'Steps must be tracked via a verified device'
    }
  ];

  const mockMembers: TeamMember[] = [
    {
      id: '1',
      user_id: user?.id || 'user1',
      team_id: '1',
      role: 'leader',
      joined_at: new Date().toISOString()
    },
    {
      id: '2',
      user_id: 'user2',
      team_id: '1',
      role: 'member',
      joined_at: new Date().toISOString()
    },
    {
      id: '3',
      user_id: 'user3',
      team_id: '1',
      role: 'member',
      joined_at: new Date().toISOString()
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-quantum-black/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="text-quantum-cyan">Active Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockChallenges.map((challenge) => (
              <div key={challenge.id} className="p-4 border border-quantum-cyan/20 rounded-lg">
                <h3 className="font-semibold text-white mb-2">{challenge.title}</h3>
                <p className="text-sm text-gray-300 mb-2">{challenge.description}</p>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Start Date: {new Date(challenge.start_date).toLocaleDateString()}</span>
                  <span>End Date: {new Date(challenge.end_date).toLocaleDateString()}</span>
                </div>
                <Button className="w-full mt-3 bg-quantum-purple hover:bg-quantum-purple/90">
                  Join Challenge
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-quantum-black/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="text-quantum-cyan">Available Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockTeams.map((team) => (
              <div key={team.id} className="p-4 border border-quantum-cyan/20 rounded-lg">
                <h3 className="font-semibold text-white mb-2">{team.name}</h3>
                <p className="text-sm text-gray-300 mb-2">{team.description}</p>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Members: {team.member_count}</span>
                  <span>Points: {team.total_points}</span>
                </div>
                <Button className="w-full mt-3 bg-quantum-purple hover:bg-quantum-purple/90">
                  Join Team
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamChallenges;
