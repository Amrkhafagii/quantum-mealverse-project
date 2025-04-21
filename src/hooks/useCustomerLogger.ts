
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useCustomerLogger = () => {
  const { user } = useAuth();
  const sessionId = crypto.randomUUID(); // Generate unique session ID

  const logClick = useCallback(async (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;

    const element = event.target;
    try {
      await supabase.from('customer_logs').insert({
        user_id: user?.id,
        session_id: sessionId,
        type: 'click',
        element_id: element.id,
        element_class: element.className,
        element_type: element.tagName,
        page_url: window.location.href,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log click:', error);
    }
  }, [user, sessionId]);

  const logError = useCallback(async (error: Error) => {
    try {
      await supabase.from('customer_logs').insert({
        user_id: user?.id,
        session_id: sessionId,
        type: 'error',
        error_message: error.message,
        error_stack: error.stack,
        page_url: window.location.href,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  }, [user, sessionId]);

  useEffect(() => {
    // Set up global error handler
    const errorHandler = (event: ErrorEvent) => {
      logError(event.error);
    };

    // Set up click handler
    document.addEventListener('click', logClick);
    window.addEventListener('error', errorHandler);

    return () => {
      document.removeEventListener('click', logClick);
      window.removeEventListener('error', errorHandler);
    };
  }, [logClick, logError]);

  return { logError };
};
