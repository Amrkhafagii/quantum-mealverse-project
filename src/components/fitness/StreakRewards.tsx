
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Gift, Flame, Trophy, Award } from 'lucide-react';
import { UserStreak, StreakReward } from '@/types/fitness';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface StreakRewardsProps {
  userId?: string;
  currentStreak?: number;
  longestStreak?: number;
}

const StreakRewards: React.FC<StreakRewardsProps> = ({
  userId,
  currentStreak = 0,
  longestStreak = 0
}) => {
  const { toast } = useToast();
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [rewards, setRewards] = useState<StreakReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRewardAnimation, setShowRewardAnimation] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadStreakData();
    } else {
      setLoading(false);
    }
  }, [userId, currentStreak, longestStreak]);

  const loadStreakData = async () => {
    setLoading(true);
    try {
      // If we have current and longest streak provided as props, use those
      if (currentStreak > 0 || longestStreak > 0) {
        setStreak({
          id: 'mock-id',
          user_id: userId || '',
          currentstreak: currentStreak,
          longeststreak: longestStreak,
          last_activity_date: new Date().toISOString(),
          streak_type: 'workout'
        });
      } else {
        // In a real app, we would fetch from the database:
        /*
        const { data, error } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', userId)
          .eq('streak_type', 'workout')
          .maybeSingle();
          
        if (error) throw error;
        setStreak(data);
        */
        
        // Mock data for development
        setStreak({
          id: 'mock-id',
          user_id: userId || '',
          currentstreak: 5,
          longeststreak: 12,
          last_activity_date: new Date().toISOString(),
          streak_type: 'workout'
        });
      }
      
      // Generate streak rewards
      setRewards(generateStreakRewards());
    } catch (error) {
      console.error('Error loading streak data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load streak information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateStreakRewards = (): StreakReward[] => {
    return [
      { days: 3, points: 15, description: 'Three-day streak', claimed: true },
      { days: 7, points: 50, description: 'One week consistency', claimed: false },
      { days: 14, points: 100, description: 'Two week dedication', claimed: false },
      { days: 30, points: 200, description: 'One month commitment', claimed: false },
      { days: 60, points: 350, description: 'Two month mastery', claimed: false },
      { days: 90, points: 500, description: 'Three month transformation', claimed: false },
    ];
  };

  const handleClaimReward = (reward: StreakReward) => {
    // Trigger confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    setShowRewardAnimation(reward.description);
    
    // Update the state
    setRewards(prevRewards => {
      return prevRewards.map(r => {
        if (r.days === reward.days) {
          return { ...r, claimed: true };
        }
        return r;
      });
    });
    
    // Show toast
    toast({
      title: 'Reward Claimed!',
      description: `You earned ${reward.points} points for ${reward.description}!`,
    });
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setShowRewardAnimation(null);
    }, 2000);
    
    // In a real app, we would update the database and user points
  };

  const getNextReward = () => {
    if (!streak) return null;
    return rewards.find(r => r.days > streak.currentstreak && !r.claimed);
  };

  const getProgressToNextReward = () => {
    const nextReward = getNextReward();
    if (!streak || !nextReward) return 0;
    
    return Math.min(100, Math.round((streak.currentstreak / nextReward.days) * 100));
  };

  const isClaimable = (reward: StreakReward) => {
    return streak && streak.currentstreak >= reward.days && !reward.claimed;
  };

  if (loading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <p>Loading streak information...</p>
        </CardContent>
      </Card>
    );
  }

  if (!userId || !streak) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-400">Sign in and start working out to build your streak!</p>
        </CardContent>
      </Card>
    );
  }

  const nextReward = getNextReward();

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-400" />
          Workout Streak
        </CardTitle>
        <CardDescription>
          Stay consistent to earn bonus rewards
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center">
              <Flame className="h-6 w-6 text-orange-400 mr-2" />
              <span className="text-2xl font-bold">{streak.currentstreak} days</span>
            </div>
            <p className="text-xs text-gray-400">Current streak</p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center justify-end">
              <Trophy className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-lg font-bold">{streak.longeststreak} days</span>
            </div>
            <p className="text-xs text-gray-400">Longest streak</p>
          </div>
        </div>
        
        {nextReward && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1 text-sm">
              <span>Next reward in {nextReward.days - streak.currentstreak} days</span>
              <span>{streak.currentstreak}/{nextReward.days}</span>
            </div>
            <Progress value={getProgressToNextReward()} className="h-2" />
            <p className="text-xs text-gray-400 mt-1">
              {nextReward.description} (+{nextReward.points} points)
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium mb-2">Streak Rewards:</h4>
          
          <AnimatePresence>
            {rewards.map((reward) => (
              <motion.div
                key={reward.days}
                className={`p-2 rounded-md flex justify-between items-center ${
                  isClaimable(reward) 
                    ? 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30' 
                    : reward.claimed 
                    ? 'bg-quantum-black/20 border border-quantum-cyan/20' 
                    : 'bg-quantum-black/40 border border-gray-700'
                }`}
                animate={{
                  scale: showRewardAnimation === reward.description ? [1, 1.05, 1] : 1,
                  y: showRewardAnimation === reward.description ? [0, -5, 0] : 0
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`rounded-full p-1 ${
                    reward.claimed ? 'bg-quantum-cyan/20 text-quantum-cyan' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {reward.claimed ? (
                      <Award className="h-4 w-4" />
                    ) : (
                      <Calendar className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm ${reward.claimed || isClaimable(reward) ? 'text-white' : 'text-gray-400'}`}>
                      {reward.days} day streak
                    </p>
                    <p className="text-xs text-gray-400">{reward.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={reward.claimed || isClaimable(reward) ? 'bg-yellow-600/80' : 'bg-gray-700'}>
                    +{reward.points}
                  </Badge>
                  
                  {isClaimable(reward) && (
                    <Button 
                      size="sm" 
                      className="h-7 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                      onClick={() => handleClaimReward(reward)}
                    >
                      <Gift className="h-3 w-3 mr-1" /> Claim
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="mt-4 p-3 bg-cyan-950/30 border border-cyan-900/50 rounded-md">
          <p className="text-sm text-cyan-300">
            <span className="font-semibold">Tip:</span> Log your workouts daily to build your streak. Missing a day resets your streak to zero!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakRewards;
