import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { getCoordinatesFromAddress } from '@/utils/geocoding';

interface AuthFormProps {
  mode: 'signup' | 'login';
  onSuccess?: (user: any) => void;
  userType?: 'customer' | 'restaurant' | 'delivery';
}

interface FormData {
  email?: string;
  password?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  description?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSuccess, userType }) => {
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!formData.email || !formData.password) {
          throw new Error('Email and password are required');
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            },
          },
        });

        if (error) {
          console.error('Signup error:', error);
          throw new Error(error.message);
        }

        if (userType === 'restaurant') {
          // Get coordinates for the restaurant
          const coordinates = await getCoordinatesFromAddress(
            `${formData.address}, ${formData.city}`
          );

          // Create restaurant profile with coordinates
          const restaurantData = {
            user_id: data.user!.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postal_code: formData.state,
            country: formData.country || 'US',
            description: formData.description,
            latitude: coordinates?.latitude,
            longitude: coordinates?.longitude,
          };

          const { error: restaurantError } = await supabase
            .from('restaurants')
            .insert(restaurantData as any);

          if (restaurantError) {
            console.error('Restaurant creation error:', restaurantError);
            throw new Error('Failed to create restaurant profile');
          }
        } else if (userType === 'delivery') {
          // Create delivery user profile
          const deliveryData = {
            user_id: data.user!.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
          };

          const { error: deliveryError } = await supabase
            .from('delivery_users')
            .insert(deliveryData);

          if (deliveryError) {
            console.error('Delivery user creation error:', deliveryError);
            throw new Error('Failed to create delivery user profile');
          }
        }

        toast({
          title: 'Success',
          description: 'Account created successfully!',
        });
      } else {
        if (!formData.email || !formData.password) {
          throw new Error('Email and password are required');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          console.error('Login error:', error);
          throw new Error(error.message);
        }
      }

      onSuccess?.(data.user!);
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'signup' ? 'Sign Up' : 'Login'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && userType === 'restaurant' && (
            <>
              <div>
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  onChange={handleChange}
                  placeholder="Enter restaurant name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  type="text"
                  id="address"
                  name="address"
                  onChange={handleChange}
                  placeholder="Enter address"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  type="text"
                  id="city"
                  name="city"
                  onChange={handleChange}
                  placeholder="Enter city"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  type="text"
                  id="state"
                  name="state"
                  onChange={handleChange}
                  placeholder="Enter state"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  type="text"
                  id="country"
                  name="country"
                  onChange={handleChange}
                  placeholder="Enter country"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  onChange={handleChange}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
            </>
          )}

          {mode === 'signup' && userType === 'delivery' && (
            <>
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  type="text"
                  id="firstName"
                  name="firstName"
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  type="text"
                  id="lastName"
                  name="lastName"
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (mode === 'signup' ? 'Creating...' : 'Logging in...') : (mode === 'signup' ? 'Sign Up' : 'Login')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
