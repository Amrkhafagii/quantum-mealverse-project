
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface MeasurementFormProps {
  userId?: string;
  onMeasurementAdded?: () => void;
}

const MeasurementForm: React.FC<MeasurementFormProps> = ({
  userId,
  onMeasurementAdded
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [measurements, setMeasurements] = useState({
    weight: '',
    bodyFat: '',
    chest: '',
    waist: '',
    arms: '',
    legs: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setMeasurements({ ...measurements, [id]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        title: "Error",
        description: "You need to be logged in to add measurements",
        variant: "destructive"
      });
      return;
    }

    if (!measurements.weight) {
      toast({
        title: "Error",
        description: "Weight is required",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const measurementData = {
        user_id: userId,
        date: date.toISOString(),
        weight: parseFloat(measurements.weight),
        body_fat: measurements.bodyFat ? parseFloat(measurements.bodyFat) : null,
        chest: measurements.chest ? parseFloat(measurements.chest) : null,
        waist: measurements.waist ? parseFloat(measurements.waist) : null,
        arms: measurements.arms ? parseFloat(measurements.arms) : null,
        legs: measurements.legs ? parseFloat(measurements.legs) : null,
        notes: measurements.notes || null
      };

      const { error } = await supabase
        .from('user_measurements')
        .insert(measurementData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Measurement added successfully",
      });
      
      // Reset form
      setMeasurements({
        weight: '',
        bodyFat: '',
        chest: '',
        waist: '',
        arms: '',
        legs: '',
        notes: ''
      });
      
      if (onMeasurementAdded) {
        onMeasurementAdded();
      }
    } catch (error) {
      console.error('Error adding measurement:', error);
      toast({
        title: "Error",
        description: "Failed to add measurement. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="text-quantum-cyan">Add Measurement</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Weight (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={measurements.weight}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="bodyFat">Body Fat %</Label>
              <Input
                id="bodyFat"
                type="number"
                step="0.1"
                value={measurements.bodyFat}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="chest">Chest (cm)</Label>
              <Input
                id="chest"
                type="number"
                step="0.1"
                value={measurements.chest}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="waist">Waist (cm)</Label>
              <Input
                id="waist"
                type="number"
                step="0.1"
                value={measurements.waist}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="arms">Arms (cm)</Label>
              <Input
                id="arms"
                type="number"
                step="0.1"
                value={measurements.arms}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="legs">Legs (cm)</Label>
              <Input
                id="legs"
                type="number"
                step="0.1"
                value={measurements.legs}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={measurements.notes}
              onChange={handleChange}
              placeholder="Any additional notes about today's measurement"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-quantum-purple hover:bg-quantum-purple/90"
            disabled={isLoading || !measurements.weight}
          >
            {isLoading ? "Saving..." : "Add Measurement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MeasurementForm;
