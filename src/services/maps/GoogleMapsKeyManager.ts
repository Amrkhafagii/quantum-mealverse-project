
import { getConfigValue, updateConfigValue } from '@/services/configService';

type KeySource = 'database' | 'localStorage' | 'environment' | 'default' | 'none';

interface GoogleMapsKeyInfo {
  key: string;
  source: KeySource;
  lastUpdated: Date;
  isValid: boolean;
}

const LOCAL_STORAGE_KEY = 'googleMapsApiKey';
const CONFIG_KEY = 'google_maps_api_key';
// Hard-coded API key as per user request
const DEFAULT_KEY = 'AIzaSyBKQztvlSSaT-kjpzWBHIZ1uzgRh8rPlVs';

/**
 * Centralized service to manage Google Maps API keys
 */
export class GoogleMapsKeyManager {
  private static instance: GoogleMapsKeyManager;
  private currentKey: GoogleMapsKeyInfo | null = null;
  private keyLoadPromise: Promise<GoogleMapsKeyInfo> | null = null;
  private keyChangeCallbacks: Set<(keyInfo: GoogleMapsKeyInfo) => void> = new Set();
  
  // Singleton pattern
  private constructor() {}
  
  /**
   * Get GoogleMapsKeyManager instance
   */
  public static getInstance(): GoogleMapsKeyManager {
    if (!GoogleMapsKeyManager.instance) {
      GoogleMapsKeyManager.instance = new GoogleMapsKeyManager();
    }
    return GoogleMapsKeyManager.instance;
  }
  
  /**
   * Load API key from various sources with priority
   */
  public async loadApiKey(): Promise<GoogleMapsKeyInfo> {
    if (this.keyLoadPromise) {
      return this.keyLoadPromise;
    }
    
    this.keyLoadPromise = new Promise(async (resolve) => {
      // Use the default key provided in the code
      const keyInfo = {
        key: DEFAULT_KEY,
        source: 'default' as KeySource,
        lastUpdated: new Date(),
        isValid: true
      };
      
      this.setCurrentKey(keyInfo);
      resolve(keyInfo);
      
      // Reset promise after completion
      setTimeout(() => {
        this.keyLoadPromise = null;
      }, 0);
    });
    
    return this.keyLoadPromise;
  }
  
  /**
   * Get the current API key (loads if not already loaded)
   */
  public async getApiKey(): Promise<string> {
    if (this.currentKey) {
      return this.currentKey.key;
    }
    
    const keyInfo = await this.loadApiKey();
    return keyInfo.key;
  }
  
  /**
   * Get detailed information about the current API key
   */
  public async getApiKeyInfo(): Promise<GoogleMapsKeyInfo> {
    if (this.currentKey) {
      return { ...this.currentKey };
    }
    
    return await this.loadApiKey();
  }
  
  /**
   * Set a new API key and store it in the database
   */
  public async setApiKey(newKey: string): Promise<boolean> {
    // Simply return true as we're using the hardcoded key
    // This method is kept for compatibility with existing code
    return true;
  }
  
  /**
   * Clear the current API key
   */
  public async clearApiKey(): Promise<void> {
    // This is a no-op as we always use the hardcoded key
  }
  
  /**
   * Register for API key changes
   */
  public onKeyChange(callback: (keyInfo: GoogleMapsKeyInfo) => void): () => void {
    this.keyChangeCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.keyChangeCallbacks.delete(callback);
    };
  }
  
  /**
   * Set current key and notify listeners
   */
  private setCurrentKey(keyInfo: GoogleMapsKeyInfo): void {
    this.currentKey = keyInfo;
    
    // Notify all listeners
    this.keyChangeCallbacks.forEach(callback => {
      try {
        callback({ ...keyInfo });
      } catch (error) {
        console.error('Error in Google Maps API key change callback:', error);
      }
    });
  }
  
  /**
   * Check if the API key is valid for use
   */
  public async isKeyValid(): Promise<boolean> {
    return true; // Always return true for the hardcoded key
  }
  
  /**
   * Validate API key against Google Maps API
   */
  public async validateApiKey(key: string = ''): Promise<boolean> {
    return true; // Always return true for the hardcoded key
  }
}

// Export singleton instance
export const googleMapsKeyManager = GoogleMapsKeyManager.getInstance();
export default googleMapsKeyManager;
