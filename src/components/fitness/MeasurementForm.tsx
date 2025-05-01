
import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserMeasurement } from '@/types/fitness';

const measurementFormSchema = z.object({
  weight: z.coerce.number().min(20, 'Weight must be at least 20').max(500, 'Weight must be less than 500'),
  body_fat: z.coerce.number().min(1, 'Body fat must be at least 1%').max(80, 'Body fat must be less than 80%').optional(),
  chest: z.coerce.number().min(30, 'Chest must be at least 30cm').max(200, 'Chest must be less than 200cm').optional(),
  waist: z.coerce.number().min(30, 'Waist must be at least 30cm').max(200, 'Waist must be less than 200cm').optional(),
  hips: z.coerce.number().min(30, 'Hips must be at least 30cm').max(200, 'Hips must be less than 200cm').optional(),
  arms: z.coerce.number().min(10, 'Arms must be at least 10cm').max(100, 'Arms must be less than 100cm').optional(),
  legs: z.coerce.number().min(20, 'Legs must be at least 20cm').max(150, 'Legs must be less than 150cm').optional(),
  notes: z.string().optional(),
});

type MeasurementFormValues = z.infer<typeof measurementFormSchema>;

interface MeasurementFormProps {
  userId?: string;
  onMeasurementAdded?: () => void;
}

const MeasurementForm: React.FC<MeasurementFormProps> = ({ userId, onMeasurementAdded }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<MeasurementFormValues>({
    resolver: zodResolver(measurementFormSchema),
    defaultValues: {
      weight: undefined,
      body_fat: undefined,
      chest: undefined,
      waist: undefined,
      hips: undefined,
      arms: undefined,
      legs: undefined,
      notes: '',
    },
  });

  const onSubmit = async (data: MeasurementFormValues) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User ID is required to add measurements',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a measurement object with required fields
      const newMeasurement = {
        user_id: userId,
        date: new Date().toISOString(),
        weight: data.weight, // Ensure weight is explicitly included as required
        body_fat: data.body_fat,
        chest: data.chest,
        waist: data.waist,
        hips: data.hips,
        arms: data.arms,
        legs: data.legs,
        notes: data.notes,
      };

      const { error } = await supabase.from('user_measurements').insert(newMeasurement);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Measurement added successfully',
      });
      
      form.reset();
      
      if (onMeasurementAdded) {
        onMeasurementAdded();
      }
    } catch (error) {
      console.error('Error adding measurement:', error);
      toast({
        title: 'Error',
        description: 'Failed to add measurement',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="70.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="body_fat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body Fat (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="15.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="chest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chest (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="90" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="waist"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Waist (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="80" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="hips"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hips (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="95" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="arms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arms (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="35" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="legs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Legs (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="55" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any additional notes about this measurement..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-quantum-cyan hover:bg-quantum-cyan/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Measurement'}
        </Button>
      </form>
    </Form>
  );
};

export default MeasurementForm;
