
import React from 'react';
import { Button } from "@/components/ui/button";
import { Fingerprint } from 'lucide-react';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { Platform } from '@/utils/platform';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface BiometricLoginButtonProps {
  onSuccess?: () => void;
}

export const BiometricLoginButton: React.FC<BiometricLoginButtonProps> = ({ onSuccess }) => {
  const { isAvailable, biometryType, authenticateWithBiometrics } = useBiometricAuth();
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Only show if biometrics are available and we're on a native platform
  if (!isAvailable || !Platform.isNative()) {
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
    }
  };
  
  const getButtonText = () => {
    if (biometryType === 'faceId') {
      return 'Sign in with Face ID';
    } else if (biometryType === 'touchId' || biometryType === 'fingerprint') {
      return 'Sign in with Touch ID';
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
