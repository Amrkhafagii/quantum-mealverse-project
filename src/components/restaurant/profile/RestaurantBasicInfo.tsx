
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { restaurantService, type Restaurant } from '@/services/restaurantService';

const restaurantSchema = z.object({
  name: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  postal_code: z.string().optional(),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  description: z.string().optional(),
  cuisine_type: z.string().optional(),
  business_license: z.string().optional(),
  tax_number: z.string().optional(),
  delivery_radius: z.number().min(1).max(50),
  minimum_order_amount: z.number().min(0).optional(),
  delivery_fee: z.number().min(0).optional(),
  estimated_delivery_time: z.number().min(15).max(120),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

interface Props {
  restaurant: Restaurant;
  onUpdate: (restaurant: Restaurant) => void;
}

export const RestaurantBasicInfo: React.FC<Props> = ({ restaurant, onUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: restaurant.name,
      email: restaurant.email,
      phone: restaurant.phone,
      address: restaurant.address,
      city: restaurant.city,
      postal_code: restaurant.postal_code || '',
      country: restaurant.country,
      description: restaurant.description || '',
      cuisine_type: restaurant.cuisine_type || '',
      business_license: restaurant.business_license || '',
      tax_number: restaurant.tax_number || '',
      delivery_radius: restaurant.delivery_radius,
      minimum_order_amount: restaurant.minimum_order_amount || 0,
      delivery_fee: restaurant.delivery_fee || 0,
      estimated_delivery_time: restaurant.estimated_delivery_time,
    },
  });

  const onSubmit = async (data: RestaurantFormData) => {
    try {
      setLoading(true);
      const updatedRestaurant = await restaurantService.updateRestaurant(restaurant.id, data);
      onUpdate(updatedRestaurant);
      toast({
        title: "Success",
        description: "Restaurant profile updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating restaurant:', error);
      toast({
        title: "Error",
        description: "Failed to update restaurant profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Update your restaurant's basic information and contact details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                error={form.formState.errors.name?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuisine_type">Cuisine Type</Label>
              <Input
                id="cuisine_type"
                placeholder="e.g., Italian, Chinese, Fast Food"
                {...form.register('cuisine_type')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                error={form.formState.errors.email?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                {...form.register('phone')}
                error={form.formState.errors.phone?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                {...form.register('address')}
                error={form.formState.errors.address?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...form.register('city')}
                error={form.formState.errors.city?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                {...form.register('postal_code')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                {...form.register('country')}
                error={form.formState.errors.country?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_license">Business License Number</Label>
              <Input
                id="business_license"
                {...form.register('business_license')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_number">Tax Number</Label>
              <Input
                id="tax_number"
                {...form.register('tax_number')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_radius">Delivery Radius (km) *</Label>
              <Input
                id="delivery_radius"
                type="number"
                min="1"
                max="50"
                {...form.register('delivery_radius', { valueAsNumber: true })}
                error={form.formState.errors.delivery_radius?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_delivery_time">Estimated Delivery Time (minutes) *</Label>
              <Input
                id="estimated_delivery_time"
                type="number"
                min="15"
                max="120"
                {...form.register('estimated_delivery_time', { valueAsNumber: true })}
                error={form.formState.errors.estimated_delivery_time?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_order_amount">Minimum Order Amount ($)</Label>
              <Input
                id="minimum_order_amount"
                type="number"
                min="0"
                step="0.01"
                {...form.register('minimum_order_amount', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_fee">Delivery Fee ($)</Label>
              <Input
                id="delivery_fee"
                type="number"
                min="0"
                step="0.01"
                {...form.register('delivery_fee', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell customers about your restaurant..."
              className="min-h-[100px]"
              {...form.register('description')}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
