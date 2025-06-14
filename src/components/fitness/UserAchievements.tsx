import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Achievement, UserAchievement } from '@/types/fitness/achievements';
import { Award, Medal, Trophy, Clock, Target, Flame, Star, Calendar, Sunrise, Moon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useForm, SubmitHandler } from 'react-hook-form';

interface UserAchievementsProps {
  userId?: string;
}

interface AchievementProgress {
  id: string;
  achievement_id: string;
  current_progress: number;
  target_progress: number;
  completed: boolean;
  achievement: Achievement;
}

type AchievementFormValues = {
  achievementId: string;
  evidence?: string;
};

const defaultValues: AchievementFormValues = { achievementId: '', evidence: '' };

const UserAchievements = (props: any) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const currentUserId = props.userId || user?.id;

  useEffect(() => {
    setLoading(true);
    if (currentUserId) {
      loadAchievements();
    }
  }, [currentUserId]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      
      // Load all achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: true });
        
      if (achievementsError) throw achievementsError;
      
      // Load user achievements (completed ones)
      const { data: userAchievementsData, error: userError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', currentUserId);
        
      if (userError) throw userError;

      // Load achievement progress
      const { data: progressData, error: progressError } = await supabase
        .from('achievement_progress')
        .select(`
          *,
          achievement:achievement_id (*)
        `)
        .eq('user_id', currentUserId);

      if (progressError) throw progressError;
      
      setAchievements(achievementsData as Achievement[] || []);
      setUserAchievements(userAchievementsData as UserAchievement[] || []);
      setAchievementProgress(progressData as AchievementProgress[] || []);
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

  const getProgress = (achievementId: string) => {
    return achievementProgress.find(ap => ap.achievement_id === achievementId);
  };

  const getAchievementIcon = (iconName: string, points: number) => {
    const iconClass = `h-8 w-8 ${getIconColor(points)}`;
    
    switch (iconName) {
      case 'trophy':
        return <Trophy className={iconClass} />;
      case 'medal':
        return <Medal className={iconClass} />;
      case 'award':
        return <Award className={iconClass} />;
      case 'target':
        return <Target className={iconClass} />;
      case 'flame':
        return <Flame className={iconClass} />;
      case 'star':
        return <Star className={iconClass} />;
      case 'calendar':
        return <Calendar className={iconClass} />;
      case 'clock':
        return <Clock className={iconClass} />;
      case 'sunrise':
        return <Sunrise className={iconClass} />;
      case 'moon':
        return <Moon className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  const getIconColor = (points: number) => {
    if (points >= 75) return 'text-yellow-400';
    if (points >= 50) return 'text-purple-400';
    if (points >= 25) return 'text-blue-400';
    return 'text-green-400';
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
          <p className="text-gray-400">Loading achievements...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="text-quantum-cyan">Achievement Progress</CardTitle>
          <CardDescription className="text-gray-400">
            Track your achievements and earn rewards for your fitness journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-quantum-black/30 p-4 rounded-lg text-center border border-quantum-cyan/20">
              <div className="text-4xl font-bold text-quantum-cyan mb-1">{userAchievements.length}</div>
              <div className="text-sm text-gray-400">Achievements Earned</div>
            </div>
            <div className="bg-quantum-black/30 p-4 rounded-lg text-center border border-quantum-purple/20">
              <div className="text-4xl font-bold text-quantum-purple mb-1">{calculateProgress()}%</div>
              <div className="text-sm text-gray-400">Progress</div>
            </div>
            <div className="bg-quantum-black/30 p-4 rounded-lg text-center border border-quantum-cyan/20">
              <div className="text-4xl font-bold text-quantum-cyan mb-1">{totalPoints()}</div>
              <div className="text-sm text-gray-400">Total Points</div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 mb-8">
            <div 
              className="bg-gradient-to-r from-quantum-cyan to-quantum-purple h-3 rounded-full transition-all duration-500" 
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>

          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => {
                const achieved = isAchieved(achievement.id);
                const progress = getProgress(achievement.id);
                const progressPercentage = progress ? Math.round((progress.current_progress / progress.target_progress) * 100) : 0;
                
                return (
                  <Card 
                    key={achievement.id} 
                    className={`border transition-all duration-200 ${
                      achieved 
                        ? 'border-quantum-cyan bg-quantum-cyan/5' 
                        : 'border-quantum-darkBlue/50 bg-quantum-darkBlue/20 opacity-80'
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {getAchievementIcon(achievement.icon, achievement.points)}
                          <div>
                            <CardTitle className={`text-lg ${achieved ? 'text-quantum-cyan' : 'text-white'}`}>
                              {achievement.name}
                            </CardTitle>
                            <Badge 
                              variant={achieved ? "default" : "outline"}
                              className={achieved ? "bg-quantum-cyan text-black" : "border-gray-500 text-gray-400"}
                            >
                              {achievement.points} pts
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-gray-400">{achievement.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-400 mb-3">
                        <span className="font-semibold">How to earn:</span> {achievement.criteria}
                      </p>
                      
                      {progress && !achieved && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-white">
                              {progress.current_progress}/{progress.target_progress}
                            </span>
                          </div>
                          <Progress 
                            value={progressPercentage} 
                            className="h-2 bg-gray-700"
                          />
                        </div>
                      )}
                      
                      {achieved && getAchievementDate(achievement.id) && (
                        <div className="flex items-center gap-2 text-xs text-quantum-cyan mt-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            Earned {formatDistanceToNow(new Date(getAchievementDate(achievement.id)!), { addSuffix: true })}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardContent className="pt-6 text-center">
                <p className="text-gray-400">No achievements available yet. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAchievements;
