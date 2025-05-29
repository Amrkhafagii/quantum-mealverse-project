
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
import { BiometricErrorBoundary } from '@/components/auth/BiometricErrorBoundary';

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
  const [platformInitialized, setPlatformInitialized] = useState(false);
  
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
  
  // Check platform initialization
  useEffect(() => {
    let mounted = true;
    let checkTimer: number | undefined;
    
    const checkPlatform = () => {
      try {
        // Check if platform is initialized
        if (Platform.isInitialized()) {
          if (mounted) {
            setPlatformInitialized(true);
          }
          return;
        }
        
        // Retry after a delay
        checkTimer = window.setTimeout(checkPlatform, 100);
      } catch (error) {
        console.warn("Error checking platform:", error);
        if (mounted) {
          // Proceed anyway to avoid blocking auth
          setPlatformInitialized(true);
        }
      }
    };
    
    checkPlatform();
    
    return () => {
      mounted = false;
      if (checkTimer) clearTimeout(checkTimer);
    };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Sign up the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_type: userType
            }
          }
        });
        
        if (signUpError) throw signUpError;
        
        if (userType === 'restaurant' && signUpData.user && email) {
          // Create restaurant profile using direct database insert
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
              country: 'Canada'
            })
            .select()
            .single();
          
          if (error) {
            console.error('Restaurant profile creation error:', error);
            throw new Error('Failed to create restaurant profile');
          }
          
          // Create default settings
          await supabase
            .from('restaurant_settings')
            .insert({
              restaurant_id: data.id
            });
          
          toast({
            title: "Restaurant account created!",
            description: "Please check your email to verify your account. Complete your profile to get approved.",
          });
        } else if (userType === 'delivery') {
          toast({
            title: "Delivery account created!",
            description: "Please check your email to verify your account.",
          });
        } else {
          toast({
            title: "Success!",
            description: "Please check your email to verify your account.",
          });
        }
        setMode('login');
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        console.log('AuthForm - Login successful, user data:', data.user);
        
        // Get user type - first check user metadata
        const userMetadata = data.user?.user_metadata as { user_type?: string } | undefined;
        let detectedUserType = userMetadata?.user_type;
        
        console.log('AuthForm - User type from metadata:', detectedUserType);
        
        // If not in metadata, check our user_types table as fallback
        if (!detectedUserType && data.user?.id) {
          detectedUserType = await userTypeService.getUserType(data.user.id);
          console.log('AuthForm - User type from service:', detectedUserType);
        }
        
        console.log('AuthForm - Final user type determined:', detectedUserType);
        
        if (data.user) {
          if (detectedUserType === 'restaurant') {
            // Restaurant user - redirect to restaurant dashboard
            console.log('AuthForm - Redirecting restaurant user to dashboard');
            toast({
              title: "Welcome to Restaurant Dashboard",
              description: "You have been logged in as a restaurant owner",
            });
            navigate('/restaurant/dashboard', { replace: true });
            return; // Important: return early to prevent further execution
          } else if (detectedUserType === 'delivery') {
            // Check if delivery onboarding is complete
            const { data: deliveryUserData } = await supabase
              .from('delivery_users')
              .select('id, is_approved')
              .eq('user_id', data.user.id)
              .maybeSingle();

            if (deliveryUserData?.id) {
              if (deliveryUserData.is_approved) {
                toast({
                  title: "Welcome back",
                  description: "You have been logged in as a delivery partner",
                });
                navigate('/delivery/dashboard', { replace: true });
              } else {
                toast({
                  title: "Welcome back",
                  description: "Your delivery account is pending approval",
                });
                navigate('/delivery/onboarding', { replace: true });
              }
            } else {
              toast({
                title: "Welcome",
                description: "Please complete your delivery partner onboarding",
              });
              navigate('/delivery/onboarding', { replace: true });
            }
            return; // Important: return early to prevent further execution
          } else {
            // Regular customer flow - prompt for location
            console.log('AuthForm - Customer user, showing location prompt');
            toast({
              title: "Welcome back",
              description: "You have been logged in successfully",
            });
            setShowLocationPrompt(true);
          }
        }
      }
    } catch (error: any) {
      console.error('AuthForm - Authentication error:', error);
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
    navigate('/customer', { replace: true });
  };
  
  const handlePermissionDenied = () => {
    toast({
      title: "Location Access Limited",
      description: "Some features will be limited without location access",
      variant: "destructive",
    });
    navigate('/customer', { replace: true });
  };
  
  const handleDismiss = () => {
    setShowLocationPrompt(false);
    navigate('/customer', { replace: true });
  };
  
  // Handle biometric login success
  const handleBiometricSuccess = () => {
    setShowLocationPrompt(true);
  };
  
  // Handle biometric login error
  const handleBiometricError = (error: any) => {
    console.error("Biometric login error:", error);
    toast({
      title: "Biometric login failed",
      description: "Please login with your email and password instead.",
      variant: "destructive",
    });
  };

  // Render the location prompt or the auth form
  if (showLocationPrompt) {
    return (
      <LocationPermissionsPrompt
        onRequestPermission={requestPermission}
        isLoading={false}
        onPermissionGranted={handlePermissionGranted}
        onPermissionDenied={handlePermissionDenied}
        onDismiss={handleDismiss}
      />
    );
  }

  // Safely determine if biometric login should be rendered
  const shouldShowBiometricButton = () => {
    if (mode !== 'login') return false;
    
    try {
      return platformInitialized && Platform.isNative();
    } catch (error) {
      console.warn("Error checking platform for biometrics:", error);
      return false;
    }
  };

  // Render biometric button with error boundary
  const renderBiometricButton = () => {
    if (!shouldShowBiometricButton()) return null;
    
    return (
      <BiometricErrorBoundary>
        <BiometricLoginButton 
          onSuccess={handleBiometricSuccess} 
          onError={handleBiometricError}
        />
      </BiometricErrorBoundary>
    );
  };

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
      
      {renderBiometricButton()}

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
