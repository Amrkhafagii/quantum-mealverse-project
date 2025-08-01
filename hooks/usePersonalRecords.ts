import { useState, useEffect } from 'react';
import { 
  PersonalRecordData, 
  checkForPersonalRecords, 
  getUserPersonalRecordsWithDetails,
  getPersonalRecordStats
} from '@/lib/personalRecords';

export function usePersonalRecords(userId: string | null) {
  const [personalRecords, setPersonalRecords] = useState<any[]>([]);
  const [newRecords, setNewRecords] = useState<PersonalRecordData[]>([]);
  const [recordStats, setRecordStats] = useState({
    totalRecords: 0,
    recentRecords: 0,
    recordsByType: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadPersonalRecords();
      loadRecordStats();
    }
  }, [userId]);

  const loadPersonalRecords = async () => {
    if (!userId) return;
    
    try {
      const records = await getUserPersonalRecordsWithDetails(userId);
      setPersonalRecords(records);
    } catch (error) {
      console.error('Error loading personal records:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecordStats = async () => {
    if (!userId) return;
    
    try {
      const stats = await getPersonalRecordStats(userId);
      setRecordStats(stats);
    } catch (error) {
      console.error('Error loading record stats:', error);
    }
  };

  const checkForNewRecords = async (sessionId: number) => {
    if (!userId) return [];
    
    try {
      const newlyAchieved = await checkForPersonalRecords(userId, sessionId);
      if (newlyAchieved.length > 0) {
        setNewRecords(newlyAchieved);
        // Refresh personal records and stats
        await loadPersonalRecords();
        await loadRecordStats();
      }
      return newlyAchieved;
    } catch (error) {
      console.error('Error checking for new records:', error);
      return [];
    }
  };

  const clearNewRecords = () => {
    setNewRecords([]);
  };

  const getRecordsByExercise = (exerciseId: number) => {
    return personalRecords.filter(record => record.exercise_id === exerciseId);
  };

  const getRecordsByType = (recordType: string) => {
    return personalRecords.filter(record => record.record_type === recordType);
  };

  const getBestRecord = (exerciseId: number, recordType: string) => {
    const exerciseRecords = personalRecords.filter(
      record => record.exercise_id === exerciseId && record.record_type === recordType
    );
    
    if (exerciseRecords.length === 0) return null;
    
    // For time records, lower is better; for others, higher is better
    if (recordType === 'best_time') {
      return exerciseRecords.reduce((best, current) => 
        current.value < best.value ? current : best
      );
    } else {
      return exerciseRecords.reduce((best, current) => 
        current.value > best.value ? current : best
      );
    }
  };

  return {
    personalRecords,
    newRecords,
    recordStats,
    loading,
    checkForNewRecords,
    clearNewRecords,
    refreshRecords: loadPersonalRecords,
    refreshStats: loadRecordStats,
    getRecordsByExercise,
    getRecordsByType,
    getBestRecord,
  };
}