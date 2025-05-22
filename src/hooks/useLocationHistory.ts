
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LocationHistoryEntry, LocationQueryParams } from '@/types/unifiedLocation';
import { 
  fetchLocationHistory, 
  exportLocationHistory, 
  deleteLocationHistory,
  getLocationStats
} from '@/services/locationHistoryService';
import { toast } from 'sonner';

export const useLocationHistory = () => {
  const { user } = useAuth();
  const [locationHistory, setLocationHistory] = useState<LocationHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{start?: string, end?: string}>({});
  const [stats, setStats] = useState<{
    totalLocations: number;
    firstLocation: string | null;
    lastLocation: string | null;
    uniqueDevices: number;
  }>({
    totalLocations: 0,
    firstLocation: null,
    lastLocation: null,
    uniqueDevices: 0,
  });

  // Load location history
  const loadHistory = async (params: Partial<LocationQueryParams> = {}) => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const history = await fetchLocationHistory(user.id, {
        ...params,
        startDate: params.startDate || dateRange.start,
        endDate: params.endDate || dateRange.end,
      });
      setLocationHistory(history);
    } catch (error) {
      console.error('Error loading location history:', error);
      toast.error('Failed to load location history');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load location stats
  const loadStats = async () => {
    if (!user?.id) return;
    
    try {
      const newStats = await getLocationStats(user.id);
      setStats(newStats);
    } catch (error) {
      console.error('Error loading location stats:', error);
    }
  };

  // Export location history
  const exportHistory = async (format: 'json' | 'csv' = 'json') => {
    if (!user?.id) {
      toast.error('You must be logged in to export your data');
      return;
    }
    
    try {
      setIsLoading(true);
      const blob = await exportLocationHistory(
        user.id, 
        format, 
        dateRange.start, 
        dateRange.end
      );
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `location-history-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      toast.success(`Location history exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting location history:', error);
      toast.error('Failed to export location history');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete location history
  const deleteHistory = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to delete your data');
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await deleteLocationHistory(
        user.id, 
        dateRange.start, 
        dateRange.end
      );
      
      if (result.success) {
        toast.success(`Successfully deleted ${result.count} location records`);
        // Refresh the history list and stats
        await loadHistory();
        await loadStats();
      } else {
        toast.error('Failed to delete location history');
      }
    } catch (error) {
      console.error('Error deleting location history:', error);
      toast.error('Failed to delete location history');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update date range
  const updateDateRange = (start?: string, end?: string) => {
    setDateRange({ start, end });
  };

  // Initial load
  useEffect(() => {
    if (user?.id) {
      loadHistory();
      loadStats();
    }
  }, [user?.id]);
  
  // Reload when date range changes
  useEffect(() => {
    if (user?.id) {
      loadHistory();
    }
  }, [dateRange.start, dateRange.end]);

  return {
    locationHistory,
    isLoading,
    stats,
    exportHistory,
    deleteHistory,
    updateDateRange,
    loadHistory,
    loadStats,
    dateRange
  };
};
