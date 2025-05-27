
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { onboardingService } from '@/services/onboarding/onboardingService';
import type { OperationalHours } from '@/types/onboarding';

interface OperationalHoursStepProps {
  restaurantId: string;
  onComplete: (data: Record<string, any>) => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const OperationalHoursStep: React.FC<OperationalHoursStepProps> = ({ restaurantId, onComplete }) => {
  const { toast } = useToast();
  const [hours, setHours] = useState<Record<number, Partial<OperationalHours>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHours();
  }, [restaurantId]);

  const loadHours = async () => {
    try {
      setLoading(true);
      const existingHours = await onboardingService.getOperationalHours(restaurantId);
      const hoursMap = existingHours.reduce((acc, hour) => {
        acc[hour.day_of_week] = hour;
        return acc;
      }, {} as Record<number, OperationalHours>);
      
      // Initialize with default hours if none exist
      const initialHours = DAYS.reduce((acc, _, index) => {
        acc[index] = hoursMap[index] || {
          day_of_week: index,
          is_open: index >= 1 && index <= 5, // Monday to Friday open by default
          open_time: '09:00',
          close_time: '22:00',
          is_24_hours: false
        };
        return acc;
      }, {} as Record<number, Partial<OperationalHours>>);
      
      setHours(initialHours);
    } catch (error) {
      console.error('Error loading hours:', error);
      toast({
        title: 'Error',
        description: 'Failed to load operational hours',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDay = (dayIndex: number, updates: Partial<OperationalHours>) => {
    setHours(prev => ({
      ...prev,
      [dayIndex]: { ...prev[dayIndex], ...updates }
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      
      const hoursArray = Object.values(hours).map(hour => ({
        day_of_week: hour.day_of_week!,
        is_open: hour.is_open || false,
        open_time: hour.is_open ? hour.open_time : null,
        close_time: hour.is_open ? hour.close_time : null,
        break_start_time: hour.break_start_time || null,
        break_end_time: hour.break_end_time || null,
        is_24_hours: hour.is_24_hours || false,
        special_hours_note: hour.special_hours_note || null
      }));

      await onboardingService.saveOperationalHours(restaurantId, hoursArray);
      onComplete({ operational_hours: hoursArray });
    } catch (error) {
      console.error('Error saving hours:', error);
      toast({
        title: 'Error',
        description: 'Failed to save operational hours',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {DAYS.map((day, index) => {
          const dayHours = hours[index] || {};
          
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">{day}</h3>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`open-${index}`}>Open</Label>
                    <Switch
                      id={`open-${index}`}
                      checked={dayHours.is_open || false}
                      onCheckedChange={(checked) => updateDay(index, { is_open: checked })}
                    />
                  </div>
                </div>
                
                {dayHours.is_open && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`open-time-${index}`}>Open Time</Label>
                      <input
                        id={`open-time-${index}`}
                        type="time"
                        value={dayHours.open_time || '09:00'}
                        onChange={(e) => updateDay(index, { open_time: e.target.value })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`close-time-${index}`}>Close Time</Label>
                      <input
                        id={`close-time-${index}`}
                        type="time"
                        value={dayHours.close_time || '22:00'}
                        onChange={(e) => updateDay(index, { close_time: e.target.value })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button onClick={handleSubmit} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save & Continue'}
      </Button>
    </div>
  );
};
