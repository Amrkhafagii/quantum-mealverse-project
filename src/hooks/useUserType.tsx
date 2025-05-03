
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { UserType } from '@/types/auth';
import { userTypeService } from '@/services/supabaseClient';

/**
 * Hook to get and manage user type
 * Gets user type first from metadata, then from user_types table as fallback
 */
export function useUserType() {
  const { user } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserType = async () => {
      if (!user) {
        setUserType(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // First check user metadata
        const metadataType = user.user_metadata?.user_type;
        if (metadataType) {
          setUserType(metadataType as string);
          setLoading(false);
          return;
        }

        // If not in metadata, check user_types table
        const type = await userTypeService.getUserType(user.id);
        
        if (type) {
          setUserType(type);
        } else {
          // Default to customer if no type found
          setUserType('customer');
          
          // Create a record in user_types table
          await userTypeService.updateUserType(user.id, 'customer');
        }
      } catch (error) {
        console.error('Error getting user type:', error);
        // Default to customer on error
        setUserType('customer');
      } finally {
        setLoading(false);
      }
    };

    getUserType();
  }, [user]);

  /**
   * Updates the user's type both in the database and metadata
   */
  const updateUserType = async (newType: 'customer' | 'restaurant' | 'delivery'): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      
      // Update in user_types table
      const success = await userTypeService.updateUserType(user.id, newType);
      if (!success) throw new Error("Failed to update user type in database");
      
      // Update in user metadata
      const { error: metaError } = await supabase.auth.updateUser({
        data: { user_type: newType }
      });
      
      if (metaError) throw metaError;
      
      // Update local state
      setUserType(newType);
      return true;
    } catch (error) {
      console.error('Error updating user type:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { userType, loading, updateUserType };
}
