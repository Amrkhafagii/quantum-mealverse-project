import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserWorkoutStats, UserMeasurement, WorkoutHistoryItem } from '@/types/fitness';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { useToast } from '@/hooks/use-toast';
import { Activity, Calendar, Dumbbell, Flame, Award, TrendingUp } from 'lucide-react';
import ProgressChart from './ProgressChart';

interface ProgressAnalyticsProps {
  userId?: string;
  measurements: UserMeasurement[];
}

const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ userId, measurements }) => {
  const { history, stats, loading, error, loadWorkoutHistory, loadWorkoutStats } = useWorkoutData();
  const { toast } = useToast();
  const [dateFilter, setDateFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (userId) {
      loadWorkoutHistory(dateFilter);
      loadWorkoutStats();
    }
  }, [userId, dateFilter]);

  const handleRefresh = () => {
    loadWorkoutHistory(dateFilter);
    loadWorkoutStats();
    toast({
      title: 'Data refreshed',
      description: 'Your workout data has been refreshed.',
    });
  };

  // Calculate progress metrics
  const calculateProgress = () => {
    if (!stats || !history) return null;

    // Example calculation - in a real app, you would have more sophisticated metrics
    const workoutsThisWeek = history.filter(h => {
      const date = new Date(h.date);
      const today = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      return date >= oneWeekAgo && date <= today;
    }).length;

    return {
      workoutsThisWeek,
      averageWorkoutDuration: stats.totalWorkouts > 0 ? Math.round(stats.total_time / stats.totalWorkouts) : 0,
    };
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {loading.stats || loading.history ? (
        <Card className="bg-quantum-darkBlue/30 border border-quantum-cyan/20">
          <CardContent className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-quantum-cyan"></div>
          </CardContent>
        </Card>
      ) : (
        <>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-quantum-darkBlue/30 border border-quantum-cyan/20">
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-400">Total Workouts</p>
                      <p className="text-2xl font-bold text-quantum-cyan">{stats.totalWorkouts}</p>
                    </div>
                    <Activity className="h-8 w-8 text-quantum-cyan opacity-70" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-quantum-darkBlue/30 border border-quantum-cyan/20">
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-400">Current Streak</p>
                      <p className="text-2xl font-bold text-quantum-cyan">{stats.currentStreak} days</p>
                    </div>
                    <Flame className="h-8 w-8 text-quantum-cyan opacity-70" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-quantum-darkBlue/30 border border-quantum-cyan/20">
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-400">Total Time</p>
                      <p className="text-2xl font-bold text-quantum-cyan">{stats.total_time} mins</p>
                    </div>
                    <Calendar className="h-8 w-8 text-quantum-cyan opacity-70" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-quantum-darkBlue/30 border border-quantum-cyan/20">
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-400">Calories Burned</p>
                      <p className="text-2xl font-bold text-quantum-cyan">{stats.total_calories}</p>
                    </div>
                    <Dumbbell className="h-8 w-8 text-quantum-cyan opacity-70" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {progress && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-quantum-darkBlue/30 border border-quantum-cyan/20">
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-400">Workouts This Week</p>
                      <p className="text-2xl font-bold text-quantum-cyan">{progress.workoutsThisWeek}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-quantum-cyan opacity-70" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-quantum-darkBlue/30 border border-quantum-cyan/20">
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-400">Avg Workout Duration</p>
                      <p className="text-2xl font-bold text-quantum-cyan">{progress.averageWorkoutDuration} mins</p>
                    </div>
                    <Award className="h-8 w-8 text-quantum-cyan opacity-70" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <ProgressChart 
            workoutHistory={history}
            measurements={measurements}
          />

          <div className="flex justify-end">
            <Button 
              className="bg-quantum-cyan hover:bg-quantum-cyan/90"
              onClick={handleRefresh}
            >
              Refresh Data
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressAnalytics;
