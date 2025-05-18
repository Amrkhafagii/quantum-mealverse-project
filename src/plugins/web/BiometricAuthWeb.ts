
import { BiometricPluginInterface } from '../BiometricAuthPlugin';

export class BiometricAuthWeb implements BiometricPluginInterface {
  async isAvailable(): Promise<{ available: boolean, biometryType: string }> {
    // Web platform doesn't naturally support biometrics, so check if browser supports WebAuthn
    const isWebAuthnSupported = window && 
      window.PublicKeyCredential && 
      typeof window.PublicKeyCredential !== 'undefined';
    
    return {
      available: isWebAuthnSupported,
      biometryType: isWebAuthnSupported ? 'webauthn' : 'none'
    };
  }

  async authenticate(options: { reason: string, title: string }): Promise<{ authenticated: boolean }> {
    console.log('Web biometrics authentication requested:', options);
    
    // On web, we'd implement WebAuthn here
    // For now, just return a simulated successful authentication
    return { authenticated: true };
  }

  async setupBiometricLogin(options: { userId: string, token: string }): Promise<{ success: boolean }> {
    console.log('Web biometrics setup requested:', options);
    
    // On web, we'd implement WebAuthn registration here
    // For now, just return a simulated successful setup
    return { success: true };
  }
}
