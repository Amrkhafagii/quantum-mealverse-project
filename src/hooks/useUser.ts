import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// This hook is now a legacy wrapper around supabase.auth.getUser and onAuthStateChange
// We should eventually refactor code to use useAuth() instead
export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from session
    const getCurrentUser = async () => {
      try {
        setLoading(true);
        // The Supabase user column is still id, but our type links must be updated everywhere else
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }
        if (user) {
          setUser(user);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
