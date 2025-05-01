
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { WorkoutHistoryItem, UserMeasurement } from '@/types/fitness';

interface ProgressChartProps {
  workoutHistory: WorkoutHistoryItem[];
  measurements: UserMeasurement[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ workoutHistory, measurements }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState('workouts');

  // Process workout history data for charting
  const processWorkoutData = () => {
    if (!workoutHistory.length) return [];
    
    // Sort by date
    const sortedHistory = [...workoutHistory].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Group by date and count workouts, duration, etc.
    const dataMap = new Map();
    
    sortedHistory.forEach(item => {
      const date = new Date(item.date);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, {
          date: dateKey,
          workouts: 0,
          duration: 0,
          caloriesBurned: 0,
        });
      }
      
      const entry = dataMap.get(dateKey);
      entry.workouts += 1;
      entry.duration += item.duration;
      entry.caloriesBurned += item.calories_burned || 0;
    });
    
    return Array.from(dataMap.values());
  };
  
  // Process measurement data for charting
  const processMeasurementData = () => {
    if (!measurements.length) return [];
    
    // Sort by date
    return [...measurements]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(m => ({
        date: new Date(m.date).toISOString().split('T')[0],
        weight: m.weight,
        bodyFat: m.body_fat,
      }));
  };
  
  const workoutData = processWorkoutData();
  const measurementData = processMeasurementData();
  
  return (
    <Card className="bg-quantum-darkBlue/30 border border-quantum-cyan/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-quantum-cyan">Progress Analytics</CardTitle>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={chartType} onValueChange={setChartType} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="bodyFat">Body Fat</TabsTrigger>
          </TabsList>
          
          <TabsContent value="workouts" className="mt-4">
            {workoutData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workoutData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#ccc' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis yAxisId="left" tick={{ fill: '#ccc' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#ccc' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #16213e', color: '#fff' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="workouts" name="Workouts" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="duration" name="Duration (min)" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10 text-gray-400">
                No workout history data available
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="weight" className="mt-4">
            {measurementData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={measurementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#ccc' }} 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis tick={{ fill: '#ccc' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #16213e', color: '#fff' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#82ca9d" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10 text-gray-400">
                No weight measurement data available
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="bodyFat" className="mt-4">
            {measurementData.filter(m => m.bodyFat).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={measurementData.filter(m => m.bodyFat)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#ccc' }} 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis tick={{ fill: '#ccc' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #16213e', color: '#fff' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="bodyFat" 
                    stroke="#ff8042" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10 text-gray-400">
                No body fat measurement data available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
