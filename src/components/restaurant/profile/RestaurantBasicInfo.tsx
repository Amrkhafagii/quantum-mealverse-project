import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Restaurant name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 digits.',
  }),
  address: z.string().min(5, {
    message: 'Address must be at least 5 characters.',
  }),
  city: z.string().min(2, {
    message: 'City must be at least 2 characters.',
  }),
  state: z.string().optional(),
  country: z.string().min(2, {
    message: 'Country must be at least 2 characters.',
  }),
  description: z.string().optional(),
  delivery_radius: z.coerce.number().min(1).max(50),
  estimated_delivery_time: z.coerce.number().min(15).max(120),
});

type FormData = z.infer<typeof formSchema>;

interface RestaurantBasicInfoProps {
  restaurant?: any;
  onUpdate?: (restaurant: any) => void;
}

const RestaurantBasicInfo: React.FC<RestaurantBasicInfoProps> = ({
  restaurant,
  onUpdate
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (restaurant) {
      setValue('name', restaurant.name || '');
      setValue('email', restaurant.email || '');
      setValue('phone', restaurant.phone || '');
      setValue('address', restaurant.address || '');
      setValue('city', restaurant.city || '');
      setValue('state', restaurant.state || restaurant.postal_code || '');
      setValue('country', restaurant.country || '');
      setValue('description', restaurant.description || '');
      setValue('delivery_radius', restaurant.delivery_radius || 10);
      setValue('estimated_delivery_time', restaurant.estimated_delivery_time || 45);
    }
  }, [restaurant, setValue]);

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    try {
      const updates = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        city: values.city,
        postal_code: values.state,
        country: values.country,
        description: values.description,
        delivery_radius: values.delivery_radius,
        estimated_delivery_time: values.estimated_delivery_time,
        user_id: user?.id,
        // Include default coordinates to satisfy the database schema
        latitude: restaurant?.latitude || 37.7749,
        longitude: restaurant?.longitude || -122.4194,
      };

      let response;

      if (restaurant) {
        // Update existing restaurant
        response = await supabase
          .from('restaurants')
          .update(updates as any)
          .eq('id', restaurant.id)
          .select();
      } else {
        // Create new restaurant
        response = await supabase
          .from('restaurants')
          .insert(updates as any)
          .select();
      }

      if (response.error) {
        console.error('Error saving restaurant info:', response.error);
        toast({
          title: 'Error',
          description: 'Failed to save restaurant information.',
          variant: 'destructive',
        });
        return;
      }

      const updatedRestaurant = response.data[0];
      if (onUpdate) {
        onUpdate(updatedRestaurant);
      }
      
      toast({
        title: 'Success',
        description: 'Restaurant information saved successfully!',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Restaurant Basic Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Restaurant Name"
            {...register('name')}
            error={errors.name?.message}
            required
          />

          <FormField
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            required
          />

          <FormField
            label="Phone"
            {...register('phone')}
            error={errors.phone?.message}
            required
          />

          <FormField
            label="Address"
            {...register('address')}
            error={errors.address?.message}
            required
          />

          <FormField
            label="City"
            {...register('city')}
            error={errors.city?.message}
            required
          />

          <div className="space-y-2">
            <Label htmlFor="state">
              State/Province
            </Label>
            <select
              {...register('state')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select State/Province</option>
              <option value="CA">California</option>
              <option value="TX">Texas</option>
              <option value="NY">New York</option>
              <option value="FL">Florida</option>
            </select>
            {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
          </div>

          <FormField
            label="Country"
            {...register('country')}
            error={errors.country?.message}
            required
          />

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              {...register('description')}
              placeholder="Tell customers about your restaurant..."
              rows={4}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Delivery Radius (km)"
              type="number"
              min="1"
              max="50"
              {...register('delivery_radius')}
              error={errors.delivery_radius?.message}
              required
            />

            <FormField
              label="Estimated Delivery Time (minutes)"
              type="number"
              min="15"
              max="120"
              {...register('estimated_delivery_time')}
              error={errors.estimated_delivery_time?.message}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Basic Information'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RestaurantBasicInfo;
