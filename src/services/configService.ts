
import { supabase } from '@/lib/supabase';

// Configuration key-value schema
export interface ConfigItem {
  key: string;
  value: string;
  last_updated: string; // ISO date string
  description?: string;
}

/**
 * Get config value by key
 */
export async function getConfigValue(key: string): Promise<string | null> {
  try {
    // Try to get from Supabase if available
    if (supabase) {
      const { data, error } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', key)
        .single();
        
      if (error) {
        console.error('Error fetching config from database:', error);
        // Fall back to localStorage if database access fails
        return localStorage.getItem(key);
      }
      
      if (data) {
        return data.value;
      }
    }
    
    // Fall back to localStorage
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting config value for key ${key}:`, error);
    // Fall back to localStorage if there's an error
    return localStorage.getItem(key);
  }
}

/**
 * Update config value
 */
export async function updateConfigValue(key: string, value: string): Promise<boolean> {
  try {
    // Try to update in Supabase if available
    if (supabase) {
      const { error } = await supabase
        .from('app_config')
        .upsert(
          { 
            key, 
            value,
            last_updated: new Date().toISOString()
          },
          { onConflict: 'key' }
        );
        
      if (error) {
        console.error('Error updating config in database:', error);
        // Fall back to localStorage if database update fails
        localStorage.setItem(key, value);
        return true;
      }
      
      return true;
    }
    
    // Fall back to localStorage
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error updating config value for key ${key}:`, error);
    // Fall back to localStorage if there's an error
    localStorage.setItem(key, value);
    return true;
  }
}

/**
 * Delete config value
 */
export async function deleteConfigValue(key: string): Promise<boolean> {
  try {
    // Try to delete from Supabase if available
    if (supabase) {
      const { error } = await supabase
        .from('app_config')
        .delete()
        .eq('key', key);
        
      if (error) {
        console.error('Error deleting config from database:', error);
        // Fall back to localStorage if database delete fails
        localStorage.removeItem(key);
        return true;
      }
      
      return true;
    }
    
    // Fall back to localStorage
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error deleting config value for key ${key}:`, error);
    // Fall back to localStorage if there's an error
    localStorage.removeItem(key);
    return true;
  }
}

/**
 * Get all config values
 */
export async function getAllConfigValues(): Promise<Record<string, string>> {
  try {
    const configValues: Record<string, string> = {};
    
    // Try to get from Supabase if available
    if (supabase) {
      const { data, error } = await supabase
        .from('app_config')
        .select('key, value');
        
      if (error) {
        console.error('Error fetching config from database:', error);
      } else if (data) {
        // Convert array to object
        data.forEach((item) => {
          configValues[item.key] = item.value;
        });
      }
    }
    
    return configValues;
  } catch (error) {
    console.error('Error getting all config values:', error);
    return {};
  }
}
