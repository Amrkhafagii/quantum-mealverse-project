
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PointsDisplay } from '../common/PointsDisplay';
import { UserProfile, UserWorkoutStats } from '@/types/fitness';
import { supabase } from '@/integrations/supabase/client';
import { Award, Dumbbell, Flame, Medal, Scale, Target, Trophy, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface EnhancedFitnessProfileProps {
  userId?: string;
  userProfile?: UserProfile;
}

const EnhancedFitnessProfile: React.FC<EnhancedFitnessProfileProps> = ({ userId, userProfile }) => {
  const [workoutStats, setWorkoutStats] = useState<UserWorkoutStats | null>(null);
  const [achievements, setAchievements] = useState<{ total: number, recent: any[] }>({ total: 0, recent: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (userId) {
      fetchWorkoutStats();
      fetchAchievements();
    }
  }, [userId]);
  
  const fetchWorkoutStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_workout_stats', {
        user_id_param: userId
      });
      
      if (error) throw error;
      setWorkoutStats(data as UserWorkoutStats);
    } catch (error) {
      console.error('Error fetching workout stats:', error);
    }
  };
  
  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      
      // Get user achievements count
      const { count, error: countError } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (countError) throw countError;
      
      // Get recent achievements
      const { data: recentAchievements, error: recentError } = await supabase
        .from('user_achievements')
        .select(`
          id, date_achieved,
          achievement:achievement_id (
            id, name, description, icon, points
          )
        `)
        .eq('user_id', userId)
        .order('date_achieved', { ascending: false })
        .limit(3);
      
      if (recentError) throw recentError;
      
      setAchievements({
        total: count || 0,
        recent: recentAchievements || []
      });
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case 'award': return <Award className="h-4 w-4" />;
      case 'medal': return <Medal className="h-4 w-4" />;
      case 'trophy': return <Trophy className="h-4 w-4" />;
      case 'target': return <Target className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };
  
  return (
    <Card className="bg-gradient-to-br from-quantum-darkBlue/50 to-quantum-black/70 border-quantum-cyan/20">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardTitle className="flex items-center text-quantum-cyan">
            <UserCircle className="mr-2 h-5 w-5" />
            Fitness Profile Overview
          </CardTitle>
          {workoutStats?.points !== undefined && (
            <PointsDisplay points={workoutStats.points} size="medium" showIcon={true} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Column - User Info */}
          <div className="flex flex-col space-y-4">
            <div className="bg-quantum-darkBlue/30 p-4 rounded-lg border border-quantum-cyan/10">
              <h3 className="font-medium mb-2 flex items-center">
                <UserCircle className="h-4 w-4 mr-2 text-quantum-cyan" />
                Profile
              </h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-400">Name:</span>{' '}
                  {userProfile?.display_name || 'Not set'}
                </p>
                <p className="text-sm">
                  <span className="text-gray-400">Height:</span>{' '}
                  {userProfile?.height ? `${userProfile.height} cm` : 'Not set'}
                </p>
                <p className="text-sm">
                  <span className="text-gray-400">Weight:</span>{' '}
                  {userProfile?.weight ? `${userProfile.weight} kg` : 'Not set'}
                </p>
                <div className="pt-1">
                  <Badge variant="outline" className="bg-quantum-darkBlue/50">
                    {userProfile?.fitness_level || 'Level not set'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Workout Stats */}
          <div className="flex flex-col space-y-4">
            <div className="bg-quantum-darkBlue/30 p-4 rounded-lg border border-quantum-cyan/10 h-full">
              <h3 className="font-medium mb-2 flex items-center">
                <Dumbbell className="h-4 w-4 mr-2 text-quantum-cyan" />
                Workout Stats
              </h3>
              
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-quantum-cyan"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-quantum-black/30 p-3 rounded-md">
                    <div className="text-gray-400 text-xs mb-1">Total Workouts</div>
                    <div className="text-lg font-bold">
                      {workoutStats?.total_workouts || 0}
                    </div>
                  </div>
                  
                  <div className="bg-quantum-black/30 p-3 rounded-md">
                    <div className="text-gray-400 text-xs mb-1">Streak</div>
                    <div className="text-lg font-bold flex items-center">
                      {workoutStats?.currentStreak || 0}
                      <Flame className="h-4 w-4 ml-1 text-orange-400" />
                    </div>
                  </div>
                  
                  <div className="bg-quantum-black/30 p-3 rounded-md">
                    <div className="text-gray-400 text-xs mb-1">Achievements</div>
                    <div className="text-lg font-bold">
                      {achievements.total}
                    </div>
                  </div>
                  
                  <div className="bg-quantum-black/30 p-3 rounded-md">
                    <div className="text-gray-400 text-xs mb-1">Level</div>
                    <div className="text-lg font-bold">
                      {workoutStats?.level || 1}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Recent Achievements */}
          <div className="flex flex-col space-y-4">
            <div className="bg-quantum-darkBlue/30 p-4 rounded-lg border border-quantum-cyan/10 h-full">
              <h3 className="font-medium mb-2 flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-yellow-400" />
                Recent Achievements
              </h3>
              
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-quantum-cyan"></div>
                </div>
              ) : achievements.recent.length > 0 ? (
                <div className="space-y-2">
                  {achievements.recent.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-quantum-black/30 p-2 rounded-md flex items-center"
                    >
                      <div className="bg-yellow-500/20 p-1 rounded-full mr-2">
                        {getAchievementIcon(achievement.achievement.icon)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{achievement.achievement.name}</div>
                        <div className="text-xs text-gray-400">{achievement.achievement.points} pts</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-gray-400">
                  Complete workouts to earn achievements!
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedFitnessProfile;
