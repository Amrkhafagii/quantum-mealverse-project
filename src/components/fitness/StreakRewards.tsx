import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Gift, Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserStreak, StreakReward } from '@/types/fitness';
import { toast } from 'sonner';

interface StreakRewardsProps {
  userId?: string;
  userStreak?: UserStreak | null;
}

const StreakRewards: React.FC<StreakRewardsProps> = ({ userId, userStreak }) => {
  const [rewards, setRewards] = useState<StreakReward[]>([]);
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);

  useEffect(() => {
    // Load rewards from a data source (e.g., database)
    const loadedRewards = getRewards();
    setRewards(loadedRewards);
  }, []);

  const handleClaimReward = (reward: StreakReward) => {
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to claim rewards',
        variant: 'destructive'
      });
      return;
    }

    // Check if user has already claimed this reward
    if (claimedRewards.includes(reward.id)) {
      toast({
        title: 'Already Claimed',
        description: 'You have already claimed this reward',
      });
      return;
    }

    // Check if user meets the streak requirement
    if (!userStreak || userStreak.currentstreak < reward.streak_length) {
      toast({
        title: 'Streak Too Short',
        description: `You need a streak of ${reward.streak_length} days to claim this reward`,
        variant: 'destructive'
      });
      return;
    }

    // Claim the reward (in a real app, this would update the database)
    setClaimedRewards([...claimedRewards, reward.id]);

    // Show a success message
    toast({
      title: 'Reward Claimed',
      description: `You have claimed ${reward.reward_description}`,
    });
  };

  const getRewards = (): StreakReward[] => {
    // Basic rewards structure - in a real app, this would come from the database
    return [
      {
        id: '1',
        streak_length: 3,
        reward_description: '50 fitness points',
        reward_type: 'points',
        reward_value: 50,
        icon: 'star'
      },
      {
        id: '2',
        streak_length: 7,
        reward_description: 'Bronze Achiever Badge',
        reward_type: 'badge',
        reward_value: 'bronze_badge',
        icon: 'trophy'
      },
      {
        id: '3',
        streak_length: 14,
        reward_description: '10% off next supplement order',
        reward_type: 'discount',
        reward_value: '10',
        icon: 'gift'
      },
    ];
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-quantum-cyan">
          Streak Rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {userStreak ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Current Streak:</span>
              <span className="font-bold text-quantum-cyan">{userStreak.currentstreak} days</span>
            </div>
            <Progress value={(userStreak.currentstreak / 30) * 100} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  className={`p-4 rounded-md bg-quantum-black/40 border border-gray-700 hover:border-quantum-purple/50 transition-colors cursor-pointer ${claimedRewards.includes(reward.id) ? 'opacity-50 pointer-events-none' : ''}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleClaimReward(reward)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{reward.reward_description}</h4>
                      <p className="text-xs text-gray-400">
                        Streak: {reward.streak_length} days
                      </p>
                    </div>
                    <div>
                      {reward.icon === 'star' && <Star className="h-5 w-5 text-yellow-400" />}
                      {reward.icon === 'trophy' && <Trophy className="h-5 w-5 text-yellow-400" />}
                      {reward.icon === 'gift' && <Gift className="h-5 w-5 text-yellow-400" />}
                      {claimedRewards.includes(reward.id) && <Check className="h-5 w-5 text-green-500" />}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center p-6 text-gray-400">
            <p>No streak data available. Start working out to earn rewards!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StreakRewards;
