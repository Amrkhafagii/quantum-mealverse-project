
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Calendar as CalendarIcon, Clock, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { WorkoutHistoryItem } from '@/types/fitness';
import { format, parseISO, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

interface EnhancedWorkoutHistoryProps {
  workoutHistory: WorkoutHistoryItem[];
  isLoading?: boolean;
}

export const EnhancedWorkoutHistory: React.FC<EnhancedWorkoutHistoryProps> = ({
  workoutHistory,
  isLoading,
}) => {
  const [search, setSearch] = useState('');
  const [filterRange, setFilterRange] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortKey, setSortKey] = useState('date');

  const filteredData = useMemo(() => {
    if (!workoutHistory) return [];
    let filtered = [...workoutHistory];
    if (search) {
      filtered = filtered.filter((item) =>
        item.workout_plan_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.workout_day_name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    // simplistic range filter (add logic if needed)
    return filtered;
  }, [workoutHistory, search, filterRange, filterType, sortKey]);

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <p>Loading enhanced workout history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <CalendarIcon className="inline-block mr-2" />
          Enhanced Workout History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Search />
            <Input
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-32"
              type="search"
              aria-label="Search workout history"
            />
          </div>
          <Select value={filterRange} onValueChange={setFilterRange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="strength">Strength</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
              <SelectItem value="hiit">HIIT</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {filteredData.length === 0 ? (
          <div className="text-center text-gray-400">No workout history found.</div>
        ) : (
          <div className="space-y-3">
            {filteredData.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-quantum-darkBlue/20 rounded"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{item.workout_plan_name}</div>
                    <div className="text-xs text-gray-400">{item.workout_day_name}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge>{format(parseISO(item.date), 'PP')}</Badge>
                    <Badge variant="secondary">
                      Exercises: {item.exercises_completed}/{item.total_exercises}
                    </Badge>
                    <Badge variant="secondary">
                      Duration: {item.duration} min
                    </Badge>
                    {item.calories_burned && (
                      <Badge variant="secondary">
                        <Zap className="h-3 w-3 inline-block mr-1" />
                        {item.calories_burned} kcal
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

