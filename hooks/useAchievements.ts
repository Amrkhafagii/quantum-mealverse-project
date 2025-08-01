import { useState, useEffect } from 'react';
import { Achievement } from '@/lib/supabase';
import { 
  checkAllAchievements, 
  getUserAchievements, 
  getUserAchievementProgress,
  UserAchievement,
  AchievementProgress
} from '@/lib/achievements';

export function useAchievements(userId: string | null) {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadUserAchievements();
      loadAchievementProgress();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const loadUserAchievements = async () => {
    if (!userId) return;
    
    try {
      setError(null);
      const achievements = await getUserAchievements(userId);
      setUserAchievements(achievements);
    } catch (error) {
      console.error('Error loading user achievements:', error);
      setError('Failed to load achievements');
    }
  };

  const loadAchievementProgress = async () => {
    if (!userId) return;
    
    try {
      setError(null);
      const progress = await getUserAchievementProgress(userId);
      setAchievementProgress(progress);
    } catch (error) {
      console.error('Error loading achievement progress:', error);
      setError('Failed to load achievement progress');
    } finally {
      setLoading(false);
    }
  };

  const checkForNewAchievements = async () => {
    if (!userId) return [];
    
    try {
      const newlyUnlocked = await checkAllAchievements(userId);
      if (newlyUnlocked.length > 0) {
        setNewAchievements(newlyUnlocked);
        // Refresh user achievements and progress
        await loadUserAchievements();
        await loadAchievementProgress();
      }
      return newlyUnlocked;
    } catch (error) {
      console.error('Error checking for new achievements:', error);
      return [];
    }
  };

  const clearNewAchievements = () => {
    setNewAchievements([]);
  };

  const getTotalPoints = () => {
    return userAchievements.reduce((total, ua) => total + ua.achievement.points, 0);
  };

  const getUnlockedCount = () => {
    return userAchievements.length;
  };

  const getTotalAchievements = () => {
    return achievementProgress.length;
  };

  const getAchievementsByCategory = (category: string) => {
    if (category === 'all') {
      return achievementProgress;
    }
    return achievementProgress.filter(progress => {
      const achievement = userAchievements.find(ua => ua.achievement_id === progress.achievement_id)?.achievement;
      return achievement?.category === category;
    });
  };

  const getCompletionPercentage = () => {
    const total = getTotalAchievements();
    const unlocked = getUnlockedCount();
    return total > 0 ? Math.round((unlocked / total) * 100) : 0;
  };

  const getNextAchievement = () => {
    const inProgress = achievementProgress
      .filter(p => !p.unlocked && p.percentage > 0)
      .sort((a, b) => b.percentage - a.percentage);
    
    return inProgress[0] || null;
  };

  const getRecentAchievements = (limit: number = 5) => {
    return userAchievements
      .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
      .slice(0, limit);
  };

  return {
    userAchievements,
    achievementProgress,
    newAchievements,
    loading,
    error,
    checkForNewAchievements,
    clearNewAchievements,
    getTotalPoints,
    getUnlockedCount,
    getTotalAchievements,
    getAchievementsByCategory,
    getCompletionPercentage,
    getNextAchievement,
    getRecentAchievements,
    refreshAchievements: loadUserAchievements,
    refreshProgress: loadAchievementProgress,
  };
}