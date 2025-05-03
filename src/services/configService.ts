
import { supabase } from "@/integrations/supabase/client";

// Cache for config values to avoid repeated calls
const configCache: Record<string, { value: string; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export interface ConfigResponse {
  key: string;
  value: string;
  is_secret: boolean;
}

/**
 * Gets a configuration value from the database via edge function
 * Uses caching to reduce calls and improve performance
 */
export const getConfigValue = async (key: string): Promise<string | null> => {
  try {
    // Check cache first
    const cached = configCache[key];
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return cached.value;
    }
    
    // Not in cache or expired, fetch from edge function
    const { data, error } = await supabase.functions.invoke<ConfigResponse>(
      'get-config',
      {
        body: { key },
      }
    );
    
    if (error) {
      console.error('Error fetching config:', error);
      return null;
    }
    
    if (!data?.value) {
      console.warn(`Config key "${key}" not found`);
      return null;
    }
    
    // Store in cache
    configCache[key] = { value: data.value, timestamp: now };
    
    return data.value;
  } catch (error) {
    console.error('Unexpected error fetching config:', error);
    return null;
  }
}

/**
 * Clears cached config values to ensure fresh data on next request
 */
export const clearConfigCache = (key?: string) => {
  if (key) {
    delete configCache[key];
  } else {
    Object.keys(configCache).forEach(k => delete configCache[k]);
  }
}
