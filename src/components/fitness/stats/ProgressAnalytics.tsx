import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Activity, Calendar, TrendingUp, Trophy } from 'lucide-react';
import { startOfWeek, endOfWeek, format } from 'date-fns';

interface ProgressAnalyticsProps {
  userId?: string;
}

interface WeeklyProgress {
  workouts: number;
  calories: number;
  duration: number;
  points: number;
}

const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ userId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress>({
    workouts: 0,
    calories: 0,
    duration: 0,
    points: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const activeUserId = userId || user?.id;
  
  useEffect(() => {
    if (activeUserId) {
      fetchWeeklyProgress();
    }
    // eslint-disable-next-line
  }, [activeUserId]);
  
  const fetchWeeklyProgress = async () => {
    try {
      setIsLoading(true);
      
      const start = startOfWeek(new Date());
      const end = endOfWeek(new Date());
      
      // Explicit 'any[]' to break recursion bug in TS
      const { data: workouts, error } = await supabase
        .from('workout_logs')
        .select('calories_burned, duration')
        .eq('user_id', activeUserId)
        .gte('date', start.toISOString())
        .lte('date', end.toISOString());

      if (error) throw error;
      
      if (workouts && Array.isArray(workouts)) {
        const totalCalories = (workouts as any[]).reduce((sum, workout) => sum + (workout.calories_burned || 0), 0);
        const totalDuration = (workouts as any[]).reduce((sum, workout) => sum + (workout.duration || 0), 0);
        
        setWeeklyProgress({
          workouts: workouts.length,
          calories: totalCalories,
          duration: totalDuration,
          points: 0 // Default to 0 since points_earned may not exist
        });
      }
    } catch (error) {
      console.error('Error fetching weekly progress:', error);
      toast({
        description: "Failed to load weekly progress data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5 text-quantum-cyan" />
          This Week's Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-400 mb-4 flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          <span>
            {format(startOfWeek(new Date()), 'MMM dd')} - {format(endOfWeek(new Date()), 'MMM dd, yyyy')}
          </span>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-quantum-cyan"></div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-quantum-black/30 p-4 rounded-lg text-center border border-quantum-cyan/10">
              <div className="text-sm text-gray-400 mb-1">Workouts</div>
              <div className="text-2xl font-bold">{weeklyProgress.workouts}</div>
            </div>
            
            <div className="bg-quantum-black/30 p-4 rounded-lg text-center border border-quantum-cyan/10">
              <div className="text-sm text-gray-400 mb-1">Duration</div>
              <div className="text-2xl font-bold">{weeklyProgress.duration}<span className="text-sm ml-1">min</span></div>
            </div>
            
            <div className="bg-quantum-black/30 p-4 rounded-lg text-center border border-quantum-cyan/10">
              <div className="text-sm text-gray-400 mb-1">Calories</div>
              <div className="text-2xl font-bold">{weeklyProgress.calories}</div>
            </div>
            
            <div className="bg-quantum-black/30 p-4 rounded-lg text-center border border-quantum-cyan/10">
              <div className="text-sm text-gray-400 mb-1 flex items-center justify-center">
                <Trophy className="h-4 w-4 mr-1 text-yellow-400" />Points
              </div>
              <div className="text-2xl font-bold">{weeklyProgress.points}</div>
            </div>
          </div>
        )}
        
        <div className="mt-4 flex justify-center">
          <div className="text-sm text-quantum-cyan flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            {weeklyProgress.workouts === 0 
              ? "Complete your first workout this week" 
              : `${weeklyProgress.workouts} workouts this week`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressAnalytics;
