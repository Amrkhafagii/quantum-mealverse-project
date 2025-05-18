
import { BiometricPluginInterface } from '@/plugins/BiometricAuthPlugin';
import { Platform } from '@/utils/platform';
import { BiometricAuthWeb } from '@/plugins/web/BiometricAuthWeb';

// This would be imported separately for native platforms
const createBiometricAuthNative = (): BiometricPluginInterface => {
  try {
    if (Platform.isIOS) {
      // iOS implementation would be imported here
      return new BiometricAuthWeb(); // Placeholder until we have iOS implementation
    } else if (Platform.isAndroid) {
      // Android implementation would be imported here
      return new BiometricAuthWeb(); // Placeholder until we have Android implementation
    }
  } catch (e) {
    console.error('Error creating native biometric implementation:', e);
  }
  
  // Fallback to web implementation
  return new BiometricAuthWeb();
};

export const getBiometricAuthImplementation = (): BiometricPluginInterface => {
  if (Platform.isWeb) {
    return new BiometricAuthWeb();
  }
  return createBiometricAuthNative();
};

/**
 * Checks if biometrics are available for the current device
 */
export const checkBiometricAvailability = async (): Promise<{
  available: boolean;
  biometryType: string;
}> => {
  const biometricAuth = getBiometricAuthImplementation();
  return await biometricAuth.isAvailable();
};

/**
 * Performs biometric authentication
 */
export const authenticateWithBiometrics = async (options: {
  reason: string;
  title: string;
}): Promise<{ authenticated: boolean }> => {
  const biometricAuth = getBiometricAuthImplementation();
  return await biometricAuth.authenticate(options);
};

/**
 * Sets up biometric login for the user
 */
export const setupBiometricLogin = async (options: {
  userId: string;
  token: string;
}): Promise<{ success: boolean }> => {
  const biometricAuth = getBiometricAuthImplementation();
  return await biometricAuth.setupBiometricLogin(options);
};
