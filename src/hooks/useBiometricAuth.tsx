
import React, { useState, useEffect, useRef } from 'react';
import { BiometricAuth } from '@/plugins/BiometricAuthPlugin';
import { useToast } from '@/components/ui/use-toast';
import { Platform } from '@/utils/platform';

export function useBiometricAuth() {
  // State management
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<string>('none');
  const [isBiometricSetup, setIsBiometricSetup] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  // Use a ref to track initialization attempts and prevent multiple calls
  const initializationAttempted = useRef(false);
  
  // Check if biometric authentication is available - with lazy loading
  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initializationAttempted.current) return;
    initializationAttempted.current = true;
    
    // Lazy load biometric features after a delay to ensure the app is fully loaded
    const timer = setTimeout(() => {
      const checkAvailability = async () => {
        try {
          if (!Platform.isInitialized()) {
            console.log('Platform not initialized yet, delaying biometric check');
            // Retry after a short delay if the platform isn't initialized yet
            setTimeout(checkAvailability, 500);
            return;
          }
          
          // Check availability with proper error handling
          const result = await BiometricAuth.isAvailable();
          setIsAvailable(!!result.available);
          setBiometryType(result.biometryType || 'none');
          
          // Check if biometric login has been set up
          try {
            const userId = localStorage.getItem('biometric_user_id');
            setIsBiometricSetup(!!userId);
          } catch (storageError) {
            console.warn('Error reading from localStorage:', storageError);
            setIsBiometricSetup(false);
          }
          
          // Mark as initialized
          setIsInitialized(true);
          console.log('Biometric authentication initialized:', { 
            available: result.available, 
            type: result.biometryType 
          });
        } catch (error) {
          console.error('Error checking biometric availability:', error);
          setIsAvailable(false);
          setBiometryType('none');
          setIsInitialized(true); // Mark as initialized even on error
        }
      };
      
      checkAvailability();
    }, 1000); // Delay initialization for 1 second to ensure app is stable
    
    return () => clearTimeout(timer);
  }, []);
  
  // Authenticate with biometrics - with improved error handling
  const authenticateWithBiometrics = async (reason: string): Promise<boolean> => {
    if (!isInitialized) {
      console.warn('Biometric authentication not yet initialized');
      toast({
        title: "Biometrics not ready",
        description: "Please try again in a moment.",
        variant: "destructive"
      });
      return false;
    }
    
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
      
      return !!result.authenticated;
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
  
  // Set up biometric login - with improved error handling
  const setupBiometricLogin = async () => {
    if (!isInitialized) {
      console.warn('Biometric authentication not yet initialized');
      toast({
        title: "Biometrics not ready",
        description: "Please try again in a moment.",
        variant: "destructive"
      });
      return;
    }
    
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
        try {
          localStorage.setItem('biometric_user_id', mockUserId);
          setIsBiometricSetup(true);
          
          toast({
            title: "Biometric login enabled",
            description: `You can now use ${biometryType === 'faceId' ? 'Face ID' : 
                          biometryType === 'touchId' ? 'Touch ID' : 
                          'biometric authentication'} to sign in.`
          });
        } catch (storageError) {
          console.error('Error saving to localStorage:', storageError);
          toast({
            title: "Setup incomplete",
            description: "Could not save biometric settings. Please try again.",
            variant: "destructive"
          });
        }
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
  
  // Disable biometric login - with improved error handling
  const disableBiometricLogin = () => {
    try {
      localStorage.removeItem('biometric_user_id');
      setIsBiometricSetup(false);
      
      toast({
        title: "Biometric login disabled",
        description: "Biometric authentication has been disabled."
      });
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      toast({
        title: "Error",
        description: "Could not disable biometric authentication. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return {
    isAvailable,
    biometryType,
    isBiometricSetup,
    isInitialized,
    authenticateWithBiometrics,
    setupBiometricLogin,
    disableBiometricLogin
  };
}
