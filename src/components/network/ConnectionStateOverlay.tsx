
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { cn } from '@/lib/utils';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { Platform } from '@/utils/platform';

interface ConnectionStateOverlayProps {
  position?: 'top' | 'bottom';
  autoDismiss?: boolean;
  onRetry?: () => void;
}

export const ConnectionStateOverlay: React.FC<ConnectionStateOverlayProps> = ({
  position = 'top',
  autoDismiss = true,
  onRetry
}) => {
  const { isOnline, wasOffline } = useConnectionStatus();
  const [showNotification, setShowNotification] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowNotification(true);
      if (Platform.isNative()) {
        hapticFeedback.error();
      }
    } else if (wasOffline && isOnline) {
      setShowNotification(true);
      if (Platform.isNative()) {
        hapticFeedback.success();
      }
      
      if (autoDismiss) {
        const timer = setTimeout(() => {
          setShowNotification(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline, wasOffline, autoDismiss]);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    if (Platform.isNative()) {
      await hapticFeedback.medium();
    }
    
    try {
      if (onRetry) {
        await onRetry();
      } else {
        // Simple connectivity test
        await fetch('/favicon.ico', { cache: 'no-store' });
      }
    } catch (error) {
      console.log('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const getNotificationContent = () => {
    if (!isOnline) {
      return {
        icon: <WifiOff className="h-4 w-4" />,
        message: 'No internet connection',
        description: 'Check your network settings',
        className: 'bg-red-500 text-white'
      };
    } else if (wasOffline) {
      return {
        icon: <Wifi className="h-4 w-4" />,
        message: 'Connection restored',
        description: 'You are back online',
        className: 'bg-green-500 text-white'
      };
    }
    return null;
  };

  const content = getNotificationContent();
  if (!content || !showNotification) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ 
          opacity: 0, 
          y: position === 'top' ? -100 : 100,
          scale: 0.95 
        }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: 1 
        }}
        exit={{ 
          opacity: 0, 
          y: position === 'top' ? -100 : 100,
          scale: 0.95 
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 400, 
          damping: 30 
        }}
        className={cn(
          'fixed left-4 right-4 z-50 mx-auto max-w-sm',
          position === 'top' ? 'top-4' : 'bottom-4'
        )}
      >
        <div className={cn(
          'rounded-lg p-4 shadow-lg backdrop-blur-sm',
          'border border-white/20',
          content.className
        )}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {content.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {content.message}
              </p>
              <p className="text-xs opacity-90">
                {content.description}
              </p>
            </div>
            {!isOnline && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Retry connection"
              >
                <RefreshCw 
                  className={cn(
                    'h-4 w-4',
                    isRetrying && 'animate-spin'
                  )} 
                />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
