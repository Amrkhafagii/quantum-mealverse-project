
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DeliveryAvailability } from '@/types/delivery';
import { Loader2, Plus, X, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';

interface AvailabilityFormProps {
  onSubmit: (schedules: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_recurring: boolean;
  }[]) => Promise<DeliveryAvailability[] | null>;
  initialData?: DeliveryAvailability[];
  isLoading: boolean;
}

type ScheduleEntry = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
};

const dayNames = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const timeOptions = Array.from({ length: 24 * 4 }).map((_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return {
    label: format(new Date(0, 0, 0, hour, minute), 'h:mm a'),
    value: format(new Date(0, 0, 0, hour, minute), 'HH:mm')
  };
});

export const AvailabilityForm: React.FC<AvailabilityFormProps> = ({
  onSubmit,
  initialData,
  isLoading,
}) => {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>(
    initialData 
      ? initialData.map(item => ({
          id: item.id,
          day_of_week: item.day_of_week,
          start_time: item.start_time,
          end_time: item.end_time,
          is_recurring: item.is_recurring
        }))
      : []
  );

  const addSchedule = () => {
    const newSchedule: ScheduleEntry = {
      id: `new-${Date.now()}`,
      day_of_week: 1, // Monday
      start_time: '09:00',
      end_time: '17:00',
      is_recurring: true
    };
    setSchedules([...schedules, newSchedule]);
  };

  const removeSchedule = (id: string) => {
    setSchedules(schedules.filter(schedule => schedule.id !== id));
  };

  const updateSchedule = (id: string, field: keyof ScheduleEntry, value: any) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === id ? { ...schedule, [field]: value } : schedule
    ));
  };

  const handleSubmit = async () => {
    // Format the data for the API
    const formattedSchedules = schedules.map(({ day_of_week, start_time, end_time, is_recurring }) => ({
      day_of_week,
      start_time,
      end_time,
      is_recurring
    }));

    await onSubmit(formattedSchedules);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Availability</h2>
        <p className="text-gray-400 mt-1">Set your weekly availability schedule</p>
      </div>
      
      <div className="space-y-4">
        {schedules.map((schedule, index) => (
          <Card key={schedule.id} className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium">Schedule {index + 1}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSchedule(schedule.id)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Day</Label>
                  <Select
                    value={schedule.day_of_week.toString()}
                    onValueChange={(value) => updateSchedule(schedule.id, 'day_of_week', parseInt(value, 10))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day of week" />
                    </SelectTrigger>
                    <SelectContent>
                      {dayNames.map((day, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Start Time</Label>
                    <Select
                      value={schedule.start_time}
                      onValueChange={(value) => updateSchedule(schedule.id, 'start_time', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2 block">End Time</Label>
                    <Select
                      value={schedule.end_time}
                      onValueChange={(value) => updateSchedule(schedule.id, 'end_time', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="End time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor={`recurring-${schedule.id}`} className="cursor-pointer">
                    Recurring weekly
                  </Label>
                  <Switch
                    id={`recurring-${schedule.id}`}
                    checked={schedule.is_recurring}
                    onCheckedChange={(checked) => updateSchedule(schedule.id, 'is_recurring', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={addSchedule}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      <div className="pt-4">
        <Button
          onClick={handleSubmit}
          disabled={isLoading || schedules.length === 0}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  );
};
