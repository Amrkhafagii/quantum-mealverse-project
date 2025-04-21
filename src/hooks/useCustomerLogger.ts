
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useCustomerLogger = () => {
  const { user } = useAuth();
  const sessionId = useRef(crypto.randomUUID()).current; // Generate unique session ID once
  const isLoggingEnabled = true; // Set to false to disable logging

  const logClick = useCallback(async (event: MouseEvent) => {
    if (!isLoggingEnabled || !(event.target instanceof Element)) return;

    const element = event.target;
    console.log('Logging click event:', {
      element_id: element.id,
      element_class: element.className,
      element_type: element.tagName,
    });

    try {
      const { error } = await supabase.from('customer_logs').insert({
        user_id: user?.id,
        session_id: sessionId,
        type: 'click',
        element_id: element.id || null,
        element_class: element.className || null,
        element_type: element.tagName || null,
        page_url: window.location.href,
        timestamp: new Date().toISOString()
      });
      
      if (error) {
        console.error('Failed to log click due to Supabase error:', error);
      }
    } catch (error) {
      console.error('Failed to log click:', error);
    }
  }, [user, sessionId]);

  const logError = useCallback(async (error: Error) => {
    if (!isLoggingEnabled) return;
    
    console.log('Logging error event:', {
      error_message: error.message,
      error_stack: error.stack,
    });

    try {
      const { error: supabaseError } = await supabase.from('customer_logs').insert({
        user_id: user?.id,
        session_id: sessionId,
        type: 'error',
        error_message: error.message,
        error_stack: error.stack,
        page_url: window.location.href,
        timestamp: new Date().toISOString()
      });
      
      if (supabaseError) {
        console.error('Failed to log error due to Supabase error:', supabaseError);
      }
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  }, [user, sessionId]);

  // Log page navigation
  useEffect(() => {
    if (!isLoggingEnabled) return;
    
    // Log initial page load
    const logPageView = async () => {
      console.log('Logging page view:', window.location.href);
      try {
        const { error } = await supabase.from('customer_logs').insert({
          user_id: user?.id,
          session_id: sessionId,
          type: 'click',
          element_id: 'page_load',
          element_type: 'navigation',
          page_url: window.location.href,
          timestamp: new Date().toISOString()
        });
        
        if (error) {
          console.error('Failed to log page view due to Supabase error:', error);
        }
      } catch (error) {
        console.error('Failed to log page view:', error);
      }
    };
    
    logPageView();
  }, [user, sessionId, window.location.href]);

  useEffect(() => {
    if (!isLoggingEnabled) return;
    
    // Set up global error handler
    const errorHandler = (event: ErrorEvent) => {
      logError(event.error || new Error(event.message));
    };

    // Set up click handler
    document.addEventListener('click', logClick);
    window.addEventListener('error', errorHandler);

    console.log('Customer logger initialized with session:', sessionId);

    return () => {
      document.removeEventListener('click', logClick);
      window.removeEventListener('error', errorHandler);
    };
  }, [logClick, logError]);

  // Manual log method that can be used outside the hook
  const logEvent = useCallback(async (eventType: string, eventData: any) => {
    if (!isLoggingEnabled) return;
    
    console.log(`Logging custom event (${eventType}):`, eventData);
    try {
      const { error } = await supabase.from('customer_logs').insert({
        user_id: user?.id,
        session_id: sessionId,
        type: 'click', // Using 'click' type for custom events
        element_id: eventType,
        metadata: eventData,
        page_url: window.location.href,
        timestamp: new Date().toISOString()
      });
      
      if (error) {
        console.error('Failed to log custom event due to Supabase error:', error);
      }
    } catch (error) {
      console.error('Failed to log custom event:', error);
    }
  }, [user, sessionId]);

  return { logError, logEvent };
};
