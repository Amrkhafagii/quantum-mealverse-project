
import { supabase } from '@/integrations/supabase/client';

export const logApiCall = async (
  endpoint: string,
  requestData: any,
  responseData: any,
  userId?: string
) => {
  try {
    await supabase.from('customer_logs').insert({
      user_id: userId,
      type: 'api',
      endpoint,
      request_body: requestData,
      response_body: responseData,
      status_code: responseData?.status,
      timestamp: new Date().toISOString()
    });
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
  try {
    await supabase.from('customer_logs').insert({
      user_id: userId,
      type: 'database',
      query_text: queryText,
      affected_rows: affectedRows,
      before_state: beforeState,
      after_state: afterState,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log database change:', error);
  }
};
