
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target, Dumbbell, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AchievementService } from '@/services/fitness/achievementService';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { EnhancedResponsiveGrid } from '@/components/ui/enhanced-mobile-breakpoints';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  points: number;
}

interface UserAchievementWithDetails {
  id: string;
  user_achievements_user_id: string;
  achievement_id: string;
  date_achieved: string;
  achievement: Achievement;
}

interface AchievementProgress {
  achievement_id: string;
  current_progress: number;
  target_progress: number;
  achievement: Achievement;
}

const EnhancedAchievements: React.FC = () => {
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievementWithDetails[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAchievementsData();
    }
  }, [user?.id]);

  const fetchAchievementsData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch all achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('points');

      if (achievementsError) throw achievementsError;

      // Fetch user's earned achievements with achievement details
      const { data: earnedAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievement_id(*)
        `)
        .eq('user_achievements_user_id', user.id);

      if (userAchievementsError) throw userAchievementsError;

      // Fetch achievement progress
      const progressData = await AchievementService.getAchievementProgress(user.id);

      setAchievements(allAchievements || []);
      setUserAchievements(earnedAchievements || []);
      setAchievementProgress(progressData || []);

      // Check for new achievements
      await AchievementService.checkAndAwardAchievements(user.id);
    } catch (error) {
      console.error('Error fetching achievements data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'trophy': return <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'star': return <Star className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'target': return <Target className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'dumbbell': return <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />;
      default: return <Award className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };

  const isAchievementEarned = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getAchievementProgress = (achievementId: string) => {
    return achievementProgress.find(ap => ap.achievement_id === achievementId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-quantum-cyan">Achievements</h2>
        <Badge variant="secondary" className="text-sm sm:text-base px-3 py-1 w-fit">
          {userAchievements.length} / {achievements.length} Earned
        </Badge>
      </div>

      {/* Earned Achievements */}
      {userAchievements.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white">Earned Achievements</h3>
          <EnhancedResponsiveGrid 
            cols={{ xs: 1, sm: 1, md: 2, lg: 3 }} 
            gap="gap-3 sm:gap-4"
          >
            {userAchievements.map((userAchievement) => (
              <Card key={userAchievement.id} className="holographic-card border-quantum-cyan">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-quantum-cyan flex-shrink-0">
                      {getIconComponent(userAchievement.achievement.icon)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg text-quantum-cyan truncate">
                        {userAchievement.achievement.name}
                      </CardTitle>
                      <Badge className="bg-quantum-cyan text-white mt-1 text-xs">
                        {userAchievement.achievement.points} points
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                    {userAchievement.achievement.description}
                  </p>
                  <p className="text-xs text-gray-400">
                    Earned: {new Date(userAchievement.date_achieved).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </EnhancedResponsiveGrid>
        </div>
      )}

      {/* Available Achievements */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-white">Available Achievements</h3>
        <EnhancedResponsiveGrid 
          cols={{ xs: 1, sm: 1, md: 2, lg: 3 }} 
          gap="gap-3 sm:gap-4"
        >
          {achievements
            .filter(achievement => !isAchievementEarned(achievement.id))
            .map((achievement) => {
              const progress = getAchievementProgress(achievement.id);
              const progressPercentage = progress ? 
                Math.min((progress.current_progress / progress.target_progress) * 100, 100) : 0;

              return (
                <Card key={achievement.id} className="holographic-card border-gray-600">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400 flex-shrink-0">
                        {getIconComponent(achievement.icon)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base sm:text-lg text-white truncate">
                          {achievement.name}
                        </CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {achievement.points} points
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                      {achievement.description}
                    </p>
                    
                    {progress && (
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-quantum-cyan">
                            {progress.current_progress} / {progress.target_progress}
                          </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    )}

                    <p className="text-xs text-gray-500 line-clamp-2">
                      {achievement.criteria}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
        </EnhancedResponsiveGrid>
      </div>
    </div>
  );
};

export default EnhancedAchievements;
