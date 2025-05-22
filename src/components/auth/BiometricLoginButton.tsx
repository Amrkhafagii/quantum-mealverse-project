
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAvailableLocal, setIsAvailableLocal] = useState(false);
  const [biometryTypeLocal, setBiometryTypeLocal] = useState<string | null>(null);
  const { isAvailable, biometryType, authenticateWithBiometrics } = useBiometricAuth();
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Initialize biometric state safely
  useEffect(() => {
    let isMounted = true;
    
    const initBiometricState = async () => {
      try {
        // Wait for a small delay to ensure all systems are initialized
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (isMounted) {
          setIsAvailableLocal(isAvailable);
          setBiometryTypeLocal(biometryType || null);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing biometric state:', error);
        if (isMounted) {
          setIsInitialized(true);
          setIsAvailableLocal(false);
        }
      }
    };
    
    initBiometricState();
    
    return () => {
      isMounted = false;
    };
  }, [isAvailable, biometryType]);
  
  // Don't render anything until initialization is complete
  if (!isInitialized) {
    return null;
  }
  
  // Only show if biometrics are available and we're on a native platform
  if (!isAvailableLocal || !Platform.isNative()) {
    return null;
  }
  
  const handleBiometricLogin = async () => {
    try {
      const authenticated = await authenticateWithBiometrics("Sign in to your account");
      
      if (authenticated) {
        // In a real implementation, this would retrieve a stored token
        // and validate it with the server
        const storedUserId = localStorage.getItem('biometric_user_id');
        
        if (storedUserId) {
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
    }
  };
  
  const getButtonText = () => {
    if (biometryTypeLocal === 'faceId') {
      return 'Sign in with Face ID';
    } else if (biometryTypeLocal === 'touchId' || biometryTypeLocal === 'fingerprint') {
      return 'Sign in with Touch ID';
    } else if (biometryTypeLocal === 'webauthn') {
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
    >
      <Fingerprint className="mr-2 h-4 w-4" />
      {getButtonText()}
    </Button>
  );
};

export default BiometricLoginButton;
