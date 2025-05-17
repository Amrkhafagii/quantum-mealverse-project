
import React, { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Platform } from '@/utils/platform';
import { useBadge } from '@/hooks/useBadge';
import { BadgeService } from '@/services/badge/badgeService';
import { BadgeCountSync } from './BadgeCountSync';

interface NotificationsManagerProps {
  children: React.ReactNode;
}

export const NotificationsManager: React.FC<NotificationsManagerProps> = ({ children }) => {
  const { unreadCount, isLoading } = useNotifications();
  const { isSupported, requestPermission } = useBadge();
  
  // Request badge permission when component mounts
  useEffect(() => {
    const requestBadgePermission = async () => {
      if (Platform.isNative() && isSupported) {
        await BadgeService.requestPermission();
      }
    };
    
    requestBadgePermission();
  }, [isSupported]);
  
  return (
    <>
      {/* The BadgeCountSync component ensures app icon badges stay in sync */}
      <BadgeCountSync />
      
      {/* Render children */}
      {children}
    </>
  );
};
