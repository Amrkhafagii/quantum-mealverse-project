
import { supabase } from '@/integrations/supabase/client';

export const logApiCall = async (
  endpoint: string,
  requestData: any,
  responseData: any,
  userId?: string
) => {
  console.log('Logging API call:', {
    endpoint,
    userId: userId || 'anonymous',
    status: responseData?.status
  });
  
  try {
    const { error } = await supabase.from('customer_logs').insert({
      user_id: userId,
      type: 'api',
      endpoint,
      request_body: requestData,
      response_body: responseData,
      status_code: responseData?.status,
      page_url: typeof window !== 'undefined' ? window.location.href : null,
      timestamp: new Date().toISOString()
    });
    
    if (error) {
      console.error('Failed to log API call due to Supabase error:', error);
    }
  } catch (error) {
    console.error('Failed to log API call:', error);
  }
};

export const logDatabaseChange = async (
  queryText: string,
  affectedRows: number,
  beforeState: any,
  afterState: any,
  userId?: string
) => {
  console.log('Logging database change:', {
    queryText: queryText.substring(0, 100) + (queryText.length > 100 ? '...' : ''),
    affectedRows,
    userId: userId || 'anonymous'
  });
  
  try {
    const { error } = await supabase.from('customer_logs').insert({
      user_id: userId,
      type: 'database',
      query_text: queryText,
      affected_rows: affectedRows,
      before_state: beforeState,
      after_state: afterState,
      page_url: typeof window !== 'undefined' ? window.location.href : null,
      timestamp: new Date().toISOString()
    });
    
    if (error) {
      console.error('Failed to log database change due to Supabase error:', error);
    }
  } catch (error) {
    console.error('Failed to log database change:', error);
  }
};

// Add a test function to manually trigger a log entry
export const testLogger = async (userId?: string) => {
  console.log('Testing logger with user:', userId || 'anonymous');
  
  try {
    const { error } = await supabase.from('customer_logs').insert({
      user_id: userId,
      type: 'api',
      endpoint: '/test-logger',
      request_body: { test: true },
      response_body: { success: true },
      status_code: 200,
      page_url: typeof window !== 'undefined' ? window.location.href : null,
      timestamp: new Date().toISOString()
    });
    
    if (error) {
      console.error('Test log failed due to Supabase error:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Test log failed:', error);
    return { success: false, error };
  }
};
