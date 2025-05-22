
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Fingerprint } from 'lucide-react';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { Platform } from '@/utils/platform';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export interface BiometricLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const BiometricLoginButton: React.FC<BiometricLoginButtonProps> = ({ 
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const [platformReady, setPlatformReady] = useState(false);
  const { 
    isAvailable, 
    biometryType, 
    authenticateWithBiometrics, 
    isInitialized 
  } = useBiometricAuth();
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check if platform is initialized before proceeding
  useEffect(() => {
    const checkPlatform = () => {
      // Use try/catch to safely check platform initialization
      try {
        if (Platform.isInitialized()) {
          setPlatformReady(true);
        } else {
          // Try again in 100ms if platform is not initialized
          setTimeout(checkPlatform, 100);
        }
      } catch (error) {
        console.warn("Error checking platform initialization:", error);
        setPlatformReady(false);
      }
    };
    
    checkPlatform();
  }, []);
  
  // Don't render anything if:
  // 1. Platform is not ready
  // 2. Biometric auth is not initialized yet
  // 3. Biometrics are not available
  // 4. We're not on a native platform (web)
  if (!platformReady || !isInitialized || !isAvailable || !Platform.isNative()) {
    return null;
  }
  
  const handleBiometricLogin = async () => {
    if (loading) return; // Prevent multiple attempts
    
    try {
      setLoading(true);
      const authenticated = await authenticateWithBiometrics("Sign in to your account");
      
      if (authenticated) {
        // In a real implementation, this would retrieve a stored token
        // and validate it with the server
        const storedUserId = localStorage.getItem('biometric_user_id');
        
        if (storedUserId) {
          try {
            // Mock login to simulate success for the demo
            // This would actually retrieve the stored token and use it instead
            await login('user@example.com', 'password');
            
            toast({
              title: "Biometric login successful",
              description: "Welcome back!"
            });
            
            if (onSuccess) {
              onSuccess();
            } else {
              navigate('/');
            }
          } catch (loginError) {
            console.error('Login error after biometric auth:', loginError);
            toast({
              title: "Login failed",
              description: "There was an error completing your login. Please try again with your password.",
              variant: "destructive"
            });
            
            if (onError) {
              onError(loginError);
            }
          }
        } else {
          toast({
            title: "Biometric login failed",
            description: "No stored credentials found. Please log in with your password first.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      toast({
        title: "Biometric login failed",
        description: "There was an error with biometric authentication. Please try again or use your password.",
        variant: "destructive"
      });
      
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const getButtonText = () => {
    if (loading) {
      return 'Authenticating...';
    }
    
    if (biometryType === 'faceId') {
      return 'Sign in with Face ID';
    } else if (biometryType === 'touchId' || biometryType === 'fingerprint') {
      return 'Sign in with Touch ID';
    } else if (biometryType === 'webauthn') {
      return 'Sign in with WebAuthn';
    }
    return 'Sign in with Biometrics';
  };
  
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full mt-4"
      onClick={handleBiometricLogin}
      disabled={loading}
    >
      <Fingerprint className="mr-2 h-4 w-4" />
      {getButtonText()}
    </Button>
  );
};

export default BiometricLoginButton;
