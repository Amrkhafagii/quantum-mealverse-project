
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { LocationPermissionFlow } from '@/components/auth/LocationPermissionFlow';
import { UserType } from '@/services/locationService';

interface AuthFormProps {
  isRegister?: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ isRegister = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'customer' | 'restaurant' | 'delivery'>('customer');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLocationFlow, setShowLocationFlow] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Hide location flow if user is already authenticated
  useEffect(() => {
    if (user) {
      setShowLocationFlow(false);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        console.log('AuthForm: Attempting to register user', { email, userType });
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_type: userType,
            },
          },
        });

        if (error) {
          console.error('AuthForm: Registration error', error);
          throw error;
        }

        if (data.user) {
          console.log('AuthForm: Registration successful', data.user.id);
          setUserId(data.user.id);
          setShowLocationFlow(true);
          
          toast({
            title: "Account created successfully!",
            description: "Please check your email to verify your account.",
          });
        }
      } else {
        console.log('AuthForm: Attempting to sign in user', { email });
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('AuthForm: Sign in error', error);
          throw error;
        }

        if (data.user) {
          console.log('AuthForm: Sign in successful', data.user.id);
          
          // Get user type from metadata or database
          const userMetadata = data.user.user_metadata;
          if (userMetadata?.user_type) {
            setUserType(userMetadata.user_type as UserType);
            setUserId(data.user.id);
            setShowLocationFlow(true);
          } else {
            // Fallback: try to get from database
            const { data: userTypeData } = await supabase
              .from('user_types')
              .select('type')
              .eq('user_id', data.user.id)
              .single();

            if (userTypeData?.type) {
              setUserType(userTypeData.type as UserType);
              setUserId(data.user.id);
              setShowLocationFlow(true);
            }
          }
          
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully.",
          });
        }
      }
    } catch (error: any) {
      console.error('AuthForm: Authentication error', error);
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSuccess = (coordinates: { latitude: number; longitude: number }) => {
    console.log('AuthForm: Location permission granted:', coordinates);
    setShowLocationFlow(false);
    
    // Navigate based on user type
    setTimeout(() => {
      switch (userType) {
        case 'delivery':
          navigate('/delivery/dashboard');
          break;
        case 'restaurant':
          navigate('/restaurant/dashboard');
          break;
        case 'customer':
        default:
          navigate('/customer');
          break;
      }
    }, 1000);
  };

  const handleLocationError = (error: string) => {
    console.error('AuthForm: Location permission error:', error);
    // Continue navigation even if location fails
    handleLocationSkip();
  };

  const handleLocationSkip = () => {
    console.log('AuthForm: Location permission skipped');
    setShowLocationFlow(false);
    
    // Navigate based on user type even without location
    setTimeout(() => {
      switch (userType) {
        case 'delivery':
          navigate('/delivery/dashboard');
          break;
        case 'restaurant':
          navigate('/restaurant/dashboard');
          break;
        case 'customer':
        default:
          navigate('/customer');
          break;
      }
    }, 500);
  };

  // Show location flow after successful auth
  if (showLocationFlow && userId) {
    return (
      <div className="space-y-6">
        <LocationPermissionFlow
          userType={userType}
          userId={userId}
          onSuccess={handleLocationSuccess}
          onError={handleLocationError}
          onSkip={handleLocationSkip}
          autoRequest={false}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isRegister && (
        <div className="space-y-2">
          <Label htmlFor="userType" className="text-quantum-cyan">Account Type</Label>
          <select
            id="userType"
            value={userType}
            onChange={(e) => setUserType(e.target.value as 'customer' | 'restaurant' | 'delivery')}
            className="w-full px-3 py-2 bg-quantum-darkBlue border border-quantum-cyan/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-quantum-cyan"
            required
          >
            <option value="customer">Customer</option>
            <option value="restaurant">Restaurant Owner</option>
            <option value="delivery">Delivery Driver</option>
          </select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-quantum-cyan">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-quantum-darkBlue border-quantum-cyan/30 text-white placeholder:text-gray-400"
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-quantum-cyan">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-quantum-darkBlue border-quantum-cyan/30 text-white placeholder:text-gray-400 pr-10"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black font-medium"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isRegister ? 'Creating Account...' : 'Signing In...'}
          </>
        ) : (
          isRegister ? 'Create Account' : 'Sign In'
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="text-quantum-cyan hover:text-quantum-cyan/80 text-sm underline"
        >
          {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </form>
  );
};

export { AuthForm };
