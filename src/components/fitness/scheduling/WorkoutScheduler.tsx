import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Settings, Play, Edit, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { WorkoutCalendar } from './WorkoutCalendar';
import { ScheduleForm } from './ScheduleForm';
import { useWorkoutScheduling } from '@/hooks/useWorkoutScheduling';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { WorkoutSchedule, WorkoutSession, CalendarEvent, CreateWorkoutScheduleData } from '@/types/fitness/scheduling';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export const WorkoutScheduler: React.FC = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkoutSchedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const {
    schedules,
    sessions,
    isLoading,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    updateSessionStatus,
    generateSessions
  } = useWorkoutScheduling();

  const { workoutPlans } = useWorkoutData();

  const handleCreateSchedule = async (scheduleData: CreateWorkoutScheduleData) => {
    const result = await createSchedule(scheduleData);
    if (result) {
      setShowCreateForm(false);
      setActiveTab('calendar');
    }
  };

  const handleEditSchedule = async (scheduleData: CreateWorkoutScheduleData) => {
    if (!editingSchedule) return;
    
    await updateSchedule(editingSchedule.id, scheduleData);
    setEditingSchedule(null);
    setActiveTab('calendar');
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    await deleteSchedule(scheduleId);
  };

  const handleEventClick = (event: CalendarEvent) => {
    // Handle clicking on a calendar event
    console.log('Event clicked:', event);
  };

  const handleStartWorkout = (session: WorkoutSession) => {
    updateSessionStatus(session.id, 'in_progress');
  };

  const handleCompleteWorkout = (session: WorkoutSession) => {
    updateSessionStatus(session.id, 'completed', {
      completed_at: new Date().toISOString(),
      duration_minutes: 45 // Default duration
    });
  };

  const handleSkipWorkout = (session: WorkoutSession) => {
    updateSessionStatus(session.id, 'skipped');
  };

  const getUpcomingSessions = () => {
    const today = new Date().toISOString().split('T')[0];
    return sessions
      .filter(session => session.scheduled_date >= today && session.status === 'scheduled')
      .slice(0, 5);
  };

  const getDaysOfWeekText = (daysOfWeek: number[]) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return daysOfWeek.map(day => dayNames[day]).join(', ');
  };

  if (showCreateForm || editingSchedule) {
    return (
      <ScheduleForm
        workoutPlans={workoutPlans}
        onSubmit={editingSchedule ? handleEditSchedule : handleCreateSchedule}
        onCancel={() => {
          setShowCreateForm(false);
          setEditingSchedule(null);
        }}
        initialData={editingSchedule || undefined}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-quantum-darkBlue/50">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <WorkoutCalendar
            onDateSelect={setSelectedDate}
            onEventClick={handleEventClick}
            onCreateSchedule={() => setShowCreateForm(true)}
          />
        </TabsContent>

        <TabsContent value="schedules">
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-quantum-cyan" />
                  Workout Schedules
                </CardTitle>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
                >
                  Create Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-quantum-cyan/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Schedules Yet</h3>
                  <p className="text-gray-400 mb-4">
                    Create your first workout schedule to get started
                  </p>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
                  >
                    Create Schedule
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <motion.div
                      key={schedule.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-quantum-black/30 border border-quantum-cyan/10 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{schedule.name}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            <span>Days: {getDaysOfWeekText(schedule.days_of_week)}</span>
                            {schedule.preferred_time && (
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {schedule.preferred_time}
                              </span>
                            )}
                            <Badge variant={schedule.is_active ? "default" : "secondary"}>
                              {schedule.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="mt-2 text-sm">
                            <span>From {format(new Date(schedule.start_date), 'MMM d, yyyy')}</span>
                            {schedule.end_date && (
                              <span> to {format(new Date(schedule.end_date), 'MMM d, yyyy')}</span>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setEditingSchedule(schedule)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => generateSessions(schedule.id)}
                              disabled={!schedule.is_active}
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Generate Sessions
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              className="text-red-500"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-quantum-cyan" />
                Upcoming Workouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getUpcomingSessions().length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-quantum-cyan/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Upcoming Workouts</h3>
                  <p className="text-gray-400">
                    Create a schedule to see your upcoming workouts here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getUpcomingSessions().map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-quantum-black/30 border border-quantum-cyan/10 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">
                            {(session as any).workout_plans?.name || 'Workout'}
                          </h3>
                          <div className="text-sm text-gray-400 mt-1">
                            {format(new Date(session.scheduled_date), 'EEEE, MMM d')}
                            {session.scheduled_time && ` at ${session.scheduled_time}`}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSkipWorkout(session)}
                          >
                            Skip
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStartWorkout(session)}
                            className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
