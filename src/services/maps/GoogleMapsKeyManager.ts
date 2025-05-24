
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
// Default public key with limited quota, shouldn't be used in production
const DEFAULT_KEY = '';

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
      try {
        // Try to get key from database
        const dbKey = await getConfigValue(CONFIG_KEY);
        
        if (dbKey) {
          const keyInfo = {
            key: dbKey,
            source: 'database' as KeySource,
            lastUpdated: new Date(),
            isValid: true
          };
          this.setCurrentKey(keyInfo);
          resolve(keyInfo);
          return;
        }
        
        // Try localStorage
        const localKey = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localKey) {
          const keyInfo = {
            key: localKey,
            source: 'localStorage' as KeySource,
            lastUpdated: new Date(),
            isValid: true
          };
          this.setCurrentKey(keyInfo);
          resolve(keyInfo);
          return;
        }
        
        // Try environment variable
        const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (envKey) {
          const keyInfo = {
            key: envKey,
            source: 'environment' as KeySource,
            lastUpdated: new Date(),
            isValid: true
          };
          this.setCurrentKey(keyInfo);
          resolve(keyInfo);
          return;
        }
        
        // Use default key if available
        if (DEFAULT_KEY) {
          const keyInfo = {
            key: DEFAULT_KEY,
            source: 'default' as KeySource,
            lastUpdated: new Date(),
            isValid: true
          };
          this.setCurrentKey(keyInfo);
          resolve(keyInfo);
          return;
        }
        
        // No key available
        const noKeyInfo = {
          key: '',
          source: 'none' as KeySource,
          lastUpdated: new Date(),
          isValid: false
        };
        this.setCurrentKey(noKeyInfo);
        resolve(noKeyInfo);
      } catch (error) {
        console.error('Error loading Google Maps API key:', error);
        // Fall back to localStorage or environment
        const localKey = localStorage.getItem(LOCAL_STORAGE_KEY);
        const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        const fallbackKey = localKey || envKey || DEFAULT_KEY;
        const source: KeySource = localKey 
          ? 'localStorage' 
          : envKey 
            ? 'environment' 
            : DEFAULT_KEY 
              ? 'default' 
              : 'none';
        
        const keyInfo = {
          key: fallbackKey,
          source,
          lastUpdated: new Date(),
          isValid: !!fallbackKey
        };
        
        this.setCurrentKey(keyInfo);
        resolve(keyInfo);
      } finally {
        // Reset promise after completion
        setTimeout(() => {
          this.keyLoadPromise = null;
        }, 0);
      }
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
    try {
      // Save to database first
      await updateConfigValue(CONFIG_KEY, newKey);
      
      // Save to localStorage as fallback
      localStorage.setItem(LOCAL_STORAGE_KEY, newKey);
      
      // Update current key
      const keyInfo = {
        key: newKey,
        source: 'database' as KeySource,
        lastUpdated: new Date(),
        isValid: true
      };
      
      this.setCurrentKey(keyInfo);
      return true;
    } catch (error) {
      console.error('Error saving Google Maps API key:', error);
      
      // Fall back to localStorage only
      localStorage.setItem(LOCAL_STORAGE_KEY, newKey);
      
      const keyInfo = {
        key: newKey,
        source: 'localStorage' as KeySource,
        lastUpdated: new Date(),
        isValid: true
      };
      
      this.setCurrentKey(keyInfo);
      return true;
    }
  }
  
  /**
   * Clear the current API key
   */
  public async clearApiKey(): Promise<void> {
    try {
      await updateConfigValue(CONFIG_KEY, '');
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      const keyInfo = {
        key: '',
        source: 'none' as KeySource,
        lastUpdated: new Date(),
        isValid: false
      };
      
      this.setCurrentKey(keyInfo);
    } catch (error) {
      console.error('Error clearing Google Maps API key:', error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      const keyInfo = {
        key: '',
        source: 'none' as KeySource,
        lastUpdated: new Date(),
        isValid: false
      };
      
      this.setCurrentKey(keyInfo);
    }
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
    const keyInfo = await this.getApiKeyInfo();
    return keyInfo.isValid && !!keyInfo.key;
  }
  
  /**
   * Validate API key against Google Maps API
   * Note: This performs a real API call to verify the key works
   */
  public async validateApiKey(key: string = ''): Promise<boolean> {
    const keyToCheck = key || (await this.getApiKey());
    
    if (!keyToCheck) {
      return false;
    }
    
    try {
      // Use a simple geocoding request to test the key
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=test&key=${keyToCheck}`,
        { method: 'GET' }
      );
      
      const data = await response.json();
      
      // Check if the response indicates a valid key
      if (data.status === 'REQUEST_DENIED' && data.error_message?.includes('API key')) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating Google Maps API key:', error);
      return false;
    }
  }
}

// Export singleton instance
export const googleMapsKeyManager = GoogleMapsKeyManager.getInstance();
export default googleMapsKeyManager;
