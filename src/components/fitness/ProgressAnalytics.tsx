
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Target, Calendar, Dumbbell, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProgressData {
  date: string;
  weight: number;
  reps: number;
  volume: number;
}

interface ExerciseProgress {
  exercise_name: string;
  data: ProgressData[];
  trend: 'up' | 'down' | 'stable';
  improvement: number;
}

export const ProgressAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    avgDuration: 0,
    bestStreak: 0,
    volumeIncrease: 0
  });

  useEffect(() => {
    if (user) {
      fetchProgressData();
      fetchWorkoutStats();
    }
  }, [user, timeRange]);

  const fetchProgressData = async () => {
    if (!user) return;

    try {
      const startDate = getStartDate();
      
      const { data, error } = await supabase
        .from('exercise_progress')
        .select('*')
        .eq('exercise_progress_user_id', user.id)
        .gte('recorded_date', startDate)
        .order('recorded_date', { ascending: true });

      if (error) throw error;

      // Group by exercise and calculate trends
      const grouped = groupByExercise(data || []);
      setExerciseProgress(grouped);
      
      if (grouped.length > 0 && !selectedExercise) {
        setSelectedExercise(grouped[0].exercise_name);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkoutStats = async () => {
    if (!user) return;

    try {
      const { data: workoutStats } = await supabase
        .from('user_workout_stats')
        .select('*')
        .eq('user_workout_stats_user_id', user.id)
        .single();

      const { data: recentLogs } = await supabase
        .from('workout_logs')
        .select('duration')
        .eq('workout_logs_user_id', user.id)
        .order('date', { ascending: false })
        .limit(10);

      const avgDuration = recentLogs?.length 
        ? Math.round(recentLogs.reduce((sum, log) => sum + log.duration, 0) / recentLogs.length)
        : 0;

      setStats({
        totalWorkouts: workoutStats?.total_workouts || 0,
        avgDuration,
        bestStreak: workoutStats?.streak_days || 0,
        volumeIncrease: 15 // Placeholder calculation
      });
    } catch (error) {
      console.error('Error fetching workout stats:', error);
    }
  };

  const getStartDate = () => {
    const now = new Date();
    switch (timeRange) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case 'quarter':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const groupByExercise = (data: any[]): ExerciseProgress[] => {
    const grouped = data.reduce((acc, entry) => {
      if (!acc[entry.exercise_name]) {
        acc[entry.exercise_name] = [];
      }
      acc[entry.exercise_name].push({
        date: new Date(entry.recorded_date).toLocaleDateString(),
        weight: entry.max_weight || 0,
        reps: entry.max_reps || 0,
        volume: entry.total_volume || 0
      });
      return acc;
    }, {});

    return Object.entries(grouped).map(([exercise, progressData]: [string, any]) => {
      const sortedData = progressData.sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      const trend = calculateTrend(sortedData);
      const improvement = calculateImprovement(sortedData);
      
      return {
        exercise_name: exercise,
        data: sortedData,
        trend,
        improvement
      };
    });
  };

  const calculateTrend = (data: ProgressData[]): 'up' | 'down' | 'stable' => {
    if (data.length < 2) return 'stable';
    
    const first = data[0].volume;
    const last = data[data.length - 1].volume;
    
    if (last > first * 1.05) return 'up';
    if (last < first * 0.95) return 'down';
    return 'stable';
  };

  const calculateImprovement = (data: ProgressData[]): number => {
    if (data.length < 2) return 0;
    
    const first = data[0].volume;
    const last = data[data.length - 1].volume;
    
    return Math.round(((last - first) / first) * 100);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  const selectedData = exerciseProgress.find(ep => ep.exercise_name === selectedExercise)?.data || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-quantum-cyan">Progress Analytics</h2>
        
        <div className="flex gap-2">
          {['week', 'month', 'quarter'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              onClick={() => setTimeRange(range as any)}
              className="capitalize"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="holographic-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Workouts</p>
                <p className="text-2xl font-bold text-quantum-cyan">{stats.totalWorkouts}</p>
              </div>
              <Dumbbell className="w-8 h-8 text-quantum-cyan opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="holographic-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-quantum-cyan">{stats.avgDuration}m</p>
              </div>
              <Clock className="w-8 h-8 text-quantum-cyan opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="holographic-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Best Streak</p>
                <p className="text-2xl font-bold text-quantum-cyan">{stats.bestStreak}</p>
              </div>
              <Calendar className="w-8 h-8 text-quantum-cyan opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="holographic-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Volume Increase</p>
                <p className="text-2xl font-bold text-green-500">+{stats.volumeIncrease}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exercise List */}
        <Card className="holographic-card">
          <CardHeader>
            <CardTitle className="text-lg">Exercise Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {exerciseProgress.map((exercise) => (
              <div
                key={exercise.exercise_name}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedExercise === exercise.exercise_name
                    ? 'bg-quantum-cyan bg-opacity-10 border border-quantum-cyan'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedExercise(exercise.exercise_name)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{exercise.exercise_name}</span>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(exercise.trend)}
                    <Badge variant={exercise.improvement > 0 ? 'default' : 'secondary'}>
                      {exercise.improvement > 0 ? '+' : ''}{exercise.improvement}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Progress Chart */}
        <Card className="holographic-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedExercise} Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={selectedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#00f5ff" 
                    strokeWidth={2}
                    dot={{ fill: '#00f5ff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No progress data available for this exercise
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressAnalytics;
