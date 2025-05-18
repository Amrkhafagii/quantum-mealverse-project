
import { WebPlugin } from '@capacitor/core';
import type { BiometricPluginInterface } from '../BiometricAuthPlugin';

export class BiometricAuthWeb extends WebPlugin implements BiometricPluginInterface {
  async isAvailable(): Promise<{ available: boolean, biometryType: string }> {
    // Check for WebAuthn support in modern browsers
    const webAuthnSupported = window.PublicKeyCredential !== undefined;
    
    return {
      available: webAuthnSupported,
      biometryType: webAuthnSupported ? 'webauthn' : 'none'
    };
  }

  async authenticate(options: { reason: string, title: string }): Promise<{ authenticated: boolean }> {
    console.log('Attempting WebAuthn authentication in web browser');
    
    // For web implementation, we could implement WebAuthn here
    // For now, we'll return false as this needs a more complex implementation
    return { authenticated: false };
  }

  async setupBiometricLogin(options: { userId: string, token: string }): Promise<{ success: boolean }> {
    console.log('WebAuthn setup not implemented in web browser yet');
    return { success: false };
  }
}
