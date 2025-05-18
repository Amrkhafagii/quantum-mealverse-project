
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase, userTypeService } from "@/services/supabaseClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocationPermission } from '@/hooks/useLocationPermission';
import LocationPermissionsPrompt from './location/LocationPermissionsPrompt';
import { BiometricLoginButton } from '@/components/auth/BiometricLoginButton';
import { Platform } from '@/utils/platform';

interface AuthFormProps {
  isRegister?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ isRegister = false }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(isRegister ? 'signup' : 'login');
  const [userType, setUserType] = useState<'customer' | 'restaurant' | 'delivery'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  
  // Restaurant specific fields
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [restaurantCity, setRestaurantCity] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');
  const [restaurantDescription, setRestaurantDescription] = useState('');
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { requestPermission } = useLocationPermission();
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Sign up the user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_type: userType
            }
          }
        });
        
        if (signUpError) throw signUpError;
        
        // Also update the user_types table to store the user type
        if (authData?.user) {
          // Use the service to update user type
          const success = await userTypeService.updateUserType(
            authData.user.id,
            userType as 'customer' | 'restaurant' | 'delivery'
          );
          
          if (!success) {
            console.error("Error storing user type in database");
            // Continue despite error to not block signup
          }
        }
        
        if (userType === 'restaurant' && authData?.user) {
          // Create restaurant profile
          const { error: restaurantError } = await supabase.from('restaurants').insert({
            user_id: authData.user.id,
            name: restaurantName,
            address: restaurantAddress,
            city: restaurantCity,
            phone: restaurantPhone,
            email: email,
            description: restaurantDescription,
            is_active: true
          });
          
          if (restaurantError) throw restaurantError;

          toast({
            title: "Restaurant account created!",
            description: "Please check your email to verify your account.",
          });
        } else if (userType === 'delivery' && authData?.user) {
          toast({
            title: "Delivery account created!",
            description: "Please check your email to verify your account.",
          });
          
          // After successful signup as delivery, redirect to onboarding
          setMode('login');
        } else {
          toast({
            title: "Success!",
            description: "Please check your email to verify your account.",
          });
          // After successful signup, redirect to login
          setMode('login');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Get user type - first check user metadata
        const userMetadata = data.user?.user_metadata as { user_type?: string } | undefined;
        let userType = userMetadata?.user_type;
        
        // If not in metadata, check our user_types table as fallback
        if (!userType) {
          userType = await userTypeService.getUserType(data.user?.id || '');
        }
        
        // If still no user type, default to customer
        if (!userType) {
          userType = 'customer';
          // Store the default user type if possible
          if (data.user) {
            await userTypeService.updateUserType(data.user.id, 'customer');
          }
        }
        
        // Check if user is a restaurant owner
        const { data: restaurantData } = await supabase
          .from('restaurants')
          .select('id')
          .eq('user_id', data.user?.id || '')
          .maybeSingle();
          
        if (restaurantData) {
          // Restaurant owner - redirect to restaurant dashboard
          toast({
            title: "Welcome to Restaurant Dashboard",
            description: "You have been logged in as a restaurant owner",
          });
          navigate('/restaurant/dashboard', { replace: true });
        } else if (userType === 'delivery') {
          // Check if delivery onboarding is complete
          const { data: deliveryUserData } = await supabase
            .from('delivery_users')
            .select('id, is_approved')
            .eq('user_id', data.user?.id || '')
            .maybeSingle();

          if (deliveryUserData?.id) {
            if (deliveryUserData.is_approved) {
              // Approved delivery user - go to delivery dashboard
              toast({
                title: "Welcome back",
                description: "You have been logged in as a delivery partner",
              });
              navigate('/delivery/dashboard', { replace: true });
            } else {
              // Onboarding complete but not approved yet
              toast({
                title: "Welcome back",
                description: "Your delivery account is pending approval",
              });
              navigate('/delivery/onboarding', { replace: true });
            }
          } else {
            // Delivery user who hasn't completed onboarding
            toast({
              title: "Welcome",
              description: "Please complete your delivery partner onboarding",
            });
            navigate('/delivery/onboarding', { replace: true });
          }
        } else {
          // Regular customer flow - prompt for location
          toast({
            title: "Welcome back",
            description: "You have been logged in successfully",
          });
          
          // Show location prompt after successful login (only for customers)
          setShowLocationPrompt(true);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle location permission result
  const handlePermissionGranted = () => {
    toast({
      title: "Location Enabled",
      description: "You can now see restaurants near you",
    });
    navigate('/', { replace: true });
  };
  
  const handlePermissionDenied = () => {
    toast({
      title: "Location Access Limited",
      description: "Some features will be limited without location access",
      variant: "destructive",
    });
    navigate('/', { replace: true });
  };
  
  const handleDismiss = () => {
    setShowLocationPrompt(false);
    navigate('/', { replace: true });
  };

  // Render the location prompt or the auth form
  if (showLocationPrompt) {
    return (
      <LocationPermissionsPrompt
        onPermissionGranted={handlePermissionGranted}
        onPermissionDenied={handlePermissionDenied}
        onDismiss={handleDismiss}
      />
    );
  }

  return (
    <form onSubmit={handleAuth} className="space-y-6">
      <div className="space-y-4">
        {mode === 'signup' && (
          <Tabs defaultValue={userType} onValueChange={(value) => setUserType(value as 'customer' | 'restaurant' | 'delivery')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
            </TabsList>
            <TabsContent value="delivery" className="pt-4 pb-2">
              <div className="text-sm text-gray-300 bg-quantum-darkBlue/30 p-3 rounded-md border border-quantum-cyan/20">
                <p>Join our delivery team and earn money delivering orders to customers in your area.</p>
                <p className="mt-1">You'll need to complete an onboarding process after signing up.</p>
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {mode === 'signup' && userType === 'restaurant' && (
          <div className="space-y-4 p-4 border rounded-md">
            <div>
              <Label htmlFor="restaurant-name">Restaurant Name</Label>
              <Input
                id="restaurant-name"
                type="text"
                placeholder="Restaurant Name"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="restaurant-address">Address</Label>
              <Input
                id="restaurant-address"
                type="text"
                placeholder="Address"
                value={restaurantAddress}
                onChange={(e) => setRestaurantAddress(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="restaurant-city">City</Label>
                <Input
                  id="restaurant-city"
                  type="text"
                  placeholder="City"
                  value={restaurantCity}
                  onChange={(e) => setRestaurantCity(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="restaurant-phone">Phone</Label>
                <Input
                  id="restaurant-phone"
                  type="text"
                  placeholder="Phone"
                  value={restaurantPhone}
                  onChange={(e) => setRestaurantPhone(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="restaurant-description">Description</Label>
              <Textarea
                id="restaurant-description"
                placeholder="Tell us about your restaurant"
                value={restaurantDescription}
                onChange={(e) => setRestaurantDescription(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full cyber-button" 
        disabled={loading}
      >
        {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Sign Up'}
      </Button>
      
      {mode === 'login' && Platform.isNative() && (
        <BiometricLoginButton onSuccess={() => setShowLocationPrompt(true)} />
      )}

      <p className="text-center text-sm">
        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-quantum-cyan hover:underline"
        >
          {mode === 'login' ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </form>
  );
};
