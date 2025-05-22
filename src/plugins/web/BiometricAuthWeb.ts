
import { WebPlugin } from '@capacitor/core';
import type { BiometricPluginInterface } from '../BiometricAuthPlugin';

export class BiometricAuthWeb extends WebPlugin implements BiometricPluginInterface {
  // Check for WebAuthn support with fallback and error handling
  async isAvailable(): Promise<{ available: boolean, biometryType: string }> {
    try {
      // Check for WebAuthn support in modern browsers
      const webAuthnSupported = typeof window !== 'undefined' && 
                               window.PublicKeyCredential !== undefined;
      
      // If supported, try to determine if the device has a platform authenticator
      if (webAuthnSupported) {
        try {
          // Check if platform authenticator is available (like TouchID, FaceID)
          // This is non-blocking and will fail gracefully
          const platformAuthenticatorAvailable = await new Promise<boolean>((resolve) => {
            try {
              if (window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable) {
                window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
                  .then(resolve)
                  .catch(() => resolve(false));
                
                // Set a timeout in case the promise never resolves
                setTimeout(() => resolve(false), 1000);
              } else {
                resolve(false);
              }
            } catch (e) {
              console.warn('Error checking platform authenticator:', e);
              resolve(false);
            }
          });
          
          return {
            available: platformAuthenticatorAvailable,
            biometryType: platformAuthenticatorAvailable ? 'webauthn' : 'none'
          };
        } catch (inner) {
          console.warn('Error in WebAuthn platform check:', inner);
          return { available: false, biometryType: 'none' };
        }
      }
      
      return { available: false, biometryType: 'none' };
    } catch (error) {
      console.error('Error in BiometricAuthWeb.isAvailable:', error);
      return { available: false, biometryType: 'none' };
    }
  }

  async authenticate(options: { reason: string, title: string }): Promise<{ authenticated: boolean }> {
    try {
      console.log('Attempting WebAuthn authentication in web browser', options);
      
      // Web implementation is a stub - in a real app, this would implement WebAuthn
      // This is a safe fallback that just returns false
      return { authenticated: false };
    } catch (error) {
      console.error('Error in BiometricAuthWeb.authenticate:', error);
      return { authenticated: false };
    }
  }

  async setupBiometricLogin(options: { userId: string, token: string }): Promise<{ success: boolean }> {
    try {
      console.log('Setting up WebAuthn in browser (stub implementation)', options);
      
      // Web implementation is a stub - in a real app, this would implement WebAuthn
      // This is a safe fallback that just returns false
      return { success: false };
    } catch (error) {
      console.error('Error in BiometricAuthWeb.setupBiometricLogin:', error);
      return { success: false };
    }
  }
}
