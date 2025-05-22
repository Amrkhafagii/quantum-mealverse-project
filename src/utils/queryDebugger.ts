
import { supabase } from '@/integrations/supabase/client';

/**
 * Debug tool to log SQL query parameters and results
 */
export const debugSQLQuery = async (
  functionName: string,
  params: Record<string, any>
) => {
  console.log(`🔍 Debugging SQL function: ${functionName}`, {
    params
  });
  
  try {
    // Log to a debug table to see the exact parameters being sent
    await supabase
      .from('unit_test_customer')
      .insert({
        test_name: `Debug ${functionName}`,
        function_name: functionName,
        input: params,
        expected_output: null,
        passed: true,
        execution_time: 0
      });
    
    // Make the actual function call
    const { data, error } = await supabase
      .rpc(functionName as any, params);
      
    if (error) {
      console.error(`Error executing ${functionName}:`, error);
      
      await supabase
        .from('unit_test_customer')
        .insert({
          test_name: `Error ${functionName}`,
          function_name: functionName,
          input: params,
          expected_output: null,
          actual_output: { error: error.message },
          passed: false,
          execution_time: 0,
          error_message: error.message
        });
        
      return { success: false, error, data: null };
    }
    
    console.log(`✅ ${functionName} result:`, data);
    
    // Log the successful result
    await supabase
      .from('unit_test_customer')
      .insert({
        test_name: `Success ${functionName}`,
        function_name: functionName,
        input: params,
        expected_output: null,
        actual_output: data,
        passed: true,
        execution_time: 0
      });
      
    return { success: true, data, error: null };
  } catch (err) {
    console.error(`Exception in ${functionName} debug:`, err);
    return { success: false, error: err, data: null };
  }
};

/**
 * Debug the find_nearest_restaurant function specifically
 */
export const debugRestaurantSearch = async (
  latitude: number,
  longitude: number,
  maxDistance: number = 50
) => {
  return await debugSQLQuery('find_nearest_restaurant', {
    order_lat: latitude,
    order_lng: longitude,
    max_distance_km: maxDistance
  });
};

/**
 * Verify if the database is accessible and the user is authenticated
 */
export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('restaurants').select('count').limit(1);
    if (error) {
      console.error('Database connection check failed:', error);
      return { connected: false, error };
    }
    return { connected: true, data };
  } catch (err) {
    console.error('Database connection exception:', err);
    return { connected: false, error: err };
  }
};
