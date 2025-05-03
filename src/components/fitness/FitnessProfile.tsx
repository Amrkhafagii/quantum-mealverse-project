
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flame, ListChecks, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useUser';
import { UserWorkoutStats } from '@/types/fitness';
import { Skeleton } from "@/components/ui/skeleton"

interface FitnessProfileProps {
  userId?: string;
}

const FitnessProfile = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<UserWorkoutStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        // Assuming 'fitness_profiles' is the correct table name
        const { data, error } = await supabase
          .from('fitness_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
        }

        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        // Use a table that exists in the database
        const { data: statsData, error: statsError } = await supabase
          .from('user_workout_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (statsError) {
          console.error("Error fetching workout stats:", statsError);
        }

        // Safely cast the data to our expected type
        setStats(statsData as unknown as UserWorkoutStats);
      } catch (error) {
        console.error("Error fetching workout stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    fetchStats();
  }, [user?.id]);

  // When accessing profile data
  // Replace weight references with goal_weight
  const displayWeight = profile?.goal_weight || 'Not Set';

  return (
    <Card className="bg-quantum-black/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Fitness Profile</span>
          <Avatar>
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>{profile?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        ) : (
          <div className="space-y-2">
            <p><strong>Username:</strong> {profile?.username || 'Not Set'}</p>
            <p><strong>Email:</strong> {user?.email || 'Not Set'}</p>
            <p><strong>Goal Weight:</strong> {displayWeight} kg</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-quantum-black/40 border-quantum-cyan/20">
            <CardContent className="flex items-center space-x-4">
              <Flame className="h-6 w-6 text-red-500" />
              <div>
                <div className="text-sm font-medium">Calories Burned</div>
                <div className="text-2xl font-bold">{stats?.calories_burned || 0}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-quantum-black/40 border-quantum-cyan/20">
            <CardContent className="flex items-center space-x-4">
              <ListChecks className="h-6 w-6 text-green-500" />
              <div>
                <div className="text-sm font-medium">Total Workouts</div>
                <div className="text-2xl font-bold">{stats?.total_workouts || 0}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Workout Streak</span>
          </div>
          <Progress value={(stats?.streak_days || 0) > 100 ? 100 : (stats?.streak_days || 0)} />
          <p className="text-sm">Current Streak: {stats?.streak_days || 0} days</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FitnessProfile;
