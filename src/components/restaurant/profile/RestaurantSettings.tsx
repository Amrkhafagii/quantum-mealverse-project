
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const settingsSchema = z.object({
  order_preparation_time: z.coerce.number()
    .min(5, { message: "Must be at least 5 minutes." })
    .max(120, { message: "Must be no more than 120 minutes." }),
});

type SettingsSchemaType = z.infer<typeof settingsSchema>;

interface RestaurantSettingsProps {
  restaurant?: any;
}

const RestaurantSettings: React.FC<RestaurantSettingsProps> = ({ restaurant }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SettingsSchemaType>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (restaurant) {
      reset({
        order_preparation_time: restaurant.estimated_delivery_time || 30,
      });
    }
  }, [restaurant, reset]);

  const onSubmit = async (data: SettingsSchemaType) => {
    if (!restaurant?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          estimated_delivery_time: data.order_preparation_time
        })
        .eq('id', restaurant.id);

      if (error) {
        console.error("Error updating restaurant settings:", error);
        toast({
          title: "Error",
          description: "Failed to update restaurant settings.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Restaurant settings updated successfully.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Restaurant Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Order Preparation Time (minutes)"
            type="number"
            min="5"
            max="120"
            {...register('order_preparation_time')}
            error={errors.order_preparation_time?.message}
            required
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RestaurantSettings;
