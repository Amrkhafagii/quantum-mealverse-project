
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserWorkoutStats } from '@/types/fitness';
import { Activity, Award, Calendar, LineChart, TrendingUp, Users } from 'lucide-react';

interface FitnessOverviewProps {
  userId?: string;
  workoutStats?: UserWorkoutStats;
}

export const FitnessOverview: React.FC<FitnessOverviewProps> = ({
  userId,
  workoutStats
}) => {
  const stats = workoutStats || {
    streak: 0,
    total_workouts: 0,
    most_active_day: 'N/A'
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Activity className="mr-2 h-5 w-5 text-quantum-cyan" />
              Workout Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{stats.total_workouts}</div>
            <p className="text-gray-400 text-sm">Total workouts completed</p>
          </CardContent>
        </Card>
        
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-quantum-cyan" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{stats.streak} days</div>
            <p className="text-gray-400 text-sm">Keep it going!</p>
          </CardContent>
        </Card>
        
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-quantum-cyan" />
              Most Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{stats.most_active_day}</div>
            <p className="text-gray-400 text-sm">Your best workout day</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle>Workout Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">
            Your fitness journey is progressing well. Keep up your {stats.streak}-day streak for maximum results.
            {stats.total_workouts > 0 
              ? ` You've completed ${stats.total_workouts} workouts so far, with your best performance on ${stats.most_active_day}s.` 
              : ' Start your first workout today to begin tracking your progress!'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
