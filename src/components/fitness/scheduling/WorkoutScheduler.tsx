import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { useWorkoutScheduling } from '@/hooks/useWorkoutScheduling';
// FIX: Import from scheduling submodule
import { WorkoutSchedule, CreateWorkoutScheduleData, CalendarEvent } from '@/types/fitness.d.ts';
import ScheduleForm from './ScheduleForm';

interface WorkoutSchedulerProps {
  userId?: string;
  workoutPlanId?: string;
}

const WorkoutScheduler: React.FC<WorkoutSchedulerProps> = ({ userId, workoutPlanId }) => {
  const {
    createSchedule,
    updateSchedule,
    deleteSchedule,
    toggleScheduleActive,
    fetchSessions,
    getCalendarEvents,
    updateSessionStatus,
    generateSessions,
    schedules,
    sessions,
    isLoading
  } = useWorkoutScheduling();

  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkoutSchedule | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    fetchSessions(startDate, endDate);
  }, []);

  useEffect(() => {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const events = getCalendarEvents(startDate, endDate);
    setCalendarEvents(events);
  }, [sessions]);

  const handleCreateSchedule = async (scheduleData: CreateWorkoutScheduleData) => {
    try {
      await createSchedule(scheduleData);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };

  const handleEditSchedule = (schedule: WorkoutSchedule) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteSchedule(scheduleId);
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  const handleToggleActive = async (schedule: WorkoutSchedule) => {
    try {
      await toggleScheduleActive(schedule.id, !schedule.is_active);
    } catch (error) {
      console.error('Error toggling schedule:', error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSchedule(null);
  };

  const getDayNames = (days: number[]) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => dayNames[day]).join(', ');
  };

  if (showForm) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={handleFormClose}>
          ← Back to Schedules
        </Button>
        <ScheduleForm
          workoutPlanId={workoutPlanId || ''}
          existingSchedule={editingSchedule || undefined}
          onScheduleCreated={handleFormClose}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workout Schedules</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Schedule
        </Button>
      </div>

      {/* Active Schedules */}
      <div className="grid gap-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {schedule.name || 'Workout Schedule'}
                    <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                      {schedule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {getDayNames(schedule.days_of_week)}
                    </span>
                    {schedule.preferred_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {schedule.preferred_time}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={schedule.is_active}
                    onCheckedChange={() => handleToggleActive(schedule)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditSchedule(schedule)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSchedule(schedule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-300">
                <p>Start Date: {new Date(schedule.start_date).toLocaleDateString()}</p>
                {schedule.end_date && (
                  <p>End Date: {new Date(schedule.end_date).toLocaleDateString()}</p>
                )}
                {schedule.reminder_enabled && (
                  <p>Reminders: {schedule.reminder_minutes_before} minutes before</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {schedules.length === 0 && (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No schedules yet</h3>
            <p className="text-gray-400 mb-4">Create your first workout schedule to get started</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Calendar Events */}
      {calendarEvents.length > 0 && (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader>
            <CardTitle>Upcoming Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {calendarEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex justify-between items-center p-2 bg-quantum-black/20 rounded">
                  <div>
                    <span className="font-medium">{event.title}</span>
                    <span className="text-sm text-gray-400 ml-2">
                      {new Date(event.date).toLocaleDateString()}
                      {event.time && ` at ${event.time}`}
                    </span>
                  </div>
                  <Badge variant={event.status === 'completed' ? 'default' : 'secondary'}>
                    {event.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkoutScheduler;
