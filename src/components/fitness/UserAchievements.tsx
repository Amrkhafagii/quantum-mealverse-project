import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Achievement, UserAchievement } from '@/types/fitness';
import { Award, Medal, Trophy, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserAchievementsProps {
  userId?: string;
}

const UserAchievements = ({ userId }: UserAchievementsProps) => {
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadAchievements();
    }
  }, [userId]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      // Load all achievements (public data)
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*');
        
      if (achievementsError) throw achievementsError;
      
      // Load user achievements
      const { data: userAchievementsData, error: userError } = await supabase
        .from('user_achievements')
        .select(`
          id, 
          user_id, 
          achievement_id, 
          date_achieved,
          achievement:achievement_id (*)
        `)
        .eq('user_id', userId);
        
      if (userError) throw userError;
      
      setAchievements(achievementsData as Achievement[] || []);
      setUserAchievements(userAchievementsData as UserAchievement[] || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load achievements.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isAchieved = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getAchievementDate = (achievementId: string) => {
    const userAchievement = userAchievements.find(ua => ua.achievement_id === achievementId);
    return userAchievement ? userAchievement.date_achieved : null;
  };

  const getAchievementIcon = (points: number) => {
    if (points >= 50) {
      return <Trophy className="h-8 w-8 text-yellow-400" />;
    } else if (points >= 25) {
      return <Medal className="h-8 w-8 text-slate-300" />;
    } else {
      return <Award className="h-8 w-8 text-amber-600" />;
    }
  };

  const calculateProgress = () => {
    if (achievements.length === 0) return 0;
    return Math.round((userAchievements.length / achievements.length) * 100);
  };

  const totalPoints = () => {
    return userAchievements.reduce((sum, ua) => {
      const achievement = achievements.find(a => a.id === ua.achievement_id);
      return sum + (achievement ? achievement.points : 0);
    }, 0);
  };

  if (loading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <p>Loading achievements...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="holographic-card">
        <CardHeader>
          <CardTitle>Achievement Progress</CardTitle>
          <CardDescription>
            Track your achievements and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-quantum-darkBlue/30 p-4 rounded-lg text-center">
              <div className="text-4xl font-bold text-quantum-cyan mb-1">{userAchievements.length}</div>
              <div className="text-sm text-gray-400">Achievements Earned</div>
            </div>
            <div className="bg-quantum-darkBlue/30 p-4 rounded-lg text-center">
              <div className="text-4xl font-bold text-quantum-purple mb-1">{calculateProgress()}%</div>
              <div className="text-sm text-gray-400">Progress</div>
            </div>
            <div className="bg-quantum-darkBlue/30 p-4 rounded-lg text-center">
              <div className="text-4xl font-bold text-quantum-cyan mb-1">{totalPoints()}</div>
              <div className="text-sm text-gray-400">Total Points</div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-2.5 mb-8">
            <div 
              className="bg-gradient-to-r from-quantum-cyan to-quantum-purple h-2.5 rounded-full" 
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>

          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`border ${isAchieved(achievement.id) ? 'border-quantum-cyan' : 'border-quantum-darkBlue/50 opacity-70'}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <div>
                          {getAchievementIcon(achievement.points)}
                        </div>
                        <span>{achievement.name}</span>
                      </CardTitle>
                      <Badge variant={isAchieved(achievement.id) ? "default" : "outline"}>
                        {achievement.points} pts
                      </Badge>
                    </div>
                    <CardDescription>{achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 mb-2">
                      <span className="font-semibold">How to earn:</span> {achievement.criteria}
                    </p>
                    {isAchieved(achievement.id) && getAchievementDate(achievement.id) && (
                      <div className="flex items-center gap-2 text-xs text-quantum-cyan">
                        <Clock className="h-3 w-3" />
                        <span>Earned {formatDistanceToNow(new Date(getAchievementDate(achievement.id)!), { addSuffix: true })}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardContent className="pt-6 text-center">
                <p>No achievements available yet. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAchievements;
