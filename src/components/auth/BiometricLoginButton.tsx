
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint, Scan, ShieldCheck } from 'lucide-react'; // Fixed FaceIcon import
import { Platform } from '@/utils/platform';
import { getBiometricAuthImplementation } from '@/services/auth/biometricAuthService';

interface BiometricLoginButtonProps {
  userId?: string;
  onAuthSuccess: (token: string) => void;
  onAuthError: (error: Error) => void;
  className?: string;
}

export const BiometricLoginButton: React.FC<BiometricLoginButtonProps> = ({
  userId,
  onAuthSuccess,
  onAuthError,
  className = '',
}) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the appropriate biometric implementation for the platform
  const biometricAuth = getBiometricAuthImplementation();
  
  useEffect(() => {
    checkBiometricAvailability();
  }, []);
  
  const checkBiometricAvailability = async () => {
    try {
      const { available, biometryType } = await biometricAuth.isAvailable();
      setIsAvailable(available);
      setBiometricType(biometryType);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
    }
  };
  
  const handleBiometricAuth = async () => {
    if (!isAvailable || !userId) return;
    
    setIsLoading(true);
    
    try {
      const { authenticated } = await biometricAuth.authenticate({
        reason: 'Login to your account',
        title: 'Biometric Authentication',
      });
      
      if (authenticated) {
        // In a real app, we would validate the stored biometric credentials
        // with the server and get a new authentication token
        const dummyToken = `biometric-${userId}-${Date.now()}`;
        onAuthSuccess(dummyToken);
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      onAuthError(error instanceof Error ? error : new Error('Authentication failed'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Don't render the button if biometrics aren't available
  if (!isAvailable) return null;
  
  // Choose appropriate icon based on biometric type
  let BiometricIcon = Fingerprint;
  if (biometricType === 'face' || biometricType === 'faceId') {
    BiometricIcon = Scan;
  } else if (biometricType === 'webauthn') {
    BiometricIcon = ShieldCheck;
  }
  
  return (
    <Button
      variant="outline"
      onClick={handleBiometricAuth}
      disabled={isLoading || !isAvailable}
      className={`${className} flex items-center justify-center gap-2`}
    >
      <BiometricIcon className="h-5 w-5" />
      <span>
        {Platform.isIOS && biometricType === 'faceId'
          ? 'Sign in with Face ID'
          : Platform.isIOS && biometricType === 'touchId'
          ? 'Sign in with Touch ID'
          : Platform.isAndroid
          ? 'Sign in with Biometrics'
          : 'Use Biometric Login'}
      </span>
    </Button>
  );
};

export default BiometricLoginButton;
