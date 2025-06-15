
import React, { useEffect, useState } from 'react';
import { Team, TeamMember } from '@/types/fitness';

interface TeamChallengesProps {
  userId?: string;
}

const TeamChallenges: React.FC<TeamChallengesProps> = ({ userId }) => {
  // This would typically come from an API or database
  const teams: Team[] = [
    {
      id: '1',
      name: 'Alpha Fitness',
      description: 'Pushing limits together!',
      members: [
        { id: '1', user_id: '1', team_id: '1', role: 'member', joined_at: '2024-01-01', name: 'Alice', points: 120 },
        { id: '2', user_id: '2', team_id: '1', role: 'member', joined_at: '2024-01-01', name: 'Bob', points: 95 },
        { id: '3', user_id: '3', team_id: '1', role: 'leader', joined_at: '2024-01-01', name: 'Charlie', points: 150 },
      ],
      created_at: '2024-01-01',
      member_count: 3,
      total_points: 365,
    },
    {
      id: '2',
      name: 'Elite Warriors',
      description: 'Conquer every challenge!',
      members: [
        { id: '4', user_id: '4', team_id: '2', role: 'member', joined_at: '2024-01-01', name: 'David', points: 110 },
        { id: '5', user_id: '5', team_id: '2', role: 'leader', joined_at: '2024-01-01', name: 'Eve', points: 130 },
        { id: '6', user_id: '6', team_id: '2', role: 'member', joined_at: '2024-01-01', name: 'Frank', points: 80 },
      ],
      created_at: '2024-01-01',
      member_count: 3,
      total_points: 320,
    },
  ];

  if (!userId) {
    return (
      <div className="bg-quantum-darkBlue/30 border border-quantum-cyan/20 rounded-lg p-6">
        <p className="text-center text-gray-400">Sign in to view team challenges</p>
      </div>
    );
  }

  return (
    <div className="bg-quantum-darkBlue/30 border border-quantum-cyan/20 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-quantum-cyan mb-4">Team Challenges</h2>
      {teams.map(team => (
        <div key={team.id} className="mb-6">
          <h3 className="text-xl font-semibold text-white">{team.name}</h3>
          <p className="text-gray-400 mb-2">{team.description}</p>
          <ul className="list-disc pl-5">
            {team.members.map(member => (
              <li key={member.id} className="text-gray-300">
                {member.name} - {member.points} points
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default TeamChallenges;
