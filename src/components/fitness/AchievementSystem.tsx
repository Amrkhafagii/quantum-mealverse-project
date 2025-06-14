
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target } from 'lucide-react';
import { ExtendedUserAchievement, Achievement } from '@/types/fitness';
import { getUserAchievements } from '@/services/gamificationService';
import { useAuth } from '@/hooks/useAuth';

const AchievementSystem: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<ExtendedUserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAchievements();
    }
  }, [user?.id]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const { data } = await getUserAchievements(user!.id);
      if (data) {
        setAchievements(data);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockAchievements: ExtendedUserAchievement[] = [
    {
      id: '1',
      user_achievements_user_id: user?.id || '',
      achievement_id: 'first-workout',
      unlocked_at: new Date().toISOString(),
      date_achieved: new Date().toISOString(),
      achievement: {
        id: 'first-workout',
        name: 'First Steps',
        description: 'Complete your first workout',
        icon: 'trophy',
        criteria: 'Complete 1 workout',
        points: 100
      }
    },
    {
      id: '2',
      user_achievements_user_id: user?.id || '',
      achievement_id: 'week-streak',
      unlocked_at: new Date().toISOString(),
      date_achieved: new Date().toISOString(),
      achievement: {
        id: 'week-streak',
        name: 'Week Warrior',
        description: 'Maintain a 7-day workout streak',
        icon: 'star',
        criteria: 'Complete workouts for 7 consecutive days',
        points: 250
      }
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading achievements...</div>
        </CardContent>
      </Card>
    );
  }

  const displayAchievements = achievements.length > 0 ? achievements : mockAchievements;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayAchievements.map((userAchievement) => (
            <div
              key={userAchievement.id}
              className="flex items-center gap-3 p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {userAchievement.achievement.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {userAchievement.achievement.description}
                </p>
                <Badge variant="secondary" className="mt-1">
                  {userAchievement.achievement.points} points
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementSystem;
