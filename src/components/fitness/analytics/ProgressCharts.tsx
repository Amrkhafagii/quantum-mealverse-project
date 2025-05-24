
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWorkoutAnalytics } from '@/hooks/useWorkoutAnalytics';
import { format } from 'date-fns';

export const ProgressCharts: React.FC = () => {
  const { analytics, exerciseProgress, getProgressChartData, getPerformanceMetrics } = useWorkoutAnalytics();
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const performanceMetrics = getPerformanceMetrics();
  const volumeData = getProgressChartData('weekly_volume');
  const frequencyData = getProgressChartData('weekly_frequency');
  
  // Get unique exercises from progress data
  const exercises = [...new Set(exerciseProgress.map(ep => ep.exercise_name))];
  
  // Prepare exercise-specific progress data
  const exerciseProgressData = selectedExercise 
    ? exerciseProgress
        .filter(ep => ep.exercise_name === selectedExercise)
        .map(ep => ({
          date: ep.recorded_date,
          weight: ep.max_weight || 0,
          reps: ep.max_reps || 0,
          volume: ep.total_volume || 0,
          oneRepMax: ep.one_rep_max || 0
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-quantum-darkBlue/90 p-3 border border-quantum-cyan/20 rounded-md shadow-lg">
          <p className="text-sm font-medium">{format(new Date(label), 'MMM dd, yyyy')}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-quantum-cyan" />
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Total Workouts</p>
                  <p className="text-2xl font-bold">{performanceMetrics.totalWorkouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Total Volume</p>
                  <p className="text-2xl font-bold">{performanceMetrics.totalVolume.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Avg Duration</p>
                  <p className="text-2xl font-bold">{performanceMetrics.averageDuration}m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-400" />
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Strongest</p>
                  <p className="text-lg font-bold truncate">{performanceMetrics.strongestExercise}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-quantum-cyan" />
              Progress Analytics
            </CardTitle>
            <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'year') => setTimeRange(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">1 Week</SelectItem>
                <SelectItem value="month">1 Month</SelectItem>
                <SelectItem value="year">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-quantum-black/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="volume">Volume</TabsTrigger>
              <TabsTrigger value="frequency">Frequency</TabsTrigger>
              <TabsTrigger value="exercises">Exercises</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#888', fontSize: 12 }}
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                    />
                    <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#9b87f5"
                      fill="url(#colorVolume)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#9b87f5" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="volume" className="mt-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#888', fontSize: 12 }}
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                    />
                    <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="frequency" className="mt-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={frequencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#888', fontSize: 12 }}
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                    />
                    <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#33C3F0"
                      strokeWidth={3}
                      dot={{ strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="exercises" className="mt-6">
              <div className="mb-4">
                <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select an exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {exercises.map((exercise) => (
                      <SelectItem key={exercise} value={exercise}>
                        {exercise}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedExercise && exerciseProgressData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={exerciseProgressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#888', fontSize: 12 }}
                        tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                      />
                      <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#9b87f5"
                        strokeWidth={2}
                        name="Max Weight"
                      />
                      <Line
                        type="monotone"
                        dataKey="oneRepMax"
                        stroke="#33C3F0"
                        strokeWidth={2}
                        name="1RM Est."
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  {selectedExercise ? 'No progress data available for this exercise' : 'Select an exercise to view progress'}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
