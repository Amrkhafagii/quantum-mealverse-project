
import React, { useState, useEffect } from 'react';
import { UserWorkoutStats } from '@/types/fitness';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Calendar, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FitnessOverviewProps {
  userId?: string;
  workoutStats?: UserWorkoutStats;
}

export const FitnessOverview: React.FC<FitnessOverviewProps> = ({ userId, workoutStats = {} }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId]);

  const fetchUserProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('fitness_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // not found is okay
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching fitness profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Safely access potentially undefined properties
  const { total_workouts = 0, streak_days = 0, streak = 0, most_active_day = 'N/A' } = workoutStats || {};
  const achievementsCount = workoutStats?.achievements || 0;
  const recentWorkouts = workoutStats?.recent_workouts || [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-quantum-darkBlue/30 rounded-lg border border-quantum-cyan/20 p-6">
        <h2 className="text-2xl font-bold text-quantum-cyan mb-4">
          Welcome, {profile?.display_name || 'Fitness Enthusiast'}!
        </h2>
        <p className="text-gray-300">
          Track your fitness journey, set goals, and monitor your progress all in one place.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-quantum-darkBlue/30 border-quantum-purple/20">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="rounded-full bg-purple-500/10 p-3">
              <Dumbbell className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-300">Total Workouts</h3>
              <p className="text-2xl font-bold text-quantum-cyan">{total_workouts}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="rounded-full bg-cyan-500/10 p-3">
              <Calendar className="h-6 w-6 text-cyan-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-300">Current Streak</h3>
              <p className="text-2xl font-bold text-quantum-cyan">{streak_days || streak || 0} days</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-quantum-darkBlue/30 border-quantum-purple/20">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="rounded-full bg-amber-500/10 p-3">
              <Trophy className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-300">Achievements</h3>
              <p className="text-2xl font-bold text-quantum-cyan">{achievementsCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="text-quantum-cyan">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {(recentWorkouts && recentWorkouts.length > 0) ? (
            <div className="space-y-4">
              {recentWorkouts.map((workout, index) => (
                <div key={index} className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <div>
                    <p className="font-medium">{workout.name || `Workout ${index + 1}`}</p>
                    <p className="text-sm text-gray-400">{workout.date}</p>
                  </div>
                  <span className="text-quantum-purple">{workout.duration} min</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No recent workouts found. Start your fitness journey today!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
