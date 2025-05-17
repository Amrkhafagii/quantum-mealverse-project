
import * as React from 'react';
import { ArrowDownIcon, CheckCircleIcon, LoaderCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Platform } from '@/utils/platform';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

interface PullToRefreshProps {
  onRefresh: () => Promise<any>;
  children: React.ReactNode;
  className?: string;
  pullDownThreshold?: number;
  maxPullDownDistance?: number;
  contentsProps?: React.HTMLAttributes<HTMLDivElement>;
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const PullToRefresh = ({
  onRefresh,
  children,
  className,
  pullDownThreshold = 80,
  maxPullDownDistance = 120,
  contentsProps,
  containerProps,
}: PullToRefreshProps) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [startY, setStartY] = React.useState(0);
  const [status, setStatus] = React.useState<'pull' | 'release' | 'refreshing' | 'done'>('pull');
  const { isOnline } = useConnectionStatus();
  
  // Don't use pull to refresh on desktop browsers
  const isMobile = Platform.isMobileBrowser() || Platform.isNative();
  
  const handleStart = (clientY: number) => {
    if (refreshing) return;
    setStartY(clientY);
  };

  const handleMove = (clientY: number) => {
    if (refreshing || !isMobile) return;
    const container = document.scrollingElement || document.documentElement;
    
    // Only activate when at the top of the page
    if (container.scrollTop > 0) return;
    
    const distance = Math.max(0, Math.min(clientY - startY, maxPullDownDistance));
    setPullDistance(distance);
    setStatus(distance > pullDownThreshold ? 'release' : 'pull');
  };

  const handleEnd = async () => {
    if (refreshing || !isMobile) return;
    
    if (pullDistance > pullDownThreshold && isOnline) {
      setStatus('refreshing');
      setRefreshing(true);
      try {
        await onRefresh();
        setStatus('done');
        setTimeout(() => {
          setPullDistance(0);
          setRefreshing(false);
          setStatus('pull');
        }, 1000);
      } catch (error) {
        console.error('Refresh failed:', error);
        setPullDistance(0);
        setRefreshing(false);
        setStatus('pull');
      }
    } else {
      setPullDistance(0);
    }
  };

  React.useEffect(() => {
    if (!isMobile) return;
    
    const handleTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientY);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientY);
    const handleTouchEnd = () => handleEnd();
    
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [refreshing, startY, pullDistance, pullDownThreshold, isOnline, isMobile]);

  const getIcon = () => {
    switch (status) {
      case 'pull':
        return <ArrowDownIcon className="animate-bounce h-5 w-5" />;
      case 'release':
        return <ArrowDownIcon className="h-5 w-5 transform rotate-180" />;
      case 'refreshing':
        return <LoaderCircleIcon className="animate-spin h-5 w-5" />;
      case 'done':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getMessage = () => {
    switch (status) {
      case 'pull':
        return 'Pull down to refresh';
      case 'release':
        return 'Release to refresh';
      case 'refreshing':
        return 'Refreshing...';
      case 'done':
        return 'Updated!';
      default:
        return '';
    }
  };

  return (
    <div
      {...containerProps}
      className={cn('overflow-hidden', containerProps?.className)}
    >
      {isMobile && (
        <div
          className={cn(
            'flex flex-col items-center justify-center transition-transform duration-300',
            pullDistance > 0 && !refreshing ? 'transition-none' : '',
          )}
          style={{
            transform: `translateY(${pullDistance}px)`,
            minHeight: '30px',
            marginTop: '-30px',
          }}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {getIcon()}
            <span>{getMessage()}</span>
          </div>
        </div>
      )}
      
      <div
        {...contentsProps}
        className={cn(
          'transition-transform duration-300',
          pullDistance > 0 && !refreshing ? 'transition-none' : '',
          className,
          contentsProps?.className
        )}
        style={{
          transform: `translateY(${pullDistance}px)`,
          ...contentsProps?.style,
        }}
      >
        {children}
      </div>
    </div>
  );
};
