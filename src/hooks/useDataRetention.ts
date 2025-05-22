
import { useState } from 'react';
import { executeRetentionPolicy, deleteUserData, RETENTION_CONFIGS } from '@/services/dataPurgeService';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

/**
 * Hook to manage data retention settings and operations
 */
export function useDataRetention() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  // Function to delete all user data
  const deleteAllUserData = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to delete your data');
      return { success: false };
    }

    try {
      setIsProcessing(true);
      const result = await deleteUserData(user.id);
      
      if (result.success) {
        toast.success('Your data has been deleted successfully');
      } else {
        toast.error(result.message);
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting user data:', error);
      toast.error('Failed to delete your data');
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Function to run a specific retention policy (admin only)
  const runRetentionPolicy = async (policyType: keyof typeof RETENTION_CONFIGS) => {
    try {
      setIsProcessing(true);
      const result = await executeRetentionPolicy(policyType);
      
      if (result.success) {
        toast.success(`Retention policy for ${policyType} executed successfully`);
      } else {
        toast.error(result.message);
      }
      
      return result;
    } catch (error) {
      console.error(`Error executing retention policy (${policyType}):`, error);
      toast.error('Failed to execute retention policy');
      return { success: false, message: 'An error occurred' };
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Fetch retention configurations for UI display
  const getRetentionConfigs = () => {
    return RETENTION_CONFIGS;
  };
  
  return {
    deleteAllUserData,
    runRetentionPolicy,
    getRetentionConfigs,
    isProcessing
  };
}
