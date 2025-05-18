
import { WebPlugin } from '@capacitor/core';
import type { BiometricPluginInterface } from '../BiometricAuthPlugin';

export class BiometricAuthWeb extends WebPlugin implements BiometricPluginInterface {
  async isAvailable(): Promise<{ available: boolean, biometryType: string }> {
    // Web browsers don't have native biometrics
    // In a real app, we could check for WebAuthn support
    return {
      available: false,
      biometryType: 'none'
    };
  }

  async authenticate(options: { reason: string, title: string }): Promise<{ authenticated: boolean }> {
    console.log('Biometric authentication not available in web browser');
    return { authenticated: false };
  }

  async setupBiometricLogin(options: { userId: string, token: string }): Promise<{ success: boolean }> {
    console.log('Biometric setup not available in web browser');
    return { success: false };
  }
}
