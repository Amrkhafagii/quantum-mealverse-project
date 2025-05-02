
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Award, Gift } from 'lucide-react';
import { StreakReward, StreakRewardsProps } from '@/types/fitness';

const StreakRewards: React.FC<StreakRewardsProps> = ({ userId, currentStreak, longestStreak }) => {
  // Sample rewards based on streak length
  const rewards: StreakReward[] = [
    {
      id: '1',
      streak_days: 3,
      days: 3,
      streak_length: 3,
      reward_name: '3 Day Streak',
      title: '3 Day Streak',
      reward_description: 'Unlock custom workout themes',
      reward_type: 'feature',
      reward_value: 'themes',
      icon: 'palette',
      points: 10
    },
    {
      id: '2',
      streak_days: 7,
      days: 7,
      streak_length: 7,
      reward_name: '7 Day Streak',
      title: '7 Day Streak',
      reward_description: '10% off premium supplements',
      reward_type: 'discount',
      reward_value: '10',
      icon: 'tag',
      points: 25
    },
    {
      id: '3',
      streak_days: 14,
      days: 14,
      streak_length: 14,
      reward_name: '14 Day Streak',
      title: '14 Day Streak',
      reward_description: 'Silver Badge - Consistency Champion',
      reward_type: 'badge',
      reward_value: 'silver_badge',
      icon: 'award',
      points: 50
    },
    {
      id: '4',
      streak_days: 30,
      days: 30,
      streak_length: 30,
      reward_name: '30 Day Streak',
      title: '30 Day Streak',
      reward_description: 'Gold Badge + 20% off next purchase',
      reward_type: 'badge',
      reward_value: 'gold_badge',
      icon: 'trophy',
      points: 100
    }
  ];

  // Sort rewards by streak length
  const sortedRewards = [...rewards].sort((a, b) => a.streak_days - b.streak_days);

  // Current streak value (default to 0 if not provided)
  const streak = currentStreak || 0;

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-quantum-cyan" />
          Workout Streaks
        </CardTitle>
        <CardDescription>Stay consistent to earn rewards</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-6">
          <div>
            <div className="text-sm text-gray-400">Current Streak</div>
            <div className="text-2xl font-bold">{streak} days</div>
          </div>
          {longestStreak && longestStreak > 0 && (
            <div>
              <div className="text-sm text-gray-400">Longest</div>
              <div className="text-2xl font-bold">{longestStreak} days</div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {sortedRewards.map((reward) => {
            const isEarned = streak >= reward.streak_days;
            const isNext = !isEarned && sortedRewards.filter(r => streak >= r.streak_days).length + 1 === sortedRewards.indexOf(reward) + 1;
            
            return (
              <div 
                key={reward.id} 
                className={`p-3 rounded-lg border ${
                  isEarned 
                    ? 'bg-green-900/20 border-green-600/30' 
                    : isNext 
                      ? 'bg-quantum-black/40 border-quantum-cyan/30' 
                      : 'bg-quantum-black/20 border-quantum-gray/20'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {isEarned ? (
                      <Award className="h-5 w-5 text-green-400" />
                    ) : (
                      <Gift className={`h-5 w-5 ${isNext ? 'text-quantum-cyan' : 'text-gray-400'}`} />
                    )}
                    <div>
                      <div className="font-medium">
                        {reward.reward_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {reward.reward_description}
                      </div>
                    </div>
                  </div>
                  
                  {isEarned ? (
                    <Badge className="bg-green-600">Earned</Badge>
                  ) : (
                    <Badge variant="outline" className={isNext ? 'border-quantum-cyan text-quantum-cyan' : 'border-gray-500 text-gray-500'}>
                      {reward.streak_days - streak} days left
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakRewards;
