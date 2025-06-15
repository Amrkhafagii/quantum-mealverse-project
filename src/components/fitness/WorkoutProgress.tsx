
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, TrendingUp, Award, Clock, Flame } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface WorkoutProgressProps {
  showDetailedView?: boolean;
}

interface ProgressStats {
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  weeklyGoal: number;
  thisWeekWorkouts: number;
  monthlyGoal: number;
  thisMonthWorkouts: number;
  totalMinutes: number;
  caloriesBurned: number;
  favoriteExercise: string;
  strongestDay: string;
}

export const WorkoutProgress: React.FC<WorkoutProgressProps> = ({
  showDetailedView = false
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProgressStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalWorkouts: 0,
    weeklyGoal: 3,
    thisWeekWorkouts: 0,
    monthlyGoal: 12,
    thisMonthWorkouts: 0,
    totalMinutes: 0,
    caloriesBurned: 0,
    favoriteExercise: 'Push-ups',
    strongestDay: 'Monday'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgressStats();
    }
  }, [user]);

  const fetchProgressStats = async () => {
    if (!user) return;

    try {
      // Get user workout stats
      const { data: workoutStats } = await supabase
        .from('user_workout_stats')
        .select('*')
        .eq('user_workout_stats_user_id', user.id)
        .single();

      // Get user streaks
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_streaks_user_id', user.id)
        .eq('streak_type', 'workout')
        .single();

      // Get this week's workouts
      const startOfWeek = getStartOfWeek();
      const { data: weeklyWorkouts } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('workout_logs_user_id', user.id)
        .gte('date', startOfWeek.toISOString());

      // Get this month's workouts
      const startOfMonth = getStartOfMonth();
      const { data: monthlyWorkouts } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('workout_logs_user_id', user.id)
        .gte('date', startOfMonth.toISOString());

      setStats({
        currentStreak: streakData?.currentstreak || 0,
        longestStreak: streakData?.longeststreak || 0,
        totalWorkouts: workoutStats?.total_workouts || 0,
        weeklyGoal: 3, // Could be user-defined
        thisWeekWorkouts: weeklyWorkouts?.length || 0,
        monthlyGoal: 12, // Could be user-defined
        thisMonthWorkouts: monthlyWorkouts?.length || 0,
        totalMinutes: workoutStats?.total_time || 0,
        caloriesBurned: workoutStats?.calories_burned || 0,
        favoriteExercise: 'Push-ups', // Would be calculated from logs
        strongestDay: workoutStats?.most_active_day || 'Monday'
      });
    } catch (error) {
      console.error('Error fetching progress stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartOfWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  };

  const getStartOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'text-green-600';
    if (streak >= 3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getProgressColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="holographic-card">
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${getStreakColor(stats.currentStreak)}`}>
              {stats.currentStreak}
            </div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </CardContent>
        </Card>

        <Card className="holographic-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-quantum-cyan">
              {stats.totalWorkouts}
            </div>
            <div className="text-sm text-gray-600">Total Workouts</div>
          </CardContent>
        </Card>

        <Card className="holographic-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">
              {Math.round(stats.totalMinutes / 60)}h
            </div>
            <div className="text-sm text-gray-600">Time Trained</div>
          </CardContent>
        </Card>

        <Card className="holographic-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">
              {stats.caloriesBurned}
            </div>
            <div className="text-sm text-gray-600">Calories Burned</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="holographic-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-quantum-cyan" />
              Weekly Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="font-medium">
                  {stats.thisWeekWorkouts} / {stats.weeklyGoal} workouts
                </span>
              </div>
              <Progress 
                value={(stats.thisWeekWorkouts / stats.weeklyGoal) * 100} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>This week</span>
                <span>
                  {Math.round((stats.thisWeekWorkouts / stats.weeklyGoal) * 100)}% complete
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="holographic-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-quantum-cyan" />
              Monthly Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="font-medium">
                  {stats.thisMonthWorkouts} / {stats.monthlyGoal} workouts
                </span>
              </div>
              <Progress 
                value={(stats.thisMonthWorkouts / stats.monthlyGoal) * 100} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>This month</span>
                <span>
                  {Math.round((stats.thisMonthWorkouts / stats.monthlyGoal) * 100)}% complete
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showDetailedView && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="holographic-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Best Streak</span>
                  </div>
                  <div className="text-lg font-bold text-quantum-cyan">
                    {stats.longestStreak} days
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="holographic-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Favorite Exercise</span>
                  </div>
                  <div className="text-lg font-bold text-quantum-cyan">
                    {stats.favoriteExercise}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="holographic-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Strongest Day</span>
                  </div>
                  <div className="text-lg font-bold text-quantum-cyan">
                    {stats.strongestDay}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkoutProgress;
