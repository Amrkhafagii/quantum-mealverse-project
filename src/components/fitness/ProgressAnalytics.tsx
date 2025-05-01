
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Calendar, Award, Target } from 'lucide-react';
import { UserMeasurement, WorkoutLog } from '@/types/fitness';

interface ProgressAnalyticsProps {
  userId?: string;
  measurements: UserMeasurement[];
  workoutLogs?: WorkoutLog[];
}

const ProgressAnalytics = ({ userId, measurements, workoutLogs = [] }: ProgressAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [metricType, setMetricType] = useState('weight');
  
  // Filter measurements based on time range
  const getFilteredMeasurements = () => {
    if (!measurements.length) return [];
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate.setDate(now.getDate() - 30);
    }
    
    return measurements
      .filter(m => new Date(m.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  const filteredMeasurements = getFilteredMeasurements();
  
  // Calculate stats
  const calculateStats = () => {
    if (filteredMeasurements.length < 2) {
      return {
        change: 0,
        percentChange: 0,
        isPositive: true,
      };
    }
    
    const first = filteredMeasurements[0];
    const last = filteredMeasurements[filteredMeasurements.length - 1];
    
    let firstValue = 0;
    let lastValue = 0;
    
    switch (metricType) {
      case 'weight':
        firstValue = first.weight;
        lastValue = last.weight;
        break;
      case 'body_fat':
        firstValue = first.body_fat || 0;
        lastValue = last.body_fat || 0;
        break;
      case 'chest':
        firstValue = first.chest || 0;
        lastValue = last.chest || 0;
        break;
      case 'waist':
        firstValue = first.waist || 0;
        lastValue = last.waist || 0;
        break;
      default:
        firstValue = first.weight;
        lastValue = last.weight;
    }
    
    const change = lastValue - firstValue;
    const percentChange = firstValue !== 0 ? (change / firstValue) * 100 : 0;
    
    // For weight and waist, decrease is positive progress. For others, increase is positive.
    let isPositive = change < 0;
    if (metricType === 'chest' || metricType === 'arms' || metricType === 'legs') {
      isPositive = change > 0;
    }
    
    return {
      change: Math.abs(change).toFixed(1),
      percentChange: Math.abs(percentChange).toFixed(1),
      isPositive,
    };
  };
  
  const stats = calculateStats();
  
  // Format data for chart
  const chartData = filteredMeasurements.map(m => {
    const date = new Date(m.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    return {
      date: formattedDate,
      weight: m.weight,
      bodyFat: m.body_fat || null,
      chest: m.chest || null,
      waist: m.waist || null,
      arms: m.arms || null,
      legs: m.legs || null,
    };
  });
  
  const metricOptions = [
    { value: 'weight', label: 'Weight (kg)' },
    { value: 'body_fat', label: 'Body Fat %' },
    { value: 'chest', label: 'Chest (cm)' },
    { value: 'waist', label: 'Waist (cm)' },
    { value: 'arms', label: 'Arms (cm)' },
    { value: 'legs', label: 'Legs (cm)' },
  ];
  
  const getChartLine = () => {
    switch (metricType) {
      case 'weight':
        return <Line type="monotone" dataKey="weight" stroke="#06b6d4" activeDot={{ r: 8 }} />;
      case 'body_fat':
        return <Line type="monotone" dataKey="bodyFat" stroke="#8b5cf6" activeDot={{ r: 8 }} />;
      case 'chest':
        return <Line type="monotone" dataKey="chest" stroke="#22c55e" activeDot={{ r: 8 }} />;
      case 'waist':
        return <Line type="monotone" dataKey="waist" stroke="#f97316" activeDot={{ r: 8 }} />;
      case 'arms':
        return <Line type="monotone" dataKey="arms" stroke="#ec4899" activeDot={{ r: 8 }} />;
      case 'legs':
        return <Line type="monotone" dataKey="legs" stroke="#14b8a6" activeDot={{ r: 8 }} />;
      default:
        return <Line type="monotone" dataKey="weight" stroke="#06b6d4" activeDot={{ r: 8 }} />;
    }
  };
  
  // Get metric display label
  const getMetricLabel = () => {
    const found = metricOptions.find(option => option.value === metricType);
    return found ? found.label : 'Weight (kg)';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-semibold text-quantum-cyan">Progress Analytics</h2>
        
        <div className="flex flex-wrap gap-2">
          <Select value={metricType} onValueChange={setMetricType}>
            <SelectTrigger className="w-[160px] bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent className="bg-quantum-darkBlue border-quantum-cyan/20">
              {metricOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px] bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent className="bg-quantum-darkBlue border-quantum-cyan/20">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {measurements.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader className="pb-2">
                <CardDescription>Current {getMetricLabel()}</CardDescription>
                <CardTitle className="text-2xl">
                  {filteredMeasurements.length > 0
                    ? (() => {
                        const lastRecord = filteredMeasurements[filteredMeasurements.length - 1];
                        switch (metricType) {
                          case 'weight': return `${lastRecord.weight} kg`;
                          case 'body_fat': return lastRecord.body_fat ? `${lastRecord.body_fat}%` : 'N/A';
                          case 'chest': return lastRecord.chest ? `${lastRecord.chest} cm` : 'N/A';
                          case 'waist': return lastRecord.waist ? `${lastRecord.waist} cm` : 'N/A';
                          case 'arms': return lastRecord.arms ? `${lastRecord.arms} cm` : 'N/A';
                          case 'legs': return lastRecord.legs ? `${lastRecord.legs} cm` : 'N/A';
                          default: return `${lastRecord.weight} kg`;
                        }
                      })()
                    : 'No data'
                  }
                </CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader className="pb-2">
                <CardDescription>Change</CardDescription>
                <CardTitle className="text-2xl flex items-center">
                  {filteredMeasurements.length > 1 ? (
                    <>
                      {stats.isPositive ? (
                        <ArrowUpRight className="text-green-500 mr-1 h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="text-red-500 mr-1 h-5 w-5" />
                      )}
                      {stats.change} {metricType === 'body_fat' ? '%' : 'kg'}
                    </>
                  ) : (
                    'Not enough data'
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
              <CardHeader className="pb-2">
                <CardDescription>Percent Change</CardDescription>
                <CardTitle className="text-2xl flex items-center">
                  {filteredMeasurements.length > 1 ? (
                    <>
                      {stats.isPositive ? (
                        <ArrowUpRight className="text-green-500 mr-1 h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="text-red-500 mr-1 h-5 w-5" />
                      )}
                      {stats.percentChange}%
                    </>
                  ) : (
                    'Not enough data'
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
          
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle>Progress Chart</CardTitle>
              <CardDescription>
                Tracking your {getMetricLabel().toLowerCase()} over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 1 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" tick={{ fill: '#ccc' }} />
                      <YAxis tick={{ fill: '#ccc' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                      <Legend />
                      {getChartLine()}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  <p>Not enough data to display chart. Add at least two measurements.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-quantum-cyan" />
            <h3 className="text-xl font-semibold mb-2">No Measurement Data Available</h3>
            <p className="text-gray-300 mb-4">
              Add body measurements to start tracking your progress.
            </p>
            <Button 
              className="bg-quantum-purple hover:bg-quantum-purple/90"
            >
              Add Measurements
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="pt-6">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-quantum-purple" />
            <h3 className="text-lg font-semibold text-center">Consistency Tracking</h3>
            <p className="text-center text-gray-400 text-sm mt-2">Coming Soon</p>
            <p className="text-center text-gray-300 mt-4">
              Track your workout consistency and build habits that last.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="pt-6">
            <Target className="h-12 w-12 mx-auto mb-4 text-quantum-cyan" />
            <h3 className="text-lg font-semibold text-center">Goal Progress</h3>
            <p className="text-center text-gray-400 text-sm mt-2">Coming Soon</p>
            <p className="text-center text-gray-300 mt-4">
              Visualize your progress toward your fitness goals.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="pt-6">
            <Award className="h-12 w-12 mx-auto mb-4 text-quantum-purple" />
            <h3 className="text-lg font-semibold text-center">Achievements</h3>
            <p className="text-center text-gray-400 text-sm mt-2">Coming Soon</p>
            <p className="text-center text-gray-300 mt-4">
              Earn achievements as you reach fitness milestones.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressAnalytics;
