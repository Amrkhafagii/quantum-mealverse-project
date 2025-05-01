
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

export interface ProgressChartProps {
  data: UserMeasurement[];
  dataKey: string;
  label?: string;
  color: string;
  height?: number;
  hideLabel?: boolean;
  workoutHistory?: WorkoutHistoryItem[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ 
  data, 
  dataKey, 
  label,
  color,
  height = 300,
  hideLabel = false,
  workoutHistory = []
}) => {
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
    if (!data.length) return [];
    
    // Sort by date
    return [...data]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(m => ({
        date: new Date(m.date).toISOString().split('T')[0],
        [dataKey]: m[dataKey as keyof UserMeasurement],
      }));
  };
  
  const chartData = dataKey === 'workout' ? processWorkoutData() : processMeasurementData();
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
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
        {!hideLabel && <Legend />}
        <Line 
          type="monotone" 
          dataKey={dataKey}
          name={label || dataKey} 
          stroke={color} 
          activeDot={{ r: 8 }} 
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;
