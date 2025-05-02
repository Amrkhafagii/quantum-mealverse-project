
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';
import { BarChart, AreaChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { WorkoutHistoryItem } from '@/types/fitness';
import { LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { CalendarIcon, ArrowUpCircle } from 'lucide-react';

interface AdvancedProgressChartsProps {
  userId?: string;
}

interface DayMap {
  [key: string]: {
    count: number;
    calories: number;
    duration: number;
  };
}

const AdvancedProgressCharts: React.FC<AdvancedProgressChartsProps> = ({ userId }) => {
  const { user } = useAuth();
  const { history, isLoading, fetchWorkoutHistory } = useWorkoutData();
  const [activeChart, setActiveChart] = useState('calories');
  const [timeframe, setTimeframe] = useState('month');
  const [chartData, setChartData] = useState<any[]>([]);
  const activeUserId = userId || user?.id;
  
  useEffect(() => {
    if (activeUserId) {
      fetchWorkoutHistory(activeUserId);
    }
  }, [activeUserId]);
  
  useEffect(() => {
    processChartData();
  }, [history, timeframe]);
  
  const processChartData = () => {
    if (!history || history.length === 0) {
      setChartData([]);
      return;
    }
    
    // Group by day
    const dayMap: DayMap = {};
    
    history.forEach(workout => {
      const dateStr = format(new Date(workout.date), 'yyyy-MM-dd');
      
      if (!dayMap[dateStr]) {
        dayMap[dateStr] = {
          count: 0,
          calories: 0,
          duration: 0
        };
      }
      
      dayMap[dateStr].count += 1;
      dayMap[dateStr].calories += workout.calories_burned || 0;
      dayMap[dateStr].duration += workout.duration;
    });
    
    // Convert to array for charts
    const data = Object.keys(dayMap).map(date => ({
      date,
      formattedDate: format(new Date(date), 'MMM dd'),
      workouts: dayMap[date].count,
      calories: dayMap[date].calories,
      duration: dayMap[date].duration
    }));
    
    // Sort by date
    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setChartData(data);
  };
  
  const getMaxValue = () => {
    if (chartData.length === 0) return 100;
    
    switch (activeChart) {
      case 'calories':
        return Math.max(...chartData.map(d => d.calories)) * 1.1;
      case 'duration':
        return Math.max(...chartData.map(d => d.duration)) * 1.1;
      case 'workouts':
        return Math.max(...chartData.map(d => d.workouts)) * 1.1;
      default:
        return 100;
    }
  };
  
  const renderChartContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-quantum-cyan"></div>
        </div>
      );
    }
    
    if (chartData.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center h-64">
          <CalendarIcon className="h-12 w-12 text-gray-500 mb-2" />
          <p className="text-gray-400">No workout data available</p>
          <p className="text-sm text-gray-500 mt-1">Complete workouts to see your progress</p>
        </div>
      );
    }
    
    const COLORS = ['#9b87f5', '#ff7285', '#33C3F0', '#4BC0C0'];
    
    return (
      <Tabs defaultValue="line" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="line">Line</TabsTrigger>
          <TabsTrigger value="bar">Bar</TabsTrigger>
          <TabsTrigger value="area">Area</TabsTrigger>
        </TabsList>
        
        <TabsContent value="line" className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="formattedDate" stroke="#718096" />
              <YAxis stroke="#718096" domain={[0, getMaxValue()]} />
              <Tooltip 
                contentStyle={{ background: '#171923', border: '1px solid #2d3748' }} 
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              {activeChart === 'calories' && (
                <Line type="monotone" dataKey="calories" stroke="#9b87f5" activeDot={{ r: 8 }} strokeWidth={2} />
              )}
              {activeChart === 'duration' && (
                <Line type="monotone" dataKey="duration" stroke="#33C3F0" activeDot={{ r: 8 }} strokeWidth={2} />
              )}
              {activeChart === 'workouts' && (
                <Line type="monotone" dataKey="workouts" stroke="#4BC0C0" activeDot={{ r: 8 }} strokeWidth={2} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
        
        <TabsContent value="bar" className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="formattedDate" stroke="#718096" />
              <YAxis stroke="#718096" domain={[0, getMaxValue()]} />
              <Tooltip 
                contentStyle={{ background: '#171923', border: '1px solid #2d3748' }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              {activeChart === 'calories' && (
                <Bar dataKey="calories" fill="#9b87f5" />
              )}
              {activeChart === 'duration' && (
                <Bar dataKey="duration" fill="#33C3F0" />
              )}
              {activeChart === 'workouts' && (
                <Bar dataKey="workouts" fill="#4BC0C0" />
              )}
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
        
        <TabsContent value="area" className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="formattedDate" stroke="#718096" />
              <YAxis stroke="#718096" domain={[0, getMaxValue()]} />
              <Tooltip 
                contentStyle={{ background: '#171923', border: '1px solid #2d3748' }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              {activeChart === 'calories' && (
                <Area type="monotone" dataKey="calories" stroke="#9b87f5" fill="#9b87f544" />
              )}
              {activeChart === 'duration' && (
                <Area type="monotone" dataKey="duration" stroke="#33C3F0" fill="#33C3F044" />
              )}
              {activeChart === 'workouts' && (
                <Area type="monotone" dataKey="workouts" stroke="#4BC0C0" fill="#4BC0C044" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    );
  };
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="flex items-center">
          <ArrowUpCircle className="mr-2 h-5 w-5 text-quantum-cyan" />
          Progress Insights
        </CardTitle>
        <div className="flex space-x-2">
          <Select value={activeChart} onValueChange={setActiveChart}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calories">Calories</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
              <SelectItem value="workouts">Workouts</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {renderChartContent()}
      </CardContent>
    </Card>
  );
};

export default AdvancedProgressCharts;
