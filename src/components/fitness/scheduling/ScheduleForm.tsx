
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { X } from 'lucide-react';
import { WorkoutSchedule } from '@/types/fitness/scheduling';
import { WorkoutPlan } from '@/types/fitness/workouts';

const scheduleSchema = z.object({
  name: z.string().min(1, 'Schedule name is required'),
  workout_plan_id: z.string().min(1, 'Workout plan is required'),
  days_of_week: z.array(z.number()).min(1, 'Select at least one day'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  preferred_time: z.string().optional(),
  timezone: z.string().default('UTC'),
  reminder_enabled: z.boolean().default(true),
  reminder_minutes_before: z.number().min(5).max(1440).default(30),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ScheduleFormProps {
  workoutPlans: WorkoutPlan[];
  onSubmit: (data: Omit<WorkoutSchedule, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  initialData?: WorkoutSchedule;
  isLoading?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  workoutPlans,
  onSubmit,
  onCancel,
  initialData,
  isLoading = false
}) => {
  const [selectedDays, setSelectedDays] = useState<number[]>(initialData?.days_of_week || []);

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      name: initialData?.name || '',
      workout_plan_id: initialData?.workout_plan_id || '',
      days_of_week: initialData?.days_of_week || [],
      start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
      end_date: initialData?.end_date || '',
      preferred_time: initialData?.preferred_time || '',
      timezone: initialData?.timezone || 'UTC',
      reminder_enabled: initialData?.reminder_enabled ?? true,
      reminder_minutes_before: initialData?.reminder_minutes_before || 30,
    },
  });

  const handleDayToggle = (dayValue: number) => {
    const newSelectedDays = selectedDays.includes(dayValue)
      ? selectedDays.filter(day => day !== dayValue)
      : [...selectedDays, dayValue].sort();
    
    setSelectedDays(newSelectedDays);
    form.setValue('days_of_week', newSelectedDays);
  };

  const handleFormSubmit = (data: ScheduleFormData) => {
    onSubmit({
      ...data,
      is_active: true,
    });
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {initialData ? 'Edit Schedule' : 'Create Workout Schedule'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Morning Workout" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workout_plan_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workout Plan</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a workout plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {workoutPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label className="text-sm font-medium">Days of Week</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={selectedDays.includes(day.value)}
                      onCheckedChange={() => handleDayToggle(day.value)}
                    />
                    <Label htmlFor={`day-${day.value}`} className="text-sm">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
              {form.formState.errors.days_of_week && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.days_of_week.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="preferred_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Time (Optional)</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reminder_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Enable Reminders</FormLabel>
                    <div className="text-sm text-gray-400">
                      Get notified before your workouts
                    </div>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('reminder_enabled') && (
              <FormField
                control={form.control}
                name="reminder_minutes_before"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder Time (minutes before)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="5"
                        max="1440"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-quantum-cyan hover:bg-quantum-cyan/90 text-quantum-black"
              >
                {isLoading ? 'Saving...' : initialData ? 'Update Schedule' : 'Create Schedule'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
