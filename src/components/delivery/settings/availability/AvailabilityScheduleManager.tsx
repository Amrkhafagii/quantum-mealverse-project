
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Clock } from 'lucide-react';
import type { DeliveryAvailabilitySchedule } from '@/types/availability';

interface AvailabilityScheduleManagerProps {
  schedules: DeliveryAvailabilitySchedule[];
  createSchedule: (schedule: Omit<DeliveryAvailabilitySchedule, 'id' | 'created_at' | 'updated_at'>) => Promise<DeliveryAvailabilitySchedule | undefined>;
  updateSchedule: (id: string, updates: Partial<DeliveryAvailabilitySchedule>) => Promise<DeliveryAvailabilitySchedule | undefined>;
  deleteSchedule: (id: string) => Promise<void>;
  isProcessing: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

export const AvailabilityScheduleManager: React.FC<AvailabilityScheduleManagerProps> = ({
  schedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  isProcessing
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    timezone: 'UTC'
  });

  const handleCreateSchedule = async () => {
    if (!newSchedule.start_time || !newSchedule.end_time) return;

    const schedule = await createSchedule({
      delivery_user_id: '', // Will be set by the service
      day_of_week: newSchedule.day_of_week,
      start_time: newSchedule.start_time + ':00',
      end_time: newSchedule.end_time + ':00',
      is_active: true,
      timezone: newSchedule.timezone
    });

    if (schedule) {
      setShowAddForm(false);
      setNewSchedule({
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'UTC'
      });
    }
  };

  const handleToggleSchedule = async (id: string, isActive: boolean) => {
    await updateSchedule(id, { is_active: isActive });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // Remove seconds
  };

  const getDayLabel = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(day => day.value === dayOfWeek)?.label || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Scheduled Availability Windows</h3>
          <p className="text-sm text-muted-foreground">
            Set your working hours for each day of the week
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Schedule
        </Button>
      </div>

      {showAddForm && (
        <Card className="border border-quantum-cyan/20 bg-transparent">
          <CardHeader>
            <CardTitle>Add New Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select
                  value={newSchedule.day_of_week.toString()}
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, day_of_week: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={newSchedule.timezone}
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={newSchedule.start_time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={newSchedule.end_time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateSchedule} disabled={isProcessing}>
                Save Schedule
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {schedules.length === 0 ? (
          <Card className="border border-quantum-cyan/20 bg-transparent">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No availability schedules configured</p>
                <p className="text-sm">Add your first schedule to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id} className="border border-quantum-cyan/20 bg-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">{getDayLabel(schedule.day_of_week)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Timezone: {schedule.timezone}
                      </div>
                    </div>
                    <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                      {schedule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={schedule.is_active}
                      onCheckedChange={(checked) => handleToggleSchedule(schedule.id, checked)}
                      disabled={isProcessing}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSchedule(schedule.id)}
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
