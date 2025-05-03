
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { WorkoutHistoryItem } from '@/types/fitness';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdvancedProgressChartsProps {
  userId?: string;
  workoutHistory?: WorkoutHistoryItem[];
}

const AdvancedProgressCharts: React.FC<AdvancedProgressChartsProps> = ({ 
  userId,
  workoutHistory = [] 
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'duration' | 'calories_burned' | 'exercises_completed'>('duration');
  const [activeTab, setActiveTab] = useState<'trends' | 'distribution'>('trends');

  // Placeholder data - in a real app, you would filter and process workoutHistory here
  const chartData = [
    { day: 'Mon', duration: 45, calories_burned: 320, exercises_completed: 12 },
    { day: 'Tue', duration: 0, calories_burned: 0, exercises_completed: 0 },
    { day: 'Wed', duration: 60, calories_burned: 450, exercises_completed: 15 },
    { day: 'Thu', duration: 30, calories_burned: 200, exercises_completed: 8 },
    { day: 'Fri', duration: 0, calories_burned: 0, exercises_completed: 0 },
    { day: 'Sat', duration: 90, calories_burned: 600, exercises_completed: 20 },
    { day: 'Sun', duration: 45, calories_burned: 350, exercises_completed: 14 },
  ];

  const metricLabels = {
    duration: 'Workout Duration (minutes)',
    calories_burned: 'Calories Burned',
    exercises_completed: 'Exercises Completed'
  };

  const pieData = [
    { name: 'Chest', value: 25 },
    { name: 'Back', value: 20 },
    { name: 'Legs', value: 30 },
    { name: 'Arms', value: 15 },
    { name: 'Core', value: 10 }
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="text-quantum-cyan">Workout Progress Analytics</CardTitle>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Time Range:</span>
            <Select value={selectedTimeRange} onValueChange={(value) => setSelectedTimeRange(value as any)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Metric:</span>
            <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="calories_burned">Calories Burned</SelectItem>
                <SelectItem value="exercises_completed">Exercises Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab as any}>
          <TabsList className="mb-4">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="distribution">Muscle Distribution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trends" className="pt-2">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="day" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Legend />
                  <Line type="monotone" dataKey={selectedMetric} stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Stats Summary</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-quantum-black/40 p-3 rounded">
                  <div className="text-xs text-gray-400">Total Workouts</div>
                  <div className="text-xl font-bold">{workoutHistory.length || chartData.filter(d => d.duration > 0).length}</div>
                </div>
                <div className="bg-quantum-black/40 p-3 rounded">
                  <div className="text-xs text-gray-400">Avg. Duration</div>
                  <div className="text-xl font-bold">{Math.round(chartData.reduce((acc, curr) => acc + curr.duration, 0) / chartData.filter(d => d.duration > 0).length)} min</div>
                </div>
                <div className="bg-quantum-black/40 p-3 rounded">
                  <div className="text-xs text-gray-400">Max Calories</div>
                  <div className="text-xl font-bold">{Math.max(...chartData.map(d => d.calories_burned))}</div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="distribution">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <Badge variant="outline" className="bg-quantum-black/20">
                    {item.name}: {item.value}%
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedProgressCharts;
