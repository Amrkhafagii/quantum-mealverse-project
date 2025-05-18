
import { useState, useCallback, useEffect } from 'react';
import { BiometricAuth } from '@/plugins/BiometricAuthPlugin';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Platform } from '@/utils/platform';

export const useBiometricAuth = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<string>('none');
  const [isBiometricSetup, setIsBiometricSetup] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Check if biometric auth is available
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        // Only check on native platforms
        if (!Platform.isNative()) {
          setIsAvailable(false);
          return;
        }
        
        const result = await BiometricAuth.isAvailable();
        setIsAvailable(result.available);
        setBiometryType(result.biometryType);
        
        // Check if the current user has set up biometric login
        if (result.available && user) {
          const hasSetup = localStorage.getItem(`biometric_setup_${user.id}`);
          setIsBiometricSetup(hasSetup === 'true');
        }
      } catch (error) {
        console.error('Error checking biometric availability:', error);
        setIsAvailable(false);
      }
    };
    
    checkBiometricAvailability();
  }, [user]);
  
  // Function to authenticate using biometrics
  const authenticateWithBiometrics = useCallback(async (reason: string = "Verify your identity") => {
    if (!isAvailable) {
      toast({
        title: "Biometric authentication unavailable",
        description: "Your device doesn't support biometric authentication",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      const result = await BiometricAuth.authenticate({
        reason,
        title: "Authentication Required"
      });
      
      return result.authenticated;
    } catch (error: any) {
      // Don't show an error for user cancellation
      if (error.message !== 'User canceled') {
        toast({
          title: "Authentication failed",
          description: error.message || "Could not authenticate with biometrics",
          variant: "destructive"
        });
      }
      return false;
    }
  }, [isAvailable, toast]);
  
  // Function to set up biometric login for a user
  const setupBiometricLogin = useCallback(async () => {
    if (!isAvailable || !user) {
      toast({
        title: "Setup failed",
        description: "Biometric authentication is not available or you're not logged in",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      // First authenticate to confirm identity
      const authenticated = await authenticateWithBiometrics("Set up biometric login");
      
      if (!authenticated) {
        return false;
      }
      
      // Store the user's authentication token securely
      const token = localStorage.getItem('quantum_mealverse_token') || 'fake_token';
      
      const result = await BiometricAuth.setupBiometricLogin({
        userId: user.id,
        token
      });
      
      if (result.success) {
        // Mark as set up in local storage for UI state
        localStorage.setItem(`biometric_setup_${user.id}`, 'true');
        setIsBiometricSetup(true);
        
        toast({
          title: "Biometric login enabled",
          description: `You can now sign in using ${biometryType === 'faceId' ? 'Face ID' : 'Touch ID'}`
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      toast({
        title: "Setup failed",
        description: error.message || "Could not set up biometric authentication",
        variant: "destructive"
      });
      return false;
    }
  }, [isAvailable, user, toast, authenticateWithBiometrics, biometryType]);
  
  // Function to disable biometric login
  const disableBiometricLogin = useCallback(async () => {
    if (!user) return false;
    
    try {
      // In a real implementation, we would revoke the token on the server
      localStorage.removeItem(`biometric_setup_${user.id}`);
      setIsBiometricSetup(false);
      
      toast({
        title: "Biometric login disabled",
        description: "You've successfully disabled biometric login"
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not disable biometric login",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);
  
  return {
    isAvailable,
    biometryType,
    isBiometricSetup,
    authenticateWithBiometrics,
    setupBiometricLogin,
    disableBiometricLogin
  };
};
