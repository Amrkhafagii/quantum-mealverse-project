
import { Platform } from '@/utils/platform';

/**
 * Secure storage utility for handling encrypted data across platforms
 */
class SecureStorage {
  /**
   * Encrypt and store data in secure storage
   */
  async setItem(key: string, value: any): Promise<boolean> {
    try {
      if (Platform.isWeb()) {
        await this.encryptAndStoreWeb(key, value);
      } else if (Platform.isIOS()) {
        await this.storeInKeychain(key, value);
      } else if (Platform.isAndroid()) {
        await this.storeInEncryptedPrefs(key, value);
      } else {
        // Fallback to localStorage with basic encryption
        await this.encryptAndStoreWeb(key, value);
      }
      return true;
    } catch (error) {
      console.error('Error storing data securely:', error);
      return false;
    }
  }

  /**
   * Retrieve and decrypt data from secure storage
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      if (Platform.isWeb()) {
        return await this.retrieveAndDecryptWeb<T>(key);
      } else if (Platform.isIOS()) {
        return await this.retrieveFromKeychain<T>(key);
      } else if (Platform.isAndroid()) {
        return await this.retrieveFromEncryptedPrefs<T>(key);
      } else {
        // Fallback to localStorage with basic encryption
        return await this.retrieveAndDecryptWeb<T>(key);
      }
    } catch (error) {
      console.error('Error retrieving data securely:', error);
      return null;
    }
  }

  /**
   * Remove data from secure storage
   */
  async removeItem(key: string): Promise<boolean> {
    try {
      if (Platform.isWeb()) {
        localStorage.removeItem(`secure_${key}`);
        localStorage.removeItem(`secure_${key}_iv`);
      } else if (Platform.isIOS() || Platform.isAndroid()) {
        // Use Capacitor Preferences for native platforms
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.remove({ key: `secure_${key}` });
      }
      return true;
    } catch (error) {
      console.error('Error removing secure data:', error);
      return false;
    }
  }

  // Web implementation using Web Crypto API
  private async encryptAndStoreWeb(key: string, value: any): Promise<void> {
    // Create encryption key from a passphrase
    const encoder = new TextEncoder();
    const passphrase = 'quantum-mealverse-secure-storage'; // In production, this should be more secure
    const keyData = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(passphrase)
    );

    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const jsonString = JSON.stringify(value);
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      cryptoKey,
      encoder.encode(jsonString)
    );

    // Store encrypted data and IV in localStorage
    localStorage.setItem(
      `secure_${key}`,
      this.arrayBufferToBase64(encryptedData)
    );
    localStorage.setItem(
      `secure_${key}_iv`,
      this.arrayBufferToBase64(iv)
    );
  }

  private async retrieveAndDecryptWeb<T>(key: string): Promise<T | null> {
    const encryptedData = localStorage.getItem(`secure_${key}`);
    const storedIv = localStorage.getItem(`secure_${key}_iv`);

    if (!encryptedData || !storedIv) {
      return null;
    }

    // Create decryption key from passphrase
    const encoder = new TextEncoder();
    const passphrase = 'quantum-mealverse-secure-storage'; // Should match the encryption passphrase
    const keyData = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(passphrase)
    );

    // Import the key for decryption
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // Decrypt the data
    try {
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: this.base64ToArrayBuffer(storedIv)
        },
        cryptoKey,
        this.base64ToArrayBuffer(encryptedData)
      );

      // Convert decrypted data to string and parse JSON
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decryptedData);
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  // iOS implementation using Keychain via Capacitor
  private async storeInKeychain(key: string, value: any): Promise<void> {
    try {
      // Use Capacitor's Preferences as we don't have direct Keychain access
      // In a real app, you would use a Keychain plugin or native code
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({
        key: `secure_${key}`,
        value: JSON.stringify(value)
      });
    } catch (error) {
      console.error('Error storing in Keychain:', error);
      throw error;
    }
  }

  private async retrieveFromKeychain<T>(key: string): Promise<T | null> {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const result = await Preferences.get({ key: `secure_${key}` });
      if (!result.value) return null;
      return JSON.parse(result.value) as T;
    } catch (error) {
      console.error('Error retrieving from Keychain:', error);
      throw error;
    }
  }

  // Android implementation using EncryptedSharedPreferences via Capacitor
  private async storeInEncryptedPrefs(key: string, value: any): Promise<void> {
    try {
      // Use Capacitor's Preferences as we don't have direct EncryptedSharedPreferences access
      // In a real app with native plugins, you would use EncryptedSharedPreferences
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({
        key: `secure_${key}`,
        value: JSON.stringify(value)
      });
    } catch (error) {
      console.error('Error storing in EncryptedSharedPreferences:', error);
      throw error;
    }
  }

  private async retrieveFromEncryptedPrefs<T>(key: string): Promise<T | null> {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const result = await Preferences.get({ key: `secure_${key}` });
      if (!result.value) return null;
      return JSON.parse(result.value) as T;
    } catch (error) {
      console.error('Error retrieving from EncryptedSharedPreferences:', error);
      throw error;
    }
  }

  // Utility methods for encoding/decoding
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

// Export singleton instance
export const secureStorage = new SecureStorage();
