
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { WorkoutPlan } from '@/types/fitness/workouts';

interface WorkoutCalendarViewProps {
  workoutPlans: WorkoutPlan[];
  onDateSelect: (date: Date) => void;
  onWorkoutSelect: (workoutId: string) => void;
}

export const WorkoutCalendarView: React.FC<WorkoutCalendarViewProps> = ({
  workoutPlans,
  onDateSelect,
  onWorkoutSelect
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };
  
  const hasWorkout = (day: number) => {
    // This would typically check against scheduled workouts
    // For now, we'll show workouts on certain days as an example
    return [1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 29].includes(day);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-quantum-cyan flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Workout Schedule
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-white font-medium min-w-[140px] text-center">
                {monthNames[month]} {year}
              </span>
              <Button variant="ghost" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first day of the month */}
            {Array.from({ length: firstDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="h-12"></div>
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const hasWorkoutScheduled = hasWorkout(day);
              const isTodayDate = isToday(day);
              
              return (
                <Button
                  key={day}
                  variant="ghost"
                  className={`h-12 p-1 relative ${
                    isTodayDate 
                      ? 'bg-quantum-cyan/20 border border-quantum-cyan' 
                      : hasWorkoutScheduled 
                      ? 'bg-green-500/20 border border-green-500/40'
                      : 'hover:bg-quantum-darkBlue/50'
                  }`}
                  onClick={() => onDateSelect(new Date(year, month, day))}
                >
                  <div className="flex flex-col items-center">
                    <span className={`text-sm ${isTodayDate ? 'text-quantum-cyan font-bold' : 'text-white'}`}>
                      {day}
                    </span>
                    {hasWorkoutScheduled && (
                      <div className="w-1 h-1 bg-green-500 rounded-full mt-1"></div>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="text-quantum-cyan">Scheduled Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workoutPlans.slice(0, 3).map((plan) => (
              <div 
                key={plan.id} 
                className="flex items-center justify-between p-3 border border-quantum-cyan/20 rounded-lg hover:border-quantum-cyan/40 transition-colors cursor-pointer"
                onClick={() => onWorkoutSelect(plan.id)}
              >
                <div>
                  <h4 className="text-white font-medium">{plan.name}</h4>
                  <p className="text-sm text-gray-400">Next: Tomorrow 9:00 AM</p>
                </div>
                <Badge variant="outline" className="border-quantum-cyan/50 text-quantum-cyan">
                  {plan.difficulty}
                </Badge>
              </div>
            ))}
            {workoutPlans.length === 0 && (
              <p className="text-center text-gray-400 py-8">
                No scheduled workouts. Create a workout plan to get started!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
