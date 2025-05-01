import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Achievement, UserAchievement } from '@/types/fitness';
import { supabase } from '@/integrations/supabase/client';
import { Award, Star, TrendingUp, Dumbbell, Utensils, Calendar, Target, Clock } from 'lucide-react';

interface AchievementSystemProps {
  userId?: string;
}

type ExtendedUserAchievement = UserAchievement & { 
  achievement?: Achievement 
};

const AchievementSystem = ({ userId }: AchievementSystemProps) => {
  const [userAchievements, setUserAchievements] = useState<ExtendedUserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    if (userId) {
      loadAchievements();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, we would fetch from the database
      // For now, we'll use mock data
      
      const mockAchievements: Achievement[] = [
        {
          id: "1",
          name: "First Workout",
          description: "Complete your first workout session",
          icon: "Dumbbell",
          criteria: "Complete 1 workout",
          points: 10
        },
        {
          id: "2",
          name: "Consistent Tracker",
          description: "Log your measurements for 4 consecutive weeks",
          icon: "LineChart",
          criteria: "Log measurements weekly for 4 weeks",
          points: 25
        },
        {
          id: "3",
          name: "Nutrition Master",
          description: "Create and follow 5 different meal plans",
          icon: "Utensils",
          criteria: "Create 5 meal plans",
          points: 30
        },
        {
          id: "4",
          name: "Early Bird",
          description: "Complete 5 morning workouts before 8 AM",
          icon: "Sunrise",
          criteria: "5 workouts before 8 AM",
          points: 40
        },
        {
          id: "5",
          name: "Weight Goal Achieved",
          description: "Reach your target weight goal",
          icon: "Target",
          criteria: "Reach target weight",
          points: 100
        },
        {
          id: "6",
          name: "Month Streak",
          description: "Work out consistently for an entire month",
          icon: "Calendar",
          criteria: "30 days of activity",
          points: 50
        }
      ];
      
      const mockUserAchievements: ExtendedUserAchievement[] = [
        {
          id: "ua1",
          user_id: userId || "",
          achievement_id: "1",
          date_achieved: new Date().toISOString(),
          achievement: mockAchievements[0]
        },
        {
          id: "ua2",
          user_id: userId || "",
          achievement_id: "3",
          date_achieved: new Date().toISOString(),
          achievement: mockAchievements[2]
        }
      ];
      
      setAllAchievements(mockAchievements);
      setUserAchievements(mockUserAchievements);
      
      // Calculate user points
      const points = mockUserAchievements.reduce((total, ua) => {
        const achievement = mockAchievements.find(a => a.id === ua.achievement_id);
        return total + (achievement?.points || 0);
      }, 0);
      
      setUserPoints(points);
      
      // Calculate level (1 level per 50 points)
      setUserLevel(Math.max(1, Math.floor(points / 50) + 1));
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading achievements:', error);
      setLoading(false);
    }
  };

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Dumbbell': return <Dumbbell className="h-6 w-6 text-quantum-purple" />;
      case 'LineChart': return <TrendingUp className="h-6 w-6 text-quantum-cyan" />;
      case 'Utensils': return <Utensils className="h-6 w-6 text-green-400" />;
      case 'Sunrise': return <Clock className="h-6 w-6 text-amber-400" />;
      case 'Target': return <Target className="h-6 w-6 text-red-400" />;
      case 'Calendar': return <Calendar className="h-6 w-6 text-blue-400" />;
      default: return <Award className="h-6 w-6 text-quantum-purple" />;
    }
  };

  // Calculate progress to next level
  const pointsToNextLevel = (userLevel * 50);
  const progressPercent = Math.min(100, (userPoints / pointsToNextLevel) * 100);
  const pointsNeeded = pointsToNextLevel - userPoints;

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
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-400" />
            Fitness Level & Achievements
          </CardTitle>
          <CardDescription>Track your progress and earn rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-quantum-cyan flex items-center justify-center">
                <span className="text-2xl font-bold">{userLevel}</span>
              </div>
              <Badge className="absolute -top-2 -right-2 bg-yellow-500">
                <Star className="h-3 w-3 mr-1" fill="currentColor" />
                {userPoints} pts
              </Badge>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Level {userLevel}</span>
                <span className="text-sm font-medium">{userPoints} / {pointsToNextLevel} points</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-gray-400 mt-1">
                {pointsNeeded > 0 
                  ? `${pointsNeeded} more points to reach Level ${userLevel + 1}` 
                  : "You've reached the next level!"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader>
            <CardTitle className="text-quantum-cyan">Completed Achievements</CardTitle>
            <CardDescription>
              You've earned {userAchievements.length} of {allAchievements.length} achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userAchievements.length > 0 ? (
              <div className="space-y-3">
                {userAchievements.map((userAchievement) => {
                  const achievement = allAchievements.find(a => a.id === userAchievement.achievement_id);
                  if (!achievement) return null;
                  
                  return (
                    <div key={userAchievement.id} className="flex items-center gap-3 p-3 bg-quantum-black/40 rounded-md">
                      <div className="bg-gradient-to-r from-purple-600 to-quantum-cyan rounded-full p-2">
                        {getAchievementIcon(achievement.icon)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.name}</h4>
                        <p className="text-sm text-gray-400">{achievement.description}</p>
                      </div>
                      <Badge className="bg-yellow-600">+{achievement.points} pts</Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-6 text-gray-400">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>You haven't earned any achievements yet.</p>
                <p className="text-sm">Complete goals to earn achievements and points!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader>
            <CardTitle className="text-quantum-purple">Available Achievements</CardTitle>
            <CardDescription>Complete these to level up</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allAchievements
                .filter(achievement => !userAchievements.some(ua => ua.achievement_id === achievement.id))
                .map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-quantum-black/40 rounded-md opacity-75 hover:opacity-100 transition-opacity">
                    <div className="bg-gray-800 rounded-full p-2">
                      {getAchievementIcon(achievement.icon)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.name}</h4>
                      <p className="text-sm text-gray-400">{achievement.criteria}</p>
                    </div>
                    <Badge className="bg-gray-700">+{achievement.points} pts</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-purple-900/20 border-purple-500/30">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-purple-400">Premium Features Coming Soon</h3>
            <p className="text-gray-300">
              Advanced achievement tracking, personalized challenges, and social competitions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementSystem;
