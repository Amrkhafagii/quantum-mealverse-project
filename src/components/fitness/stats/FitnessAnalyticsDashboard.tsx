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
    { date: "2023-06-09", value: 2 },
    { date: "2023-06-10", value: 3 },
    { date: "2023-06-11", value: 1 },
    { date: "2023-06-12", value: 4 },
    { date: "2023-06-13", value: 2 },
    { date: "2023-06-14", value: 5 },
    { date: "2023-06-15", value: 1 },
  ];

  const stepsData = [
    { date: "2023-06-09", value: 5000 },
    { date: "2023-06-10", value: 7500 },
    { date: "2023-06-11", value: 4000 },
    { date: "2023-06-12", value: 9000 },
    { date: "2023-06-13", value: 6000 },
    { date: "2023-06-14", value: 11000 },
    { date: "2023-06-15", value: 3000 },
  ];

  const caloriesData = [
    { date: "2023-06-09", value: 200 },
    { date: "2023-06-10", value: 300 },
    { date: "2023-06-11", value: 150 },
    { date: "2023-06-12", value: 400 },
    { date: "2023-06-13", value: 250 },
    { date: "2023-06-14", value: 450 },
    { date: "2023-06-15", value: 100 },
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
          <ProgressChart data={workoutData} dataKey="value" color="#00FFFF" />
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
          <ProgressChart data={stepsData} dataKey="value" color="#A020F0" />
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
          <ProgressChart data={caloriesData} dataKey="value" color="#FF4500" />
        </CardContent>
      </Card>
    </div>
  );
};

export default FitnessAnalyticsDashboard;
