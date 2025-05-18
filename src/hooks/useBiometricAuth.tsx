
import React, { useState, useEffect } from 'react';
import { BiometricAuth } from '@/plugins/BiometricAuthPlugin';
import { useToast } from '@/components/ui/use-toast';
import { Platform } from '@/utils/platform';

export function useBiometricAuth() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<string>('none');
  const [isBiometricSetup, setIsBiometricSetup] = useState(false);
  const { toast } = useToast();
  
  // Check if biometric authentication is available
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const result = await BiometricAuth.isAvailable();
        setIsAvailable(result.available);
        setBiometryType(result.biometryType);
        
        // Check if biometric login has been set up
        const userId = localStorage.getItem('biometric_user_id');
        setIsBiometricSetup(!!userId);
      } catch (error) {
        console.error('Error checking biometric availability:', error);
        setIsAvailable(false);
        setBiometryType('none');
      }
    };
    
    checkAvailability();
  }, []);
  
  // Authenticate with biometrics
  const authenticateWithBiometrics = async (reason: string): Promise<boolean> => {
    if (!isAvailable) {
      toast({
        title: "Biometrics unavailable",
        description: "Your device doesn't support biometric authentication.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      const result = await BiometricAuth.authenticate({
        reason,
        title: "Authenticate with Biometrics"
      });
      
      return result.authenticated;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      toast({
        title: "Authentication failed",
        description: "Biometric authentication failed. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Set up biometric login
  const setupBiometricLogin = async () => {
    if (!isAvailable) {
      toast({
        title: "Biometrics unavailable",
        description: "Your device doesn't support biometric authentication.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // In a real implementation, we would store a secure token here
      // For this demo, we'll just store a user ID
      const mockUserId = "user123";
      const mockToken = "secure_token_would_go_here";
      
      const result = await BiometricAuth.setupBiometricLogin({
        userId: mockUserId,
        token: mockToken
      });
      
      if (result.success) {
        localStorage.setItem('biometric_user_id', mockUserId);
        setIsBiometricSetup(true);
        
        toast({
          title: "Biometric login enabled",
          description: `You can now use ${biometryType === 'faceId' ? 'Face ID' : 'Touch ID'} to sign in.`
        });
      }
    } catch (error) {
      console.error('Error setting up biometric login:', error);
      toast({
        title: "Setup failed",
        description: "Could not set up biometric login. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Disable biometric login
  const disableBiometricLogin = () => {
    localStorage.removeItem('biometric_user_id');
    setIsBiometricSetup(false);
    
    toast({
      title: "Biometric login disabled",
      description: "Biometric authentication has been disabled."
    });
  };
  
  return {
    isAvailable,
    biometryType,
    isBiometricSetup,
    authenticateWithBiometrics,
    setupBiometricLogin,
    disableBiometricLogin
  };
}
