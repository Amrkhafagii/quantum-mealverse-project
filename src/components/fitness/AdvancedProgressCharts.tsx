
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { format, subDays, subMonths, subYears, parseISO } from 'date-fns';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { WorkoutHistoryItem, UserMeasurement } from '@/types/fitness';
import { useWorkoutData } from '@/hooks/useWorkoutData';

interface AdvancedProgressChartsProps {
  userId?: string;
  measurements: UserMeasurement[];
  workoutHistory?: WorkoutHistoryItem[];
}

const AdvancedProgressCharts: React.FC<AdvancedProgressChartsProps> = ({ 
  userId, 
  measurements,
  workoutHistory = []
}) => {
  const { loadWorkoutHistory, history } = useWorkoutData();
  const [timeRange, setTimeRange] = useState<'1w' | '1m' | '3m' | '6m' | '1y' | 'all'>('1m');
  const [chartType, setChartType] = useState('progression');
  
  // Initialize with workout history if provided, otherwise use from hook
  const [localWorkoutHistory, setLocalWorkoutHistory] = useState<WorkoutHistoryItem[]>(workoutHistory);
  
  useEffect(() => {
    if (userId) {
      loadWorkoutHistory().then(() => {
        if (history.length > 0) {
          setLocalWorkoutHistory(history);
        }
      });
    }
  }, [userId]);
  
  useEffect(() => {
    if (workoutHistory.length > 0) {
      setLocalWorkoutHistory(workoutHistory);
    } else if (history.length > 0) {
      setLocalWorkoutHistory(history);
    }
  }, [workoutHistory, history]);
  
  const [filteredMeasurements, setFilteredMeasurements] = useState<UserMeasurement[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutHistoryItem[]>([]);
  
  useEffect(() => {
    filterDataByTimeRange();
  }, [timeRange, measurements, localWorkoutHistory]);
  
  const filterDataByTimeRange = () => {
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeRange) {
      case '1w':
        cutoffDate = subDays(now, 7);
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
      case '1y':
        cutoffDate = subYears(now, 1);
        break;
      default:
        // "all" timeframe - no filtering
        setFilteredMeasurements([...measurements].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
        setFilteredWorkouts([...localWorkoutHistory].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
        return;
    }
    
    // Filter measurements
    const filteredMeasurements = measurements.filter(m => 
      new Date(m.date) >= cutoffDate
    ).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setFilteredMeasurements(filteredMeasurements);
    
    // Filter workouts
    const filteredWorkouts = localWorkoutHistory.filter(w => 
      new Date(w.date) >= cutoffDate
    ).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setFilteredWorkouts(filteredWorkouts);
  };
  
  // Process measurement data for weight and body fat tracking
  const processBodyCompositionData = () => {
    if (filteredMeasurements.length === 0) return [];
    
    return filteredMeasurements.map(m => ({
      date: format(parseISO(m.date), 'MMM dd'),
      weight: m.weight,
      bodyFat: m.body_fat || null,
      // Calculate lean body mass if both weight and body fat are available
      leanMass: m.weight && m.body_fat ? 
        parseFloat((m.weight * (1 - m.body_fat / 100)).toFixed(1)) : null
    }));
  };
  
  // Process measurement data for body measurements
  const processBodyMeasurementsData = () => {
    if (filteredMeasurements.length === 0) return [];
    
    return filteredMeasurements.map(m => ({
      date: format(parseISO(m.date), 'MMM dd'),
      chest: m.chest || null,
      waist: m.waist || null,
      hips: m.hips || null,
      arms: m.arms || null,
      legs: m.legs || null
    }));
  };
  
  // Process workout data for frequency, intensity, and volume
  const processWorkoutData = () => {
    if (filteredWorkouts.length === 0) return {
      frequency: [],
      intensity: [],
      volume: []
    };
    
    // Group workouts by week for frequency chart
    const weekMap = new Map();
    filteredWorkouts.forEach(workout => {
      const date = new Date(workout.date);
      // Get the week start date
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Set to Sunday
      const weekKey = format(weekStart, 'MMM dd');
      
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { week: weekKey, count: 0 });
      }
      
      const entry = weekMap.get(weekKey);
      entry.count += 1;
    });
    
    // Create frequency data
    const frequencyData = Array.from(weekMap.values());
    
    // Create intensity data (average calories burned per workout over time)
    const intensityMap = new Map();
    filteredWorkouts.forEach(workout => {
      const dateKey = format(parseISO(workout.date), 'MMM dd');
      
      if (!intensityMap.has(dateKey)) {
        intensityMap.set(dateKey, { 
          date: dateKey, 
          calories: 0,
          count: 0,
          duration: 0
        });
      }
      
      const entry = intensityMap.get(dateKey);
      if (workout.calories_burned) {
        entry.calories += workout.calories_burned;
      }
      entry.duration += workout.duration;
      entry.count += 1;
    });
    
    // Calculate averages
    const intensityData = Array.from(intensityMap.values()).map(entry => ({
      date: entry.date,
      avgCalories: entry.count > 0 ? Math.round(entry.calories / entry.count) : 0,
      avgDuration: entry.count > 0 ? Math.round(entry.duration / entry.count) : 0
    }));
    
    // Create workout volume data (total exercises completed over time)
    const volumeData = filteredWorkouts.map(workout => ({
      date: format(parseISO(workout.date), 'MMM dd'),
      exercises: workout.exercises_completed,
      duration: workout.duration
    }));
    
    return {
      frequency: frequencyData,
      intensity: intensityData,
      volume: volumeData
    };
  };
  
  // Prepare data for different chart types
  const bodyCompositionData = processBodyCompositionData();
  const bodyMeasurementsData = processBodyMeasurementsData();
  const workoutData = processWorkoutData();
  
  // Get change statistics
  const getChange = (property: keyof UserMeasurement) => {
    if (filteredMeasurements.length < 2) return null;
    
    const oldest = filteredMeasurements[0][property] as number;
    const newest = filteredMeasurements[filteredMeasurements.length - 1][property] as number;
    
    if (typeof oldest !== 'number' || typeof newest !== 'number') return null;
    return newest - oldest;
  };
  
  const weightChange = getChange('weight');
  const bodyFatChange = getChange('body_fat');
  
  // Helper for rendering change values
  const renderChangeValue = (value: number | null, unit: string) => {
    if (value === null) return 'No data';
    
    const formattedValue = Math.abs(value).toFixed(1);
    const prefix = value > 0 ? '+' : value < 0 ? '-' : '';
    return `${prefix}${formattedValue}${unit}`;
  };
  
  const getChangeClass = (value: number | null, isPositiveGood = false) => {
    if (value === null) return 'text-gray-400';
    
    // For weight and waist, negative is generally considered good
    // For muscle measurements, positive is generally considered good
    const isGood = isPositiveGood ? value > 0 : value < 0;
    
    return isGood ? 'text-green-400' : value === 0 ? 'text-gray-300' : 'text-red-400';
  };
  
  // Calculate workout stats
  const calculateWorkoutStats = () => {
    if (filteredWorkouts.length === 0) {
      return {
        totalWorkouts: 0,
        avgCalories: 0,
        avgDuration: 0,
        completionRate: 0
      };
    }
    
    const totalWorkouts = filteredWorkouts.length;
    const totalCalories = filteredWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
    const totalDuration = filteredWorkouts.reduce((sum, w) => sum + w.duration, 0);
    
    const totalExercisesCompleted = filteredWorkouts.reduce((sum, w) => sum + w.exercises_completed, 0);
    const totalExercisesScheduled = filteredWorkouts.reduce((sum, w) => sum + w.total_exercises, 0);
    const completionRate = totalExercisesScheduled > 0 ? 
      (totalExercisesCompleted / totalExercisesScheduled) * 100 : 0;
    
    return {
      totalWorkouts,
      avgCalories: Math.round(totalCalories / totalWorkouts),
      avgDuration: Math.round(totalDuration / totalWorkouts),
      completionRate: Math.round(completionRate)
    };
  };
  
  const workoutStats = calculateWorkoutStats();

  // COLORS for charts
  const COLORS = {
    weight: '#4f46e5', // Indigo
    bodyFat: '#ef4444', // Red
    leanMass: '#10b981', // Green
    chest: '#8b5cf6', // Purple
    waist: '#ec4899', // Pink
    hips: '#f59e0b', // Amber
    arms: '#06b6d4', // Cyan
    legs: '#84cc16', // Lime
    frequency: '#8b5cf6', // Purple
    calories: '#ef4444', // Red
    duration: '#06b6d4', // Cyan
    exercises: '#10b981', // Green
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-quantum-darkBlue/30 border border-quantum-cyan/20">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl font-bold text-quantum-cyan">Advanced Progress Analytics</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-[180px] bg-quantum-black/50">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progression">Body Progression</SelectItem>
                  <SelectItem value="measurements">Body Measurements</SelectItem>
                  <SelectItem value="workout">Workout Analysis</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
                <SelectTrigger className="w-[180px] bg-quantum-black/50">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1w">1 Week</SelectItem>
                  <SelectItem value="1m">1 Month</SelectItem>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {chartType === 'progression' || chartType === 'measurements' ? (
              <>
                <Card className="bg-quantum-black/50 border border-quantum-purple/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-400 mb-1">Weight Change</p>
                      <p className={`text-2xl font-bold ${getChangeClass(weightChange)}`}>
                        {renderChangeValue(weightChange, ' kg')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-quantum-black/50 border border-quantum-purple/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-400 mb-1">Body Fat Change</p>
                      <p className={`text-2xl font-bold ${getChangeClass(bodyFatChange)}`}>
                        {renderChangeValue(bodyFatChange, '%')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-quantum-black/50 border border-quantum-purple/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-400 mb-1">Measurements</p>
                      <p className="text-2xl font-bold text-quantum-cyan">
                        {filteredMeasurements.length}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-quantum-black/50 border border-quantum-purple/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-400 mb-1">Latest Weight</p>
                      <p className="text-2xl font-bold text-quantum-cyan">
                        {filteredMeasurements.length > 0 ? 
                          `${filteredMeasurements[filteredMeasurements.length - 1].weight} kg` : 
                          'No data'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card className="bg-quantum-black/50 border border-quantum-purple/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-400 mb-1">Total Workouts</p>
                      <p className="text-2xl font-bold text-quantum-cyan">{workoutStats.totalWorkouts}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-quantum-black/50 border border-quantum-purple/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-400 mb-1">Avg. Duration</p>
                      <p className="text-2xl font-bold text-quantum-cyan">{workoutStats.avgDuration} min</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-quantum-black/50 border border-quantum-purple/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-400 mb-1">Avg. Calories</p>
                      <p className="text-2xl font-bold text-quantum-cyan">{workoutStats.avgCalories}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-quantum-black/50 border border-quantum-purple/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-400 mb-1">Completion Rate</p>
                      <p className="text-2xl font-bold text-quantum-cyan">{workoutStats.completionRate}%</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          
          {/* Charts Section */}
          {chartType === 'progression' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-3 text-quantum-cyan">Weight & Body Fat</h3>
                {bodyCompositionData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center bg-quantum-black/30 rounded-lg">
                    <p className="text-gray-400">No data available for the selected time period</p>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={bodyCompositionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="date" tick={{ fill: '#ccc' }} />
                        <YAxis yAxisId="left" tick={{ fill: '#ccc' }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fill: '#ccc' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #16213e', color: '#fff' }}
                          formatter={(value, name) => {
                            if (name === 'weight') return [`${value} kg`, 'Weight'];
                            if (name === 'bodyFat') return [`${value}%`, 'Body Fat'];
                            if (name === 'leanMass') return [`${value} kg`, 'Lean Mass'];
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="weight" 
                          name="Weight" 
                          stroke={COLORS.weight} 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="bodyFat" 
                          name="Body Fat %" 
                          stroke={COLORS.bodyFat} 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="leanMass" 
                          name="Lean Mass" 
                          stroke={COLORS.leanMass} 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {chartType === 'measurements' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-3 text-quantum-cyan">Body Measurements</h3>
                {bodyMeasurementsData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center bg-quantum-black/30 rounded-lg">
                    <p className="text-gray-400">No data available for the selected time period</p>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={bodyMeasurementsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="date" tick={{ fill: '#ccc' }} />
                        <YAxis tick={{ fill: '#ccc' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #16213e', color: '#fff' }}
                          formatter={(value, name) => {
                            return [`${value} cm`, name.charAt(0).toUpperCase() + name.slice(1)];
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="chest" name="Chest" stroke={COLORS.chest} strokeWidth={2} />
                        <Line type="monotone" dataKey="waist" name="Waist" stroke={COLORS.waist} strokeWidth={2} />
                        <Line type="monotone" dataKey="hips" name="Hips" stroke={COLORS.hips} strokeWidth={2} />
                        <Line type="monotone" dataKey="arms" name="Arms" stroke={COLORS.arms} strokeWidth={2} />
                        <Line type="monotone" dataKey="legs" name="Legs" stroke={COLORS.legs} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {chartType === 'workout' && (
            <Tabs defaultValue="frequency" className="mt-1">
              <TabsList className="bg-quantum-black/50 mb-4">
                <TabsTrigger value="frequency">Frequency</TabsTrigger>
                <TabsTrigger value="intensity">Intensity</TabsTrigger>
                <TabsTrigger value="volume">Volume</TabsTrigger>
              </TabsList>
              
              <TabsContent value="frequency">
                <h3 className="text-lg font-medium mb-3 text-quantum-cyan">Weekly Workout Frequency</h3>
                {workoutData.frequency.length === 0 ? (
                  <div className="h-64 flex items-center justify-center bg-quantum-black/30 rounded-lg">
                    <p className="text-gray-400">No workout data available for the selected time period</p>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={workoutData.frequency}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="week" tick={{ fill: '#ccc' }} />
                        <YAxis tick={{ fill: '#ccc' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #16213e', color: '#fff' }}
                          formatter={(value, name) => {
                            return [value, 'Workouts'];
                          }}
                        />
                        <Legend />
                        <Bar dataKey="count" name="Workouts" fill={COLORS.frequency} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="intensity">
                <h3 className="text-lg font-medium mb-3 text-quantum-cyan">Workout Intensity</h3>
                {workoutData.intensity.length === 0 ? (
                  <div className="h-64 flex items-center justify-center bg-quantum-black/30 rounded-lg">
                    <p className="text-gray-400">No intensity data available for the selected time period</p>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={workoutData.intensity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="date" tick={{ fill: '#ccc' }} />
                        <YAxis yAxisId="left" tick={{ fill: '#ccc' }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fill: '#ccc' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #16213e', color: '#fff' }}
                          formatter={(value, name) => {
                            if (name === 'avgCalories') return [`${value} cal`, 'Avg. Calories'];
                            if (name === 'avgDuration') return [`${value} min`, 'Avg. Duration'];
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="avgCalories" 
                          name="Calories" 
                          stroke={COLORS.calories} 
                          strokeWidth={2} 
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="avgDuration" 
                          name="Duration" 
                          stroke={COLORS.duration} 
                          strokeWidth={2} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="volume">
                <h3 className="text-lg font-medium mb-3 text-quantum-cyan">Workout Volume</h3>
                {workoutData.volume.length === 0 ? (
                  <div className="h-64 flex items-center justify-center bg-quantum-black/30 rounded-lg">
                    <p className="text-gray-400">No volume data available for the selected time period</p>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={workoutData.volume}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="date" tick={{ fill: '#ccc' }} />
                        <YAxis tick={{ fill: '#ccc' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #16213e', color: '#fff' }}
                          formatter={(value, name) => {
                            if (name === 'exercises') return [value, 'Exercises'];
                            if (name === 'duration') return [`${value} min`, 'Duration'];
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="exercises" 
                          name="Exercises" 
                          stroke={COLORS.exercises} 
                          fill={COLORS.exercises} 
                          fillOpacity={0.2} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="duration" 
                          name="Duration (min)" 
                          stroke={COLORS.duration} 
                          fill={COLORS.duration} 
                          fillOpacity={0.2} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedProgressCharts;
