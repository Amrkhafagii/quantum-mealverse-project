
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Fingerprint, FaceIcon } from 'lucide-react';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { Platform } from '@/utils/platform';

interface BiometricLoginButtonProps {
  onSuccess: () => void;
}

export const BiometricLoginButton: React.FC<BiometricLoginButtonProps> = ({ 
  onSuccess 
}) => {
  const { 
    isAvailable, 
    biometryType,
    authenticateWithBiometrics 
  } = useBiometricAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!isAvailable || !Platform.isNative) return null;

  const handleBiometricLogin = async () => {
    setIsLoading(true);
    try {
      const success = await authenticateWithBiometrics("Log in to HealthAndFix");
      if (success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Biometric login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBiometricIcon = () => {
    if (biometryType === 'faceId') {
      return <FaceIcon className="mr-2 h-4 w-4" />;
    }
    return <Fingerprint className="mr-2 h-4 w-4" />;
  };

  const getBiometricText = () => {
    if (biometryType === 'faceId') {
      return "Sign in with Face ID";
    }
    return "Sign in with Touch ID";
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full mt-3 flex items-center justify-center"
      onClick={handleBiometricLogin}
      disabled={isLoading}
    >
      {getBiometricIcon()}
      {isLoading ? "Authenticating..." : getBiometricText()}
    </Button>
  );
};
