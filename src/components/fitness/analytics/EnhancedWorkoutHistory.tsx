
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Calendar, Clock, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { WorkoutHistoryItem } from '@/types/fitness';
import { format, parseISO, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

interface EnhancedWorkoutHistoryProps {
  workoutHistory: WorkoutHistoryItem[];
  isLoading: boolean;
}

export const EnhancedWorkoutHistory: React.FC<EnhancedWorkoutHistoryProps> = ({
  workoutHistory,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'calories'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Get unique workout plans for filter
  const uniquePlans = useMemo(() => {
    const plans = [...new Set(workoutHistory.map(item => item.workout_plan_name))];
    return plans.filter(Boolean);
  }, [workoutHistory]);

  // Filter and sort workout history
  const filteredAndSortedHistory = useMemo(() => {
    let filtered = workoutHistory;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.workout_plan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.workout_day_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(item => item.workout_plan_name === planFilter);
    }

    // Apply date filter
    if (filterBy !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (filterBy) {
        case 'week':
          startDate = startOfWeek(now);
          break;
        case 'month':
          startDate = startOfMonth(now);
          break;
        case 'year':
          startDate = startOfYear(now);
          break;
        default:
          startDate = new Date(0);
      }
      
      filtered = filtered.filter(item => parseISO(item.date) >= startDate);
    }

    // Sort the results
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'duration':
          return b.duration - a.duration;
        case 'calories':
          return (b.calories_burned || 0) - (a.calories_burned || 0);
        default:
          return 0;
      }
    });
  }, [workoutHistory, searchQuery, sortBy, filterBy, planFilter]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalWorkouts = filteredAndSortedHistory.length;
    const totalDuration = filteredAndSortedHistory.reduce((sum, item) => sum + item.duration, 0);
    const totalCalories = filteredAndSortedHistory.reduce((sum, item) => sum + (item.calories_burned || 0), 0);
    const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
    
    return {
      totalWorkouts,
      totalDuration,
      totalCalories,
      averageDuration
    };
  }, [filteredAndSortedHistory]);

  const getCompletionRate = (item: WorkoutHistoryItem) => {
    if (item.total_exercises === 0) return 0;
    return Math.round((item.exercises_completed / item.total_exercises) * 100);
  };

  const getCompletionBadge = (rate: number) => {
    if (rate === 100) return <Badge className="bg-green-500">Complete</Badge>;
    if (rate >= 80) return <Badge className="bg-blue-500">Good</Badge>;
    if (rate >= 60) return <Badge className="bg-yellow-500">Partial</Badge>;
    return <Badge variant="destructive">Incomplete</Badge>;
  };

  if (isLoading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-quantum-cyan"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-quantum-cyan" />
          Workout History
        </CardTitle>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-quantum-black/30 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Total Workouts</div>
            <div className="text-xl font-bold">{summaryStats.totalWorkouts}</div>
          </div>
          <div className="bg-quantum-black/30 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Total Time</div>
            <div className="text-xl font-bold">{Math.round(summaryStats.totalDuration / 60)}h</div>
          </div>
          <div className="bg-quantum-black/30 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Avg Duration</div>
            <div className="text-xl font-bold">{summaryStats.averageDuration}m</div>
          </div>
          <div className="bg-quantum-black/30 p-3 rounded-lg">
            <div className="text-sm text-gray-400">Total Calories</div>
            <div className="text-xl font-bold">{summaryStats.totalCalories}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search workouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={sortBy} onValueChange={(value: 'date' | 'duration' | 'calories') => setSortBy(value)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
              <SelectItem value="calories">Calories</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterBy} onValueChange={(value: 'all' | 'week' | 'month' | 'year') => setFilterBy(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          {uniquePlans.length > 0 && (
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {uniquePlans.map((plan) => (
                  <SelectItem key={plan} value={plan}>
                    {plan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Workout History List */}
        {filteredAndSortedHistory.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-quantum-cyan/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Workouts Found</h3>
            <p className="text-gray-400">
              {searchQuery || planFilter !== 'all' || filterBy !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Complete your first workout to see it here'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedHistory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-quantum-black/30 border border-quantum-cyan/10 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{item.workout_plan_name}</h3>
                      {getCompletionBadge(getCompletionRate(item))}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{item.workout_day_name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(parseISO(item.date), 'MMM dd, yyyy')}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {item.duration}m
                      </span>
                      {item.calories_burned && (
                        <span className="flex items-center">
                          <Zap className="w-4 h-4 mr-1" />
                          {item.calories_burned} cal
                        </span>
                      )}
                      <span className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {item.exercises_completed}/{item.total_exercises} exercises
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-quantum-cyan">
                      {getCompletionRate(item)}%
                    </div>
                    <div className="text-xs text-gray-400">Completion</div>
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
