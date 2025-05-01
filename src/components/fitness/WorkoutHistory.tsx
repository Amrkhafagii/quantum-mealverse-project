
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Calendar, Clock, Flame, BarChart3, ListChecks } from 'lucide-react';
import { format } from 'date-fns';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { WorkoutHistoryItem, WorkoutLog } from '@/types/fitness';
import WorkoutDetail from './WorkoutDetail';
import { supabase } from '@/integrations/supabase/client';

interface WorkoutHistoryProps {
  userId?: string;
}

const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ userId }) => {
  const { history, loadWorkoutHistory } = useWorkoutData();
  const [viewType, setViewType] = useState('list');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutHistoryItem | null>(null);
  const [workoutLog, setWorkoutLog] = useState<WorkoutLog | null>(null);
  
  // Month options for filtering
  const getMonthOptions = () => {
    const options = [{ value: 'all', label: 'All Time' }];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = format(month, 'yyyy-MM');
      const label = format(month, 'MMMM yyyy');
      options.push({ value, label });
    }
    return options;
  };
  
  useEffect(() => {
    if (userId) {
      loadWorkoutHistory(dateFilter === 'all' ? undefined : dateFilter);
    }
  }, [userId, dateFilter]);
  
  useEffect(() => {
    const fetchWorkoutLog = async () => {
      if (selectedWorkout && userId) {
        try {
          const { data, error } = await supabase
            .from('workout_logs')
            .select('*')
            .eq('id', selectedWorkout.workout_log_id)
            .single();
            
          if (error) throw error;
          
          setWorkoutLog(data as unknown as WorkoutLog);
        } catch (err) {
          console.error('Error fetching workout log:', err);
          setWorkoutLog(null);
        }
      }
    };
    
    fetchWorkoutLog();
  }, [selectedWorkout, userId]);
  
  const handleSelectWorkout = (workout: WorkoutHistoryItem) => {
    setSelectedWorkout(workout);
    setViewType('detail');
  };
  
  const handleBack = () => {
    setSelectedWorkout(null);
    setViewType('list');
  };
  
  const groupWorkoutsByMonth = () => {
    const grouped: Record<string, WorkoutHistoryItem[]> = {};
    
    history.forEach(workout => {
      const monthYear = format(new Date(workout.date), 'MMMM yyyy');
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(workout);
    });
    
    return grouped;
  };
  
  if (!userId) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-300">Please log in to view your workout history</p>
        </CardContent>
      </Card>
    );
  }
  
  if (viewType === 'detail' && selectedWorkout) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={handleBack} 
          className="mb-4"
        >
          Back to History
        </Button>
        
        <WorkoutDetail workout={selectedWorkout} workoutLog={workoutLog || undefined} />
      </div>
    );
  }
  
  const workoutsByMonth = groupWorkoutsByMonth();
  const monthOptions = getMonthOptions();
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader className="border-b border-quantum-cyan/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-2xl text-quantum-cyan">Workout History</CardTitle>
          
          <div className="w-full sm:w-auto">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center">
              <ListChecks className="h-4 w-4 mr-2" /> List View
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" /> Statistics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            {history.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-2">No workout history found</p>
                <p className="text-sm text-gray-500">Complete a workout to see it here</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(workoutsByMonth).map(([monthYear, workouts]) => (
                  <div key={monthYear} className="space-y-2">
                    <h3 className="text-lg font-medium text-quantum-cyan">{monthYear}</h3>
                    
                    <div className="space-y-2">
                      {workouts.map(workout => (
                        <div 
                          key={workout.id}
                          className="bg-quantum-darkBlue/40 p-3 rounded-md cursor-pointer hover:bg-quantum-darkBlue/60 transition-colors"
                          onClick={() => handleSelectWorkout(workout)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{workout.workout_plan_name}</h4>
                              <p className="text-sm text-gray-300">{workout.workout_day_name}</p>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center text-sm text-gray-300">
                                <Calendar className="h-4 w-4 mr-1" />
                                {format(new Date(workout.date), 'MMM d, yyyy')}
                              </div>
                              
                              <div className="flex items-center text-sm text-gray-300 mt-1">
                                <Clock className="h-4 w-4 mr-1" />
                                {workout.duration} min
                                
                                {workout.calories_burned && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <Flame className="h-4 w-4 mr-1 text-orange-400" />
                                    {workout.calories_burned} cal
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="space-y-6">
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-2">No workout data available</p>
                  <p className="text-sm text-gray-500">Complete a workout to see statistics</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-quantum-darkBlue/40 p-4 rounded-md text-center">
                      <p className="text-sm text-gray-300">Total Workouts</p>
                      <p className="text-3xl font-bold text-quantum-cyan">{history.length}</p>
                    </div>
                    
                    <div className="bg-quantum-darkBlue/40 p-4 rounded-md text-center">
                      <p className="text-sm text-gray-300">Total Time</p>
                      <p className="text-3xl font-bold text-quantum-cyan">
                        {history.reduce((sum, w) => sum + w.duration, 0)} min
                      </p>
                    </div>
                    
                    <div className="bg-quantum-darkBlue/40 p-4 rounded-md text-center">
                      <p className="text-sm text-gray-300">Calories Burned</p>
                      <p className="text-3xl font-bold text-quantum-cyan">
                        {history.reduce((sum, w) => sum + (w.calories_burned || 0), 0)}
                      </p>
                    </div>
                    
                    <div className="bg-quantum-darkBlue/40 p-4 rounded-md text-center">
                      <p className="text-sm text-gray-300">Avg. Duration</p>
                      <p className="text-3xl font-bold text-quantum-cyan">
                        {Math.round(history.reduce((sum, w) => sum + w.duration, 0) / history.length)} min
                      </p>
                    </div>
                  </div>
                  
                  {/* Additional stats can be added here */}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WorkoutHistory;
