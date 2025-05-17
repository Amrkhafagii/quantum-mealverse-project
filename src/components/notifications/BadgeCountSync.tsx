
import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useBadge } from '@/hooks/useBadge';
import { Platform } from '@/utils/platform';

/**
 * Component to sync notification badge counts with app icon badges
 * This should be mounted at the application root level
 */
export const BadgeCountSync: React.FC = () => {
  const { unreadCount } = useNotifications();
  const { updateBadgeCount, isSupported } = useBadge();

  // Update badge when unread count changes
  useEffect(() => {
    if (isSupported && Platform.isNative()) {
      updateBadgeCount(unreadCount).catch(err => {
        console.error('Failed to update badge count:', err);
      });
    }
  }, [unreadCount, isSupported, updateBadgeCount]);

  return null; // This is a non-visual component
};
