import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, Dumbbell, Flame } from 'lucide-react';
import ProgressChart from './ProgressChart';

interface FitnessAnalyticsDashboardProps {
  userId?: string;
}

const FitnessAnalyticsDashboard: React.FC<FitnessAnalyticsDashboardProps> = ({ userId }) => {
  // Mock data for demonstration
  const workoutData = [
    { name: "Sun", workouts: 2 },
    { name: "Mon", workouts: 3 },
    { name: "Tue", workouts: 1 },
    { name: "Wed", workouts: 4 },
    { name: "Thu", workouts: 2 },
    { name: "Fri", workouts: 5 },
    { name: "Sat", workouts: 1 },
  ];

  const stepsData = [
    { name: "Sun", steps: 5000 },
    { name: "Mon", steps: 7500 },
    { name: "Tue", steps: 4000 },
    { name: "Wed", steps: 9000 },
    { name: "Thu", steps: 6000 },
    { name: "Fri", steps: 11000 },
    { name: "Sat", steps: 3000 },
  ];

  const caloriesData = [
    { name: "Sun", calories: 200 },
    { name: "Mon", calories: 300 },
    { name: "Tue", calories: 150 },
    { name: "Wed", calories: 400 },
    { name: "Thu", calories: 250 },
    { name: "Fri", calories: 450 },
    { name: "Sat", calories: 100 },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* Total Workouts Card */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-quantum-cyan" />
            Total Workouts
          </CardTitle>
          <CardDescription>Lifetime workout count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">150</div>
          <p className="text-sm text-gray-400">+12 this month</p>
        </CardContent>
      </Card>

      {/* Steps Taken Card */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-quantum-cyan" />
            Steps Taken
          </CardTitle>
          <CardDescription>Total steps this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">42,500</div>
          <p className="text-sm text-gray-400">+5,000 from last week</p>
        </CardContent>
      </Card>

      {/* Calories Burned Card */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-quantum-cyan" />
            Calories Burned
          </CardTitle>
          <CardDescription>Total calories burned this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">1,450</div>
          <p className="text-sm text-gray-400">+200 from last week</p>
        </CardContent>
      </Card>

      {/* Workout Frequency Chart */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-quantum-cyan" />
            Workout Frequency
          </CardTitle>
          <CardDescription>Workouts per day of the week</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressChart data={workoutData} dataKey="workouts" color="#00FFFF" />
        </CardContent>
      </Card>

      {/* Steps Chart */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-quantum-cyan" />
            Daily Steps
          </CardTitle>
          <CardDescription>Steps per day of the week</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressChart data={stepsData} dataKey="steps" color="#A020F0" />
        </CardContent>
      </Card>

      {/* Calories Chart */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-quantum-cyan" />
            Calories Burned
          </CardTitle>
          <CardDescription>Calories burned per day of the week</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressChart data={caloriesData} dataKey="calories" color="#FF4500" />
        </CardContent>
      </Card>
    </div>
  );
};

export default FitnessAnalyticsDashboard;
