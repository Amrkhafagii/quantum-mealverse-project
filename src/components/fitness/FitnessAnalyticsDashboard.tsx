import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isAfter, isBefore, isEqual } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutHistoryItem } from '@/types/fitness';
import { useToast } from '@/components/ui/use-toast';

const TABS = ["All Data", "Last 7 Days", "Last 30 Days", "Custom"];

export const FitnessAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(TABS[1]); // Default to Last 7 Days
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryItem[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 7),
    endDate: new Date()
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Load workout history
  useEffect(() => {
    const fetchWorkoutHistory = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('workout_history')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;
        
        // Transform data for our component
        const formattedData = data.map(item => ({
          id: item.id,
          user_id: item.user_id,
          date: item.date,
          workout_log_id: item.workout_log_id,
          workout_plan_name: item.workout_plan_name,
          workout_day_name: item.workout_day_name,
          duration: item.duration,
          exercises_completed: item.exercises_completed,
          total_exercises: item.total_exercises,
          calories_burned: item.calories_burned || 0,
          // Add properties needed for WorkoutHistoryItem type
          workout_name: item.workout_day_name, // Using workout_day_name as workout_name
          exercises_count: item.total_exercises
        }));
        
        setWorkoutHistory(formattedData);
      } catch (error) {
        console.error('Error fetching workout history:', error);
        toast({
          title: "Failed to load workout history",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkoutHistory();
  }, [toast]);

  // Update date range when tab changes
  useEffect(() => {
    let newStartDate = dateRange.startDate;
    let newEndDate = dateRange.endDate;
    
    switch (activeTab) {
      case "All Data":
        // No filter, show all data
        break;
      case "Last 7 Days":
        newStartDate = subDays(new Date(), 7);
        newEndDate = new Date();
        break;
      case "Last 30 Days":
        newStartDate = subDays(new Date(), 30);
        newEndDate = new Date();
        break;
      case "This Week":
        newStartDate = startOfWeek(new Date());
        newEndDate = endOfWeek(new Date());
        break;
      case "This Month":
        newStartDate = startOfMonth(new Date());
        newEndDate = endOfMonth(new Date());
        break;
      default:
        // Custom - keep existing range
        break;
    }
    
    setDateRange({
      startDate: newStartDate,
      endDate: newEndDate
    });
  }, [activeTab]);

  // Filter workout history based on date range
  const filteredWorkoutHistory = workoutHistory.filter(workout => {
    const workoutDate = parseISO(workout.date);
    return (
      (isAfter(workoutDate, dateRange.startDate) || isEqual(workoutDate, dateRange.startDate)) &&
      (isBefore(workoutDate, dateRange.endDate) || isEqual(workoutDate, dateRange.endDate))
    );
  });

  // Prepare chart data
  const caloriesChartData = filteredWorkoutHistory.map(workout => ({
    date: format(parseISO(workout.date), 'MMM dd'),
    calories: workout.calories_burned
  }));

  const durationChartData = filteredWorkoutHistory.map(workout => ({
    date: format(parseISO(workout.date), 'MMM dd'),
    duration: workout.duration
  }));

  // Get user stats
  const totalWorkouts = filteredWorkoutHistory.length;
  const totalCaloriesBurned = filteredWorkoutHistory.reduce((sum, workout) => sum + workout.calories_burned, 0);
  const totalDuration = filteredWorkoutHistory.reduce((sum, workout) => sum + workout.duration, 0);
  const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-3xl font-bold text-quantum-cyan">Fitness Analytics</h2>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {TABS.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Total Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkouts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Calories Burned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCaloriesBurned} kcal</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Total Workout Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Avg. Workout Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDuration} min</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calories Burned</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caloriesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calories" fill="#10b981" name="Calories" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Workout Duration</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={durationChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="duration" stroke="#6d28d9" name="Minutes" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-quantum-cyan mx-auto"></div>
          <p className="mt-4">Loading workout data...</p>
        </div>
      ) : filteredWorkoutHistory.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-400">No workout data found for the selected period.</p>
          <Button className="mt-4" variant="outline">
            <Calendar className="mr-2 h-4 w-4" /> Record a Workout
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default FitnessAnalyticsDashboard;
