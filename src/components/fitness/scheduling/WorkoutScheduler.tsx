import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// REMOVED: import { DatePicker } from "@/components/ui/date-picker"
import { Calendar } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from "@radix-ui/react-icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { DayPicker } from 'react-day-picker';
import type { WorkoutSchedule } from "@/types/fitness";

const WorkoutScheduler: React.FC = () => {
  const { user } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [preferredTime, setPreferredTime] = useState('');
  const [active, setActive] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('workout_plans')
          .select('id, name')
          .eq('workout_plans_user_id', user!.id);

        if (error) {
          console.error('Error fetching workout plans:', error);
          toast({
            title: "Error",
            description: "Failed to fetch workout plans.",
            variant: "destructive",
          });
        } else {
          setWorkoutPlans(data);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    };

    if (user) {
      fetchPlans();
    }
  }, [user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) {
      toast({
        title: "Error",
        description: "Please select a workout plan.",
        variant: "destructive",
      });
      return;
    }

    if (!startDate) {
      toast({
        title: "Error",
        description: "Please select a start date.",
        variant: "destructive",
      });
      return;
    }

    const daysOfWeek = selectedDays.map(day => day.getDay());

    try {
      // Use correct fields for table!
      const { error } = await supabase
        .from('workout_schedules')
        .insert({
          workout_plan_id: selectedPlan,
          workout_schedules_user_id: user!.id, // match db schema
          start_date: startDate.toISOString(),
          end_date: endDate?.toISOString() || null,
          days_of_week: daysOfWeek,
          preferred_time: preferredTime || null,
          is_active: active,
        });

      if (error) {
        console.error('Error creating workout schedule:', error);
        toast({
          title: "Error",
          description: "Failed to create workout schedule.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Workout schedule created successfully!",
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-quantum-cyan" />
          Workout Scheduler
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="workoutPlan" className="text-quantum-cyan">Workout Plan</Label>
            <select
              id="workoutPlan"
              className="w-full px-3 py-2 bg-quantum-darkBlue border border-quantum-cyan/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-quantum-cyan"
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              required
            >
              <option value="">Select a workout plan</option>
              {workoutPlans.map((plan: any) => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-quantum-cyan">Start Date</Label>
            {/* Fallback to native date input */}
            <Input
              type="date"
              value={startDate ? startDate.toISOString().substring(0, 10) : ''}
              onChange={e => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
              required
            />
          </div>
          <div>
            <Label className="text-quantum-cyan">End Date (Optional)</Label>
            <Input
              type="date"
              value={endDate ? endDate.toISOString().substring(0, 10) : ''}
              onChange={e => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
            />
          </div>
          <div>
            <Label htmlFor="daysOfWeek" className="text-quantum-cyan">Days of Week</Label>
            <DayPicker
              mode="multiple"
              selected={selectedDays}
              onSelect={setSelectedDays}
            />
          </div>

          <div>
            <Label htmlFor="preferredTime" className="text-quantum-cyan">Preferred Time (Optional)</Label>
            <Input
              type="time"
              id="preferredTime"
              className="w-full px-3 py-2 bg-quantum-darkBlue border border-quantum-cyan/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-quantum-cyan"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="active" className="text-quantum-cyan">Active</Label>
            <input
              type="checkbox"
              id="active"
              className="ml-2 h-5 w-5 text-quantum-cyan focus:ring-quantum-cyan"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
          </div>

          <Button type="submit" className="w-full bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black font-medium">
            Create Schedule
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
export default WorkoutScheduler;
