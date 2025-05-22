
import { registerPlugin } from '@capacitor/core';

export interface BiometricPluginInterface {
  isAvailable(): Promise<{ available: boolean, biometryType: string }>;
  authenticate(options: { reason: string, title: string }): Promise<{ authenticated: boolean }>;
  setupBiometricLogin(options: { userId: string, token: string }): Promise<{ success: boolean }>;
}

// Create a safely initialized plugin with proper error handling
const createSafeBiometricAuth = () => {
  try {
    // Register the plugin with a stub implementation for web
    return registerPlugin<BiometricPluginInterface>('BiometricAuth', {
      web: () => import('./web/BiometricAuthWeb').then(m => new m.BiometricAuthWeb()),
    });
  } catch (error) {
    console.error('Error initializing BiometricAuth plugin:', error);
    
    // Return a fallback implementation that won't crash the app
    return {
      isAvailable: async (): Promise<{available: boolean, biometryType: string}> => 
        ({ available: false, biometryType: 'none' }),
      authenticate: async (): Promise<{authenticated: boolean}> => 
        ({ authenticated: false }),
      setupBiometricLogin: async (): Promise<{success: boolean}> => 
        ({ success: false })
    } as BiometricPluginInterface;
  }
};

// Safely initialize the plugin
const BiometricAuth = createSafeBiometricAuth();

export { BiometricAuth };
