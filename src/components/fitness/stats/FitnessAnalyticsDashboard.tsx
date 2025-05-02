
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ProgressChart from './ProgressChart';
import { BarChart, CheckCircle, LineChart, TrendingUp, Users } from 'lucide-react';

interface FitnessAnalyticsDashboardProps {
  userId?: string;
}

const FitnessAnalyticsDashboard: React.FC<FitnessAnalyticsDashboardProps> = ({ userId }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('weight');
  const [weightData, setWeightData] = useState<any[]>([]);
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (userId || user?.id) {
      fetchData();
    }
  }, [userId, user]);
  
  const fetchData = async () => {
    setIsLoading(true);
    const id = userId || user?.id;
    if (!id) return;
    
    try {
      // Fetch weight measurements
      const { data: measurements } = await supabase
        .from('body_measurements')
        .select('date, weight, body_fat, chest, waist, arms, legs')
        .eq('user_id', id)
        .order('date', { ascending: true });
        
      if (measurements) {
        setWeightData(measurements.map((m: any) => ({
          date: m.date,
          value: m.weight,
          bodyFat: m.body_fat,
          chest: m.chest,
          waist: m.waist,
          arms: m.arms,
          legs: m.legs
        })));
      }
      
      // Fetch workout data
      const { data: workouts } = await supabase
        .from('workout_logs')
        .select('date, duration, calories_burned')
        .eq('user_id', id)
        .order('date', { ascending: true });
        
      if (workouts) {
        setWorkoutData(workouts.map((w: any) => ({
          date: w.date,
          value: w.duration,
          calories: w.calories_burned
        })));
      }
    } catch (error) {
      console.error('Error fetching fitness data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-quantum-cyan" />
          Fitness Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="weight" className="flex items-center">
              <BarChart className="h-4 w-4 mr-2" /> Weight Tracking
            </TabsTrigger>
            <TabsTrigger value="workouts" className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" /> Workout Analysis
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center">
              <Users className="h-4 w-4 mr-2" /> Community Comparison
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="weight" className="space-y-4">
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-quantum-cyan"></div>
              </div>
            ) : weightData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-400">No weight data available. Add measurements to see your progress.</p>
              </div>
            ) : (
              <ProgressChart
                title="Weight Tracking"
                data={weightData}
                dataKey="value"
                unit="kg"
                color="#9b87f5"
                showSelect={true}
              />
            )}
          </TabsContent>
          
          <TabsContent value="workouts" className="space-y-4">
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-quantum-cyan"></div>
              </div>
            ) : workoutData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-400">No workout data available. Complete workouts to see your statistics.</p>
              </div>
            ) : (
              <ProgressChart
                title="Workout Duration"
                data={workoutData}
                dataKey="value"
                unit="min"
                color="#33C3F0"
                showSelect={true}
              />
            )}
          </TabsContent>
          
          <TabsContent value="comparison">
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-gray-400">Community comparison features coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FitnessAnalyticsDashboard;
