
import { registerPlugin } from '@capacitor/core';

export interface BiometricPluginInterface {
  isAvailable(): Promise<{ available: boolean, biometryType: string }>;
  authenticate(options: { reason: string, title: string }): Promise<{ authenticated: boolean }>;
  setupBiometricLogin(options: { userId: string, token: string }): Promise<{ success: boolean }>;
}

// Register the plugin with a stub implementation for web
const BiometricAuth = registerPlugin<BiometricPluginInterface>('BiometricAuth', {
  web: () => import('./web/BiometricAuthWeb').then(m => new m.BiometricAuthWeb()),
});

export { BiometricAuth };
