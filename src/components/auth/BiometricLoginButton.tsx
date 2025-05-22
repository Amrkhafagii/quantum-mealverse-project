
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
}

export const BiometricLoginButton: React.FC<BiometricLoginButtonProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { 
    isAvailable, 
    biometryType, 
    authenticateWithBiometrics, 
    isInitialized 
  } = useBiometricAuth();
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Don't render anything if:
  // 1. Biometric auth is not initialized yet
  // 2. Biometrics are not available
  // 3. We're not on a native platform (web)
  if (!isInitialized || !isAvailable || !Platform.isNative()) {
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
