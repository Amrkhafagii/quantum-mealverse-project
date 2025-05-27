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

const RestaurantBasicInfo = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching restaurant:', error);
          toast({
            title: 'Error',
            description: 'Failed to load restaurant data.',
            variant: 'destructive',
          });
          return;
        }

        setRestaurant(data);

        // Set default values for the form
        if (data) {
          setValue('name', data.name);
          setValue('email', data.email);
          setValue('phone', data.phone);
          setValue('address', data.address);
          setValue('city', data.city);
          setValue('state', data.state || '');
          setValue('country', data.country);
          setValue('description', data.description || '');
          setValue('delivery_radius', data.delivery_radius);
          setValue('estimated_delivery_time', data.estimated_delivery_time);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [user, setValue]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const updates = {
        ...values,
        owner_id: user?.id,
      };

      let response;

      if (restaurant) {
        // Update existing restaurant
        response = await supabase
          .from('restaurants')
          .update(updates)
          .eq('id', restaurant.id)
          .select();
      } else {
        // Create new restaurant
        response = await supabase
          .from('restaurants')
          .insert(updates)
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

      setRestaurant(response.data[0]);
      toast({
        title: 'Success',
        description: 'Restaurant information saved successfully!',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit: any = (e: React.SyntheticEvent) => {
    e.preventDefault();
    void onSubmit(e);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Restaurant Basic Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="state" className="after:content-['*'] after:ml-0.5 after:text-red-500">
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
