
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Achievement, UserAchievement } from '@/types/fitness';
import { Trophy, Award, Target, ThumbsUp, Scale, Heart, Droplets } from 'lucide-react';

interface UserAchievementsProps {
  userId?: string;
}

const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  'trophy': <Trophy className="h-8 w-8 text-yellow-400" />,
  'award': <Award className="h-8 w-8 text-blue-400" />,
  'target': <Target className="h-8 w-8 text-red-400" />,
  'thumbs-up': <ThumbsUp className="h-8 w-8 text-green-400" />,
  'scale': <Scale className="h-8 w-8 text-purple-400" />,
  'heart': <Heart className="h-8 w-8 text-pink-400" />,
  'droplets': <Droplets className="h-8 w-8 text-cyan-400" />,
};

const UserAchievements = ({ userId }: UserAchievementsProps) => {
  const { toast } = useToast();
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [availableAchievements, setAvailableAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadAchievements();
    }
  }, [userId]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      
      // Load all available achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('name');
        
      if (achievementsError) throw achievementsError;
      
      setAvailableAchievements(achievements || []);
      
      // Load user's earned achievements
      const { data: earned, error: earnedError } = await supabase
        .from('user_achievements')
        .select(`
          id,
          user_id,
          achievement_id,
          date_achieved,
          achievement:achievements (
            id,
            name,
            description,
            icon,
            points
          )
        `)
        .eq('user_id', userId)
        .order('date_achieved', { ascending: false });
        
      if (earnedError) throw earnedError;
      
      setUserAchievements(earned || []);
      
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

  // Calculate total achievement points
  const totalPoints = userAchievements.reduce((sum, item) => {
    return sum + (item.achievement?.points || 0);
  }, 0);

  // Helper function to check if an achievement is earned
  const isAchievementEarned = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  // Get icon component for an achievement
  const getAchievementIcon = (iconName: string) => {
    return ACHIEVEMENT_ICONS[iconName] || <Award className="h-8 w-8 text-gray-400" />;
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
      <Card className="holographic-card bg-gradient-to-br from-quantum-darkBlue to-quantum-black border-quantum-purple/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <Trophy className="h-12 w-12 text-yellow-400" />
              <div>
                <h3 className="text-xl font-bold">Achievement Points</h3>
                <p className="text-3xl font-bold text-quantum-purple">{totalPoints}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">{userAchievements.length} of {availableAchievements.length} achievements unlocked</p>
              <div className="w-full mt-2 bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-quantum-purple h-2.5 rounded-full" 
                  style={{ width: `${(userAchievements.length / Math.max(1, availableAchievements.length)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableAchievements.map((achievement) => {
          const isEarned = isAchievementEarned(achievement.id);
          const earnedAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
          
          return (
            <Card 
              key={achievement.id} 
              className={`transition-all ${isEarned 
                ? 'holographic-card bg-gradient-to-br from-quantum-darkBlue/70 to-quantum-black border-quantum-cyan/50' 
                : 'bg-quantum-darkBlue/20 border-gray-800'}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${isEarned ? 'bg-quantum-darkBlue' : 'bg-gray-800'}`}>
                    {getAchievementIcon(achievement.icon)}
                  </div>
                  <div>
                    <h3 className={`font-bold ${isEarned ? 'text-quantum-cyan' : 'text-gray-400'}`}>{achievement.name}</h3>
                    <p className="text-sm text-gray-400">{achievement.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="bg-quantum-darkBlue/50 px-3 py-1 rounded-full text-xs">
                    {achievement.points} points
                  </div>
                  {isEarned && (
                    <div className="text-xs text-gray-400">
                      Earned {new Date(earnedAchievement?.date_achieved || '').toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {availableAchievements.length === 0 && (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="pt-6 text-center">
            <p>No achievements found. Start your fitness journey to earn achievements.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserAchievements;
