
import { useState, useEffect, useCallback } from 'react';
import { Platform } from '@/utils/platform';
import { useToast } from '@/components/ui/use-toast';

// BiometryType corresponds to the device's biometric authentication mechanism
export type BiometryType = 'faceId' | 'touchId' | 'fingerprint' | 'webauthn' | 'none';

// Custom hook for biometric authentication
export const useBiometricAuth = () => {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [biometryType, setBiometryType] = useState<BiometryType>('none');
  const [isBiometricSetup, setIsBiometricSetup] = useState<boolean>(false);
  const { toast } = useToast();

  // Initialize biometric authentication
  useEffect(() => {
    let mounted = true;
    const maxRetries = 10; // Maximum number of retries
    let retryCount = 0;
    let retryTimer: number | undefined;

    const initBiometrics = async () => {
      try {
        // Check if platform is initialized first
        if (!Platform.isInitialized || !Platform.isInitialized()) {
          if (retryCount < maxRetries) {
            retryCount++;
            retryTimer = window.setTimeout(initBiometrics, 300);
            return;
          } else {
            // Give up after max retries
            console.warn('Platform not initialized after maximum retries');
            if (mounted) setIsInitialized(true); // Mark as initialized anyway to avoid UI blocking
            return;
          }
        }

        // Check if we're in a native app environment
        const isNativeApp = Platform.isNative();
        
        if (!isNativeApp) {
          // Web environment - check for WebAuthn support
          const hasWebAuthn = typeof window !== 'undefined' && 
                             window.PublicKeyCredential !== undefined;
          
          if (hasWebAuthn) {
            // Check if browser supports WebAuthn conditionally
            const isWebAuthnAvailable = hasWebAuthn && 
              (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
            
            if (mounted) {
              setIsAvailable(isWebAuthnAvailable);
              setBiometryType(isWebAuthnAvailable ? 'webauthn' : 'none');
              setIsInitialized(true);
              
              // Check if biometric login is set up
              const hasBiometricId = !!localStorage.getItem('biometric_user_id');
              setIsBiometricSetup(hasBiometricId && isWebAuthnAvailable);
            }
            
            return;
          }
          
          // WebAuthn not available
          if (mounted) {
            setIsAvailable(false);
            setBiometryType('none');
            setIsInitialized(true);
          }
          
          return;
        }
        
        try {
          // Native environment - dynamically import the BiometricAuth module
          const biometricModule = await import('../plugins/BiometricAuthPlugin');
          const BiometricAuth = biometricModule.BiometricAuth;
          
          try {
            // First try using checkBiometryAvailability
            const availabilityCheck = await BiometricAuth.checkBiometryAvailability();
            const type = availabilityCheck.biometryType?.toLowerCase() as BiometryType;
            const available = availabilityCheck.isAvailable === true;
            
            // Get stored biometric ID to check if it's set up
            const storedBiometricId = localStorage.getItem('biometric_user_id');
            
            if (mounted) {
              setIsAvailable(available);
              setBiometryType(available ? type : 'none');
              setIsBiometricSetup(!!storedBiometricId && available);
              setIsInitialized(true);
            }
          } catch (methodError: any) {
            // If checkBiometryAvailability is not implemented, try isAvailable
            if (methodError?.code === 'UNIMPLEMENTED') {
              console.log('checkBiometryAvailability not implemented, falling back to isAvailable');
              
              const fallbackCheck = await BiometricAuth.isAvailable();
              const type = fallbackCheck.biometryType?.toLowerCase() as BiometryType;
              const available = fallbackCheck.available === true;
              
              // Get stored biometric ID to check if it's set up
              const storedBiometricId = localStorage.getItem('biometric_user_id');
              
              if (mounted) {
                setIsAvailable(available);
                setBiometryType(available ? type : 'none');
                setIsBiometricSetup(!!storedBiometricId && available);
                setIsInitialized(true);
              }
            } else {
              throw methodError;
            }
          }
        } catch (error) {
          console.error('Error initializing biometric auth:', error);
          if (mounted) {
            setIsAvailable(false);
            setBiometryType('none');
            setIsInitialized(true);
          }
        }
      } catch (error) {
        console.error('Error in biometric initialization:', error);
        if (mounted) {
          setIsAvailable(false);
          setBiometryType('none');
          setIsInitialized(true);
        }
      }
    };

    initBiometrics();

    return () => {
      mounted = false;
      if (retryTimer !== undefined) {
        clearTimeout(retryTimer);
      }
    };
  }, []);

  // Authenticate with biometrics
  const authenticateWithBiometrics = useCallback(async (reason?: string): Promise<boolean> => {
    try {
      if (!isAvailable) {
        console.warn('Biometric authentication not available');
        return false;
      }

      if (biometryType === 'webauthn' && !Platform.isNative()) {
        // Web implementation would use WebAuthn
        try {
          // Mock implementation for demo
          console.log('WebAuthn authentication would happen here');
          return true;
        } catch (error) {
          console.error('WebAuthn authentication error:', error);
          return false;
        }
      }

      // Native implementation
      try {
        // Dynamic import to avoid loading in web environments
        const biometricModule = await import('../plugins/BiometricAuthPlugin');
        const BiometricAuth = biometricModule.BiometricAuth;
        
        try {
          // Try with all parameters first
          const result = await BiometricAuth.authenticate({
            reason: reason || 'Authenticate to continue',
            title: 'Authenticate',
            cancelTitle: 'Cancel',
          });
          
          return result?.authenticated === true;
        } catch (paramError: any) {
          // If the error is related to unsupported parameters, try with fewer parameters
          if (paramError?.code === 'UNIMPLEMENTED' || paramError?.message?.includes('does not exist')) {
            console.log('Full authentication parameters not supported, trying with reduced parameters');
            
            // Try with just the reason
            const fallbackResult = await BiometricAuth.authenticate({
              reason: reason || 'Authenticate to continue'
            });
            
            return fallbackResult?.authenticated === true;
          } else {
            throw paramError;
          }
        }
      } catch (error) {
        console.error('Native biometric authentication error:', error);
        // Show error toast
        toast({
          title: "Authentication Error",
          description: "Could not authenticate with biometrics. Please try again or use your password.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error in authenticateWithBiometrics:', error);
      return false;
    }
  }, [isAvailable, biometryType, toast]);

  // Set up biometric login
  const setupBiometricLogin = useCallback(async (): Promise<boolean> => {
    try {
      if (!isAvailable) {
        toast({
          title: "Setup Failed",
          description: "Biometric authentication is not available on this device",
          variant: "destructive",
        });
        return false;
      }

      // For demo purposes, just store a mock user ID
      // In a real app, we would store encrypted credentials
      const userId = 'demo-user-id';
      localStorage.setItem('biometric_user_id', userId);
      setIsBiometricSetup(true);

      toast({
        title: "Biometric Login Enabled",
        description: "You can now use biometrics to sign in",
      });

      return true;
    } catch (error) {
      console.error('Error setting up biometric login:', error);
      
      toast({
        title: "Setup Failed",
        description: "Could not enable biometric login",
        variant: "destructive",
      });
      
      return false;
    }
  }, [isAvailable, toast]);

  // Disable biometric login
  const disableBiometricLogin = useCallback((): boolean => {
    try {
      localStorage.removeItem('biometric_user_id');
      setIsBiometricSetup(false);
      
      toast({
        title: "Biometric Login Disabled",
        description: "Biometric login has been turned off",
      });
      
      return true;
    } catch (error) {
      console.error('Error disabling biometric login:', error);
      
      toast({
        title: "Error",
        description: "Could not disable biometric login",
        variant: "destructive",
      });
      
      return false;
    }
  }, [toast]);

  return {
    isAvailable,
    biometryType,
    isInitialized,
    isBiometricSetup,
    authenticateWithBiometrics,
    setupBiometricLogin,
    disableBiometricLogin,
  };
};

export default useBiometricAuth;
