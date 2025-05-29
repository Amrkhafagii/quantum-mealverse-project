import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { geocodeAddress } from '@/utils/geocoding';

interface AuthFormProps {
  isRegister?: boolean;
}

export const AuthForm = ({ isRegister = false }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('customer');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Restaurant owner fields
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [restaurantCity, setRestaurantCity] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');
  const [restaurantDescription, setRestaurantDescription] = useState('');

  // Delivery driver fields
  const [deliveryFullName, setDeliveryFullName] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryVehicleType, setDeliveryVehicleType] = useState('');
  const [deliveryLicensePlate, setDeliveryLicensePlate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        // Registration logic
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          toast({
            title: 'Registration Error',
            description: signUpError.message,
            variant: 'destructive',
          });
          return;
        }

        if (signUpData.user) {
          // Create user type record
          const { error: userTypeError } = await supabase
            .from('user_types')
            .insert({
              user_id: signUpData.user.id,
              type: userType,
            });

          if (userTypeError) {
            console.error('Error creating user type:', userTypeError);
            toast({
              title: 'Registration Error',
              description: 'Failed to set user type',
              variant: 'destructive',
            });
            return;
          }

          // If restaurant owner, create restaurant profile
          if (userType === 'restaurant') {
            // Get coordinates for the restaurant address
            const coordinates = await geocodeAddress(`${restaurantAddress}, ${restaurantCity}, Canada`);

            const { data, error } = await supabase
              .from('restaurants')
              .insert({
                user_id: signUpData.user.id,
                name: restaurantName,
                email: email,
                phone: restaurantPhone,
                address: restaurantAddress,
                city: restaurantCity,
                description: restaurantDescription || null,
                country: 'Canada',
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                delivery_radius: 10,
                estimated_delivery_time: 45
              } as any) // Type assertion to bypass outdated types
              .select()
              .single();

            if (error) {
              console.error('Error creating restaurant:', error);
              toast({
                title: 'Registration Error',
                description: 'Failed to create restaurant profile',
                variant: 'destructive',
              });
              return;
            }
          }

          // If delivery driver, create delivery user profile
          if (userType === 'delivery') {
            const { error } = await supabase
              .from('delivery_users')
              .insert({
                user_id: signUpData.user.id,
                full_name: deliveryFullName,
                phone: deliveryPhone,
                vehicle_type: deliveryVehicleType,
                license_plate: deliveryLicensePlate,
              });

            if (error) {
              console.error('Error creating delivery user:', error);
              toast({
                title: 'Registration Error',
                description: 'Failed to create delivery profile',
                variant: 'destructive',
              });
              return;
            }
          }

          toast({
            title: 'Registration Successful',
            description: 'Please check your email to confirm your account.',
          });

          // Navigate based on user type
          if (userType === 'restaurant') {
            navigate('/restaurant/dashboard');
          } else if (userType === 'delivery') {
            navigate('/delivery/dashboard');
          } else {
            navigate('/customer');
          }
        }
      } else {
        // Login logic
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            title: 'Login Error',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });

        navigate('/customer');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
      </div>

      {isRegister && (
        <>
          <div>
            <Label htmlFor="userType">User Type</Label>
            <Select value={userType} onValueChange={setUserType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="restaurant">Restaurant Owner</SelectItem>
                <SelectItem value="delivery">Delivery Driver</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {userType === 'restaurant' && (
            <>
              <div>
                <Label htmlFor="restaurantName">Restaurant Name</Label>
                <Input
                  type="text"
                  id="restaurantName"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="Enter restaurant name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="restaurantAddress">Restaurant Address</Label>
                <Input
                  type="text"
                  id="restaurantAddress"
                  value={restaurantAddress}
                  onChange={(e) => setRestaurantAddress(e.target.value)}
                  placeholder="Enter restaurant address"
                  required
                />
              </div>
              <div>
                <Label htmlFor="restaurantCity">Restaurant City</Label>
                <Input
                  type="text"
                  id="restaurantCity"
                  value={restaurantCity}
                  onChange={(e) => setRestaurantCity(e.target.value)}
                  placeholder="Enter restaurant city"
                  required
                />
              </div>
              <div>
                <Label htmlFor="restaurantPhone">Restaurant Phone</Label>
                <Input
                  type="tel"
                  id="restaurantPhone"
                  value={restaurantPhone}
                  onChange={(e) => setRestaurantPhone(e.target.value)}
                  placeholder="Enter restaurant phone"
                  required
                />
              </div>
              <div>
                <Label htmlFor="restaurantDescription">Restaurant Description</Label>
                <Textarea
                  id="restaurantDescription"
                  value={restaurantDescription}
                  onChange={(e) => setRestaurantDescription(e.target.value)}
                  placeholder="Enter restaurant description"
                  rows={3}
                />
              </div>
            </>
          )}

          {userType === 'delivery' && (
            <>
              <div>
                <Label htmlFor="deliveryFullName">Full Name</Label>
                <Input
                  type="text"
                  id="deliveryFullName"
                  value={deliveryFullName}
                  onChange={(e) => setDeliveryFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="deliveryPhone">Phone</Label>
                <Input
                  type="tel"
                  id="deliveryPhone"
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="deliveryVehicleType">Vehicle Type</Label>
                <Input
                  type="text"
                  id="deliveryVehicleType"
                  value={deliveryVehicleType}
                  onChange={(e) => setDeliveryVehicleType(e.target.value)}
                  placeholder="Enter your vehicle type"
                  required
                />
              </div>
              <div>
                <Label htmlFor="deliveryLicensePlate">License Plate</Label>
                <Input
                  type="text"
                  id="deliveryLicensePlate"
                  value={deliveryLicensePlate}
                  onChange={(e) => setDeliveryLicensePlate(e.target.value)}
                  placeholder="Enter your license plate number"
                  required
                />
              </div>
            </>
          )}
        </>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {isRegister ? 'Sign Up' : 'Login'}
      </Button>
    </form>
  );
};
