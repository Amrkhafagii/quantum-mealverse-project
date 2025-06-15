
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// userType must be loaded from user_types table using new column
export function useUserType() {
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserType = async () => {
      if (!user) {
        setUserType(null);
        setLoading(false);
        return;
      }

      try {
        const userMetadata = user?.user_metadata as { user_type?: string } | undefined;
        if (userMetadata?.user_type) {
          setUserType(userMetadata.user_type);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_types')
          .select('type')
          .eq('user_id', user.id)
          .single();

        setUserType(data?.type || null);
      } catch (error) {
        setUserType(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserType();
  }, [user]);

  return { userType, loading };
}
