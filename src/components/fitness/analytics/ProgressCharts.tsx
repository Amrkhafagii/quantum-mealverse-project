import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useWorkoutAnalytics } from '@/hooks/useWorkoutAnalytics';
import { Activity, Calendar, TrendingUp, BarChart3, Dumbbell } from 'lucide-react';

export const ProgressCharts: React.FC = () => {
  const { goals, stats, isLoading, fetchWorkoutGoals } = useWorkoutAnalytics();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [chartType, setChartType] = useState<'weight' | 'workouts' | 'strength'>('workouts');

  // Placeholder data for charts
  const exerciseProgress = [
    { date: '2023-06-01', pushups: 20, pullups: 5, squats: 30 },
    { date: '2023-06-08', pushups: 22, pullups: 6, squats: 32 },
    { date: '2023-06-15', pushups: 25, pullups: 8, squats: 35 },
    { date: '2023-06-22', pushups: 28, pullups: 10, squats: 40 },
    { date: '2023-06-29', pushups: 30, pullups: 12, squats: 45 },
  ];

  const progressChartData = [
    { date: '2023-06-01', weight: 180, bodyFat: 20, muscle: 40 },
    { date: '2023-06-08', weight: 178, bodyFat: 19, muscle: 41 },
    { date: '2023-06-15', weight: 176, bodyFat: 18.5, muscle: 42 },
    { date: '2023-06-22', weight: 175, bodyFat: 18, muscle: 43 },
    { date: '2023-06-29', weight: 173, bodyFat: 17, muscle: 44 },
  ];

  const performanceMetrics = [
    { name: 'Endurance', value: 65 },
    { name: 'Strength', value: 80 },
    { name: 'Flexibility', value: 45 },
    { name: 'Balance', value: 70 },
    { name: 'Speed', value: 60 },
  ];

  // Generate workout frequency data based on goals
  const getWorkoutFrequencyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => ({
      day,
      workouts: Math.floor(Math.random() * 3), // Random data for demonstration
    }));
  };

  // Generate weight progress data
  const getWeightProgressData = () => {
    const dates = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(currentDate.getDate() - (i * 7));
      dates.push({
        date: date.toISOString().split('T')[0],
        weight: 180 - (i * 0.5) + (Math.random() * 2 - 1), // Simulated weight loss with fluctuation
      });
    }
    
    return dates.reverse();
  };

  // Generate strength progress data
  const getStrengthProgressData = () => {
    const dates = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(currentDate.getDate() - (i * 7));
      dates.push({
        date: date.toISOString().split('T')[0],
        benchPress: 135 + (i * 2.5) + (Math.random() * 5 - 2.5),
        squat: 185 + (i * 5) + (Math.random() * 10 - 5),
        deadlift: 225 + (i * 5) + (Math.random() * 10 - 5),
      });
    }
    
    return dates.reverse();
  };

  const workoutFrequencyData = getWorkoutFrequencyData();
  const weightProgressData = getWeightProgressData();
  const strengthProgressData = getStrengthProgressData();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Refresh data when time range changes
  useEffect(() => {
    fetchWorkoutGoals();
  }, [timeRange, fetchWorkoutGoals]);

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-quantum-cyan" />
            Progress Charts
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'year') => setTimeRange(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chartType} onValueChange={(value: 'weight' | 'workouts' | 'strength') => setChartType(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight">Weight</SelectItem>
                <SelectItem value="workouts">Workouts</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="charts" className="w-full">
          <TabsList className="bg-quantum-darkBlue/50 mb-6">
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="exercises">Exercise Progress</TabsTrigger>
            <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts" className="space-y-6">
            {chartType === 'weight' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Weight Progress</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightProgressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#ccc' }} 
                        tickFormatter={formatDate}
                      />
                      <YAxis tick={{ fill: '#ccc' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #16213e', color: '#fff' }}
                        formatter={(value) => [`${value} lbs`, 'Weight']}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#00FFFF" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {chartType === 'workouts' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Workout Frequency</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workoutFrequencyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="day" tick={{ fill: '#ccc' }} />
                      <YAxis tick={{ fill: '#ccc' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #16213e', color: '#fff' }}
                      />
                      <Legend />
                      <Bar dataKey="workouts" fill="#00FFFF" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {chartType === 'strength' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Strength Progress</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={strengthProgressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#ccc' }} 
                        tickFormatter={formatDate}
                      />
                      <YAxis tick={{ fill: '#ccc' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #16213e', color: '#fff' }}
                        formatter={(value) => [`${value} lbs`, 'Weight']}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="benchPress" stroke="#00FFFF" name="Bench Press" strokeWidth={2} />
                      <Line type="monotone" dataKey="squat" stroke="#FF00FF" name="Squat" strokeWidth={2} />
                      <Line type="monotone" dataKey="deadlift" stroke="#FFFF00" name="Deadlift" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="exercises" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Exercise Progress</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={exerciseProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#ccc' }} 
                      tickFormatter={formatDate}
                    />
                    <YAxis tick={{ fill: '#ccc' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #16213e', color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="pushups" stroke="#00FFFF" name="Push-ups" strokeWidth={2} />
                    <Line type="monotone" dataKey="pullups" stroke="#FF00FF" name="Pull-ups" strokeWidth={2} />
                    <Line type="monotone" dataKey="squats" stroke="#FFFF00" name="Squats" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Performance Metrics</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceMetrics} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis type="number" tick={{ fill: '#ccc' }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#ccc' }} width={100} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #16213e', color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#00FFFF" name="Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {isLoading && (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-quantum-cyan"></div>
          </div>
        )}
        
        <div className="mt-6 text-center text-sm text-gray-400">
          <p className="flex items-center justify-center">
            <Calendar className="h-4 w-4 mr-1" />
            Data shown for {timeRange === 'week' ? 'the past week' : timeRange === 'month' ? 'the past month' : 'the past year'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
