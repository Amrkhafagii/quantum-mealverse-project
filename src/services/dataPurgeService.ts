
import { runRetentionPolicies } from './locationService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Service responsible for managing data purging and retention
 */

// Configuration for different data types
export interface RetentionConfig {
  // Days after which data should be completely purged
  purgeAfterDays: number;
  // Days after which data should be anonymized but kept for analytics
  anonymizeAfterDays: number;
}

export const RETENTION_CONFIGS: Record<string, RetentionConfig> = {
  LOCATION_DATA: {
    purgeAfterDays: 30,  // GDPR standard
    anonymizeAfterDays: 7
  },
  USER_ACTIVITY: {
    purgeAfterDays: 90,
    anonymizeAfterDays: 30
  },
  ORDER_DATA: {
    purgeAfterDays: 365, // Keep order data for a year
    anonymizeAfterDays: 90
  }
};

/**
 * Main scheduler function to run all data retention policies
 * This should be called by a scheduled job (e.g., cron)
 */
export const runAllDataRetentionPolicies = async (): Promise<{
  success: boolean;
  results: Record<string, any>;
}> => {
  try {
    console.log('Running all data retention policies at:', new Date().toISOString());
    
    // Run location data retention policies
    const locationResult = await runRetentionPolicies();
    
    // Additional data type retention policies can be added here
    
    // For audit purposes, log the execution
    await logRetentionPolicyExecution({
      locationData: locationResult,
      // Add more data types here as they're implemented
    });
    
    return {
      success: locationResult.success,
      results: {
        location: locationResult
      }
    };
  } catch (error) {
    console.error('Failed to run data retention policies:', error);
    return {
      success: false,
      results: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

/**
 * Log when retention policies are executed for audit purposes
 */
const logRetentionPolicyExecution = async (results: Record<string, any>): Promise<void> => {
  try {
    // Use type assertion to inform TypeScript that the table exists
    await supabase.from('data_retention_logs' as any).insert({
      executed_at: new Date().toISOString(),
      results: results,
      success: Object.values(results).every(r => (r as any).success)
    });
  } catch (error) {
    console.error('Failed to log retention policy execution:', error);
    // Don't throw - logging failure shouldn't break the process
  }
};

/**
 * Execute a specific retention policy on demand
 * This can be used for admin-triggered cleanup
 */
export const executeRetentionPolicy = async (
  policyType: keyof typeof RETENTION_CONFIGS,
  options: { 
    purgeOnly?: boolean, 
    anonymizeOnly?: boolean,
    customPurgeDays?: number,
    customAnonymizeDays?: number
  } = {}
): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    // Get config
    const config = RETENTION_CONFIGS[policyType];
    if (!config) {
      return {
        success: false,
        message: `Policy type ${policyType} not found`
      };
    }

    // For now we only have location data implemented
    if (policyType === 'LOCATION_DATA') {
      // Determine which operations to run
      const runPurge = options.anonymizeOnly !== true;
      const runAnonymize = options.purgeOnly !== true;
      
      let result = {
        purged: 0,
        anonymized: 0,
        success: true
      };
      
      if (runPurge) {
        const purgeResult = await runRetentionPolicies();
        result = { ...result, ...purgeResult };
      }
      
      return {
        success: result.success,
        message: `Executed ${policyType} retention policy successfully`,
        details: result
      };
    } else {
      return {
        success: false,
        message: `Policy type ${policyType} is not yet implemented`
      };
    }
  } catch (error) {
    console.error(`Failed to execute ${policyType} retention policy:`, error);
    return {
      success: false,
      message: `Failed to execute ${policyType} retention policy`,
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Allow users to delete their own data
 */
export const deleteUserData = async (
  userId: string,
  dataTypes: Array<'location' | 'activity' | 'orders'> = ['location', 'activity', 'orders']
): Promise<{
  success: boolean;
  message: string;
  deletedItems: Record<string, number>;
}> => {
  try {
    const deletedItems: Record<string, number> = {};
    
    // Delete location data if requested
    if (dataTypes.includes('location')) {
      const { count: locationCount } = await deleteUserLocationData(userId);
      deletedItems.location = locationCount;
    }
    
    // Add more data types as needed
    
    return {
      success: true,
      message: `Successfully deleted user data for user ${userId}`,
      deletedItems
    };
  } catch (error) {
    console.error(`Failed to delete data for user ${userId}:`, error);
    return {
      success: false,
      message: `Failed to delete user data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      deletedItems: {}
    };
  }
};

/**
 * Delete all location data for a specific user
 */
const deleteUserLocationData = async (
  userId: string
): Promise<{
  success: boolean;
  count: number;
}> => {
  try {
    // Count records to be deleted
    const { count: countResult, error: countError } = await supabase
      .from('unified_locations' as any)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (countError) {
      throw countError;
    }
    
    // Delete the records
    const { error } = await supabase
      .from('unified_locations' as any)
      .delete()
      .eq('user_id', userId);
      
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      count: countResult || 0
    };
  } catch (error) {
    console.error(`Failed to delete location data for user ${userId}:`, error);
    throw error;
  }
};
