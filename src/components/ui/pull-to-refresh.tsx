
import React, { useState } from 'react';
import { useResponsive } from '@/responsive/core/ResponsiveContext';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  isRefreshing?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  isRefreshing = false
}) => {
  const { isMobile } = useResponsive();
  const [isPulling, setIsPulling] = useState(false);

  if (!isMobile) {
    return <>{children}</>;
  }

  const handleTouchStart = () => {
    // Basic pull-to-refresh implementation
    if (window.scrollY === 0) {
      setIsPulling(true);
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling && !isRefreshing) {
      await onRefresh();
    }
    setIsPulling(false);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen"
    >
      {isPulling && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      )}
      {children}
    </div>
  );
};
