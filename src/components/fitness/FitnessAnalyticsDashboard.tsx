import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subMonths, subWeeks, startOfMonth, endOfMonth } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { UserMeasurement, WorkoutHistoryItem } from '@/types/fitness';
import { getUserMeasurements } from '@/services/measurementService';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Calendar, TrendingUp } from 'lucide-react';
import AdvancedProgressCharts from './AdvancedProgressCharts';

interface FitnessAnalyticsDashboardProps {
  userId?: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];

const FitnessAnalyticsDashboard: React.FC<FitnessAnalyticsDashboardProps> = ({ userId }) => {
  const [measurements, setMeasurements] = useState<UserMeasurement[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>([]);
  const [timeframe, setTimeframe] = useState<'1w' | '1m' | '3m' | '6m' | 'all'>('1m');
  const [activeTab, setActiveTab] = useState('weight');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, timeframe]);
  
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadMeasurements(), loadWorkoutHistory()]);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMeasurements = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await getUserMeasurements(userId);
      
      if (error) throw error;
      
      const filteredData = filterDataByTimeframe(data || []);
      setMeasurements(filteredData);
    } catch (error) {
      console.error('Error loading measurements:', error);
    }
  };
  
  const loadWorkoutHistory = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      const startDate = new Date();
      const endDate = new Date();
      
      switch (timeframe) {
        case '1w':
          startDate = subWeeks(endDate, 1);
          break;
        case '1m':
          startDate = subMonths(endDate, 1);
          break;
        case '3m':
          startDate = subMonths(endDate, 3);
          break;
        case '6m':
          startDate = subMonths(endDate, 6);
          break;
        default:
          startDate = startOfMonth(endDate);
          endDate = endOfMonth(endDate);
      }
      
      const { data, error } = await supabase
        .from('workout_history')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Make sure the data has all required fields for WorkoutHistoryItem
        const typedData = data.map(item => ({
          ...item,
          workout_name: item.workout_plan_name || 'Workout', // Ensure workout_name exists
          exercises_count: item.total_exercises || 0 // Ensure exercises_count exists
        }));
        
        setWorkoutHistory(typedData as WorkoutHistoryItem[]);
      }
    } catch (error) {
      console.error('Error fetching workout history:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filterDataByTimeframe = <T extends { date: string }>(data: T[]): T[] => {
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeframe) {
      case '1w':
        cutoffDate = subWeeks(now, 1);
        break;
      case '1m':
        cutoffDate = subMonths(now, 1);
        break;
      case '3m':
        cutoffDate = subMonths(now, 3);
        break;
      case '6m':
        cutoffDate = subMonths(now, 6);
        break;
      default:
        // "all" timeframe - no filtering
        return [...data].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    }
    
    return data
      .filter(item => new Date(item.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  // Format chart data for weight and measurements
  const formatMeasurementData = () => {
    return measurements.map(m => ({
      date: format(new Date(m.date), 'MMM dd'),
      weight: m.weight,
      bodyFat: m.body_fat || null,
      chest: m.chest || null,
      waist: m.waist || null,
      hips: m.hips || null,
      arms: m.arms || null,
      legs: m.legs || null
    }));
  };
  
  // Format chart data for workout activity
  const formatWorkoutData = () => {
    // Group workouts by week or day based on timeframe
    const groupedWorkouts: Record<string, { date: string, count: number, duration: number, calories: number }> = {};
    
    workouts.forEach(workout => {
      const dateKey = format(new Date(workout.date), timeframe === '1w' ? 'MMM dd' : 'MMM dd');
      
      if (!groupedWorkouts[dateKey]) {
        groupedWorkouts[dateKey] = {
          date: dateKey,
          count: 0,
          duration: 0,
          calories: 0
        };
      }
      
      groupedWorkouts[dateKey].count += 1;
      groupedWorkouts[dateKey].duration += workout.duration;
      groupedWorkouts[dateKey].calories += workout.calories_burned || 0;
    });
    
    return Object.values(groupedWorkouts);
  };
  
  // Calculate statistics for the summary cards
  const calculateStats = () => {
    if (measurements.length === 0) {
      return {
        weightChange: null,
        bodyFatChange: null,
        workoutCount: workouts.length,
        totalDuration: workouts.reduce((sum, w) => sum + w.duration, 0),
        totalCalories: workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0),
        completionRate: workouts.length > 0 
          ? Math.round(workouts.reduce((sum, w) => sum + (w.exercises_completed / w.total_exercises), 0) / workouts.length * 100)
          : 0
      };
    }
    
    const firstMeasurement = measurements[0];
    const lastMeasurement = measurements[measurements.length - 1];
    
    return {
      weightChange: lastMeasurement.weight - firstMeasurement.weight,
      bodyFatChange: lastMeasurement.body_fat !== null && firstMeasurement.body_fat !== null
        ? lastMeasurement.body_fat - firstMeasurement.body_fat
        : null,
      workoutCount: workouts.length,
      totalDuration: workouts.reduce((sum, w) => sum + w.duration, 0),
      totalCalories: workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0),
      completionRate: workouts.length > 0 
        ? Math.round(workouts.reduce((sum, w) => sum + (w.exercises_completed / w.total_exercises), 0) / workouts.length * 100)
        : 0
    };
  };
  
  const stats = calculateStats();
  const measurementData = formatMeasurementData();
  const workoutData = formatWorkoutData();
  
  // Generate muscle group focus data
  const generateMuscleGroupData = () => {
    const muscleGroups: Record<string, number> = {
      'Chest': 0,
      'Back': 0,
      'Legs': 0,
      'Arms': 0,
      'Shoulders': 0,
      'Core': 0,
      'Other': 0
    };
    
    workouts.forEach(workout => {
      // This is a simplified example - in a real app, you would track 
      // which muscle groups were targeted in each workout
      const name = workout.workout_day_name.toLowerCase();
      
      if (name.includes('chest')) muscleGroups['Chest']++;
      else if (name.includes('back')) muscleGroups['Back']++;
      else if (name.includes('leg')) muscleGroups['Legs']++;
      else if (name.includes('arm')) muscleGroups['Arms']++;
      else if (name.includes('shoulder')) muscleGroups['Shoulders']++;
      else if (name.includes('core') || name.includes('abs')) muscleGroups['Core']++;
      else muscleGroups['Other']++;
    });
    
    return Object.entries(muscleGroups)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  };
  
  const muscleGroupData = generateMuscleGroupData();
  
  // Format data for monthly trends
  const generateMonthlyTrends = () => {
    const months: Record<string, { month: string, workouts: number, avgDuration: number }> = {};
    
    workouts.forEach(workout => {
      const monthKey = format(new Date(workout.date), 'MMM yyyy');
      
      if (!months[monthKey]) {
        months[monthKey] = {
          month: monthKey,
          workouts: 0,
          avgDuration: 0
        };
      }
      
      months[monthKey].workouts += 1;
      months[monthKey].avgDuration = (months[monthKey].avgDuration * (months[monthKey].workouts - 1) + workout.duration) / months[monthKey].workouts;
    });
    
    return Object.values(months);
  };
  
  const monthlyTrends = generateMonthlyTrends();
  
  // Custom tooltip formatter for charts
  const formatTooltipValue = (value: number | null) => {
    if (value === null) return 'N/A';
    return value.toFixed(1);
  };
  
  if (!userId) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-300">Please log in to view your fitness analytics</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-quantum-cyan">Fitness Analytics Dashboard</h2>
        
        <Select value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1w">Last Week</SelectItem>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-quantum-darkBlue/40 border-quantum-cyan/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Weight Change</p>
                  <p className={`text-2xl font-bold ${stats.weightChange === null ? 'text-gray-400' : 
                    stats.weightChange < 0 ? 'text-green-400' : 
                    stats.weightChange > 0 ? 'text-red-400' : 'text-gray-300'}`}>
                    {stats.weightChange === null ? 'No data' : 
                     `${stats.weightChange > 0 ? '+' : ''}${stats.weightChange.toFixed(1)} kg`}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-quantum-darkBlue/40 border-quantum-cyan/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Workouts</p>
                  <p className="text-2xl font-bold text-quantum-cyan">{stats.workoutCount}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-quantum-darkBlue/40 border-quantum-cyan/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Total Time</p>
                  <p className="text-2xl font-bold text-quantum-purple">{stats.totalDuration} min</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-quantum-darkBlue/40 border-quantum-cyan/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Calories Burned</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.totalCalories}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <Tabs 
            defaultValue={activeTab} 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="bg-quantum-black/50">
              <TabsTrigger value="weight" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Body Metrics
              </TabsTrigger>
              <TabsTrigger value="workouts" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Workout Activity
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="weight" className="space-y-6">
              {measurements.length === 0 ? (
                <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                  <CardContent className="pt-6 py-12 text-center">
                    <p className="text-gray-400 mb-2">No measurement data available</p>
                    <p className="text-sm text-gray-500">Add body measurements to see your progress charts</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Weight and Body Fat Trend */}
                  <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                    <CardHeader>
                      <CardTitle>Weight & Body Fat Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={measurementData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" stroke="#aaa" />
                            <YAxis 
                              yAxisId="left" 
                              stroke="#aaa"
                              label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', style: { fill: '#aaa' } }}
                            />
                            <YAxis 
                              yAxisId="right" 
                              orientation="right" 
                              stroke="#aaa"
                              label={{ value: 'Body Fat %', angle: 90, position: 'insideRight', style: { fill: '#aaa' } }}
                            />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#1a2138', borderColor: '#333' }}
                              formatter={(value: any) => [formatTooltipValue(value), '']}
                            />
                            <Legend />
                            <Line 
                              yAxisId="left"
                              type="monotone" 
                              dataKey="weight" 
                              stroke="#4f46e5" 
                              activeDot={{ r: 8 }} 
                              name="Weight (kg)"
                            />
                            <Line 
                              yAxisId="right"
                              type="monotone" 
                              dataKey="bodyFat" 
                              stroke="#06b6d4" 
                              activeDot={{ r: 8 }} 
                              name="Body Fat %"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Body Measurements */}
                  <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                    <CardHeader>
                      <CardTitle>Body Measurements (cm)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={measurementData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" stroke="#aaa" />
                            <YAxis stroke="#aaa" />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#1a2138', borderColor: '#333' }}
                              formatter={(value: any) => [formatTooltipValue(value), '']}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="chest" stroke="#8b5cf6" name="Chest" />
                            <Line type="monotone" dataKey="waist" stroke="#ec4899" name="Waist" />
                            <Line type="monotone" dataKey="hips" stroke="#f59e0b" name="Hips" />
                            <Line type="monotone" dataKey="arms" stroke="#10b981" name="Arms" />
                            <Line type="monotone" dataKey="legs" stroke="#6366f1" name="Legs" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="workouts" className="space-y-6">
              {workouts.length === 0 ? (
                <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                  <CardContent className="pt-6 py-12 text-center">
                    <p className="text-gray-400 mb-2">No workout data available</p>
                    <p className="text-sm text-gray-500">Complete workouts to see your activity charts</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Workout Activity */}
                  <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                    <CardHeader>
                      <CardTitle>Workout Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={workoutData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" stroke="#aaa" />
                            <YAxis stroke="#aaa" />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#1a2138', borderColor: '#333' }}
                            />
                            <Legend />
                            <Bar dataKey="count" fill="#4f46e5" name="Workout Count" />
                            <Bar dataKey="duration" fill="#06b6d4" name="Total Minutes" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Workout Distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                      <CardHeader>
                        <CardTitle>Muscle Group Focus</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={muscleGroupData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {muscleGroupData.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ backgroundColor: '#1a2138', borderColor: '#333' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
                      <CardHeader>
                        <CardTitle>Monthly Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={monthlyTrends}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                              <XAxis dataKey="month" stroke="#aaa" />
                              <YAxis stroke="#aaa" />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#1a2138', borderColor: '#333' }}
                              />
                              <Legend />
                              <Bar dataKey="workouts" fill="#8884d8" name="Workouts" />
                              <Bar dataKey="avgDuration" fill="#82ca9d" name="Avg Duration (min)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default FitnessAnalyticsDashboard;
