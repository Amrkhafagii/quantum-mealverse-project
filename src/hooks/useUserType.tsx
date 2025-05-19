
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { userTypeService } from '@/services/supabaseClient';

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
        // First check user metadata (from auth.users)
        const userMetadata = user?.user_metadata as { user_type?: string } | undefined;
        if (userMetadata?.user_type) {
          setUserType(userMetadata.user_type);
          setLoading(false);
          return;
        }

        // If not in metadata, check our user_types table
        const type = await userTypeService.getUserType(user.id);
        setUserType(type);
      } catch (error) {
        console.error('Error fetching user type:', error);
        setUserType(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserType();
  }, [user]);

  return { userType, loading };
}
