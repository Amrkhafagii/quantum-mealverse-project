
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { Switch } from '@/components/ui/switch';
import { Fingerprint, ShieldCheck } from 'lucide-react';

export const BiometricSetupCard: React.FC = () => {
  const { 
    isAvailable, 
    biometryType, 
    isBiometricSetup,
    setupBiometricLogin,
    disableBiometricLogin
  } = useBiometricAuth();
  
  if (!isAvailable) {
    return null;
  }
  
  const biometricTypeName = 
    biometryType === 'faceId' ? 'Face ID' : 
    biometryType === 'touchId' ? 'Touch ID' : 
    'Fingerprint';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-quantum-cyan" />
          Biometric Authentication
        </CardTitle>
        <CardDescription>
          Enable quick and secure login with your device's biometrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-gray-600" />
            <span>Sign in with {biometricTypeName}</span>
          </div>
          <Switch
            checked={isBiometricSetup}
            onCheckedChange={(checked) => {
              if (checked) {
                setupBiometricLogin();
              } else {
                disableBiometricLogin();
              }
            }}
          />
        </div>
        
        <p className="text-sm text-gray-500">
          {isBiometricSetup
            ? `You can now sign in quickly using ${biometricTypeName}.`
            : `Enable ${biometricTypeName} to sign in without typing your password.`}
        </p>
      </CardContent>
    </Card>
  );
};
