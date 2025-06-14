
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useWorkoutScheduling } from '@/hooks/useWorkoutScheduling';
import { WorkoutSchedule, CreateWorkoutScheduleData } from '@/types/fitness/scheduling';

interface ScheduleFormProps {
  workoutPlanId: string;
  onScheduleCreated?: () => void;
  existingSchedule?: WorkoutSchedule;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  workoutPlanId,
  onScheduleCreated,
  existingSchedule
}) => {
  const { createSchedule, updateSchedule, isLoading } = useWorkoutScheduling();
  
  const [formData, setFormData] = useState<CreateWorkoutScheduleData>({
    workout_plan_id: workoutPlanId,
    days_of_week: existingSchedule?.days_of_week || [],
    start_date: existingSchedule?.start_date || new Date().toISOString().split('T')[0],
    end_date: existingSchedule?.end_date || '',
    preferred_time: existingSchedule?.preferred_time || '09:00',
    reminder_enabled: existingSchedule?.reminder_enabled || false,
    is_active: existingSchedule?.is_active || true,
    name: existingSchedule?.name || '',
    timezone: existingSchedule?.timezone || 'UTC',
    reminder_minutes_before: existingSchedule?.reminder_minutes_before || 15
  });

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (existingSchedule) {
        await updateSchedule(existingSchedule.id, formData);
      } else {
        await createSchedule(formData);
      }
      
      if (onScheduleCreated) {
        onScheduleCreated();
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingSchedule ? 'Edit Workout Schedule' : 'Create Workout Schedule'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Schedule Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="My workout schedule"
            />
          </div>

          <div>
            <Label>Days of Week</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {daysOfWeek.map(day => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={formData.days_of_week.includes(day.value)}
                    onCheckedChange={() => handleDayToggle(day.value)}
                  />
                  <Label htmlFor={`day-${day.value}`}>{day.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date (Optional)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="preferred_time">Preferred Time</Label>
            <Input
              id="preferred_time"
              type="time"
              value={formData.preferred_time}
              onChange={(e) => setFormData(prev => ({ ...prev, preferred_time: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="reminder_enabled"
              checked={formData.reminder_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, reminder_enabled: checked }))}
            />
            <Label htmlFor="reminder_enabled">Enable Reminders</Label>
          </div>

          {formData.reminder_enabled && (
            <div>
              <Label htmlFor="reminder_minutes">Reminder Minutes Before</Label>
              <Input
                id="reminder_minutes"
                type="number"
                value={formData.reminder_minutes_before}
                onChange={(e) => setFormData(prev => ({ ...prev, reminder_minutes_before: parseInt(e.target.value) }))}
                min="5"
                max="60"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Active Schedule</Label>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : existingSchedule ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ScheduleForm;
