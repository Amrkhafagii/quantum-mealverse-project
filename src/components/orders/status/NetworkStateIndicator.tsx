
import React, { useState, useEffect } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, WifiLow, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface NetworkStateIndicatorProps {
  showQuality?: boolean;
  position?: 'top' | 'bottom';
  alwaysShow?: boolean;
  variant?: 'slim' | 'normal';
}

export const NetworkStateIndicator: React.FC<NetworkStateIndicatorProps> = ({
  showQuality = true,
  position = 'top',
  alwaysShow = false,
  variant = 'normal'
}) => {
  const { isOnline, connectionType } = useConnectionStatus();
  const { quality, isFlaky, hasTransitioned } = useNetworkQuality();
  const [visible, setVisible] = useState(false);
  const [wasOnline, setWasOnline] = useState(isOnline);
  const [lastTransitionTime, setLastTransitionTime] = useState<number | null>(null);
  
  // Show the indicator when connection state changes
  useEffect(() => {
    // If the connection state has changed
    if (isOnline !== wasOnline) {
      setVisible(true);
      setLastTransitionTime(Date.now());
      
      // Hide after 5 seconds if we transitioned to online
      if (isOnline) {
        const timer = setTimeout(() => {
          setVisible(alwaysShow);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
    
    setWasOnline(isOnline);
  }, [isOnline, wasOnline, alwaysShow]);
  
  // Keep visible when flaky or always show is true
  useEffect(() => {
    if (alwaysShow || isFlaky || !isOnline) {
      setVisible(true);
    } else if (!alwaysShow && isOnline && !isFlaky) {
      // If we've been stable for a while, hide the indicator
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alwaysShow, isFlaky, isOnline]);
  
  const getBackgroundColor = () => {
    if (!isOnline) return 'bg-red-500/90';
    if (isFlaky) return 'bg-amber-500/90';
    if (quality === 'poor' || quality === 'very-poor') return 'bg-orange-400/90';
    if (quality === 'fair') return 'bg-amber-400/90';
    return 'bg-green-500/90';
  };
  
  const getIcon = () => {
    if (!isOnline) return <WifiOff className={variant === 'slim' ? 'h-3 w-3' : 'h-4 w-4'} />;
    if (isFlaky) return <AlertTriangle className={variant === 'slim' ? 'h-3 w-3' : 'h-4 w-4'} />;
    if (quality === 'poor' || quality === 'very-poor') return <WifiLow className={variant === 'slim' ? 'h-3 w-3' : 'h-4 w-4'} />;
    if (quality === 'excellent' || quality === 'good') return <CheckCircle2 className={variant === 'slim' ? 'h-3 w-3' : 'h-4 w-4'} />;
    return <Wifi className={variant === 'slim' ? 'h-3 w-3' : 'h-4 w-4'} />;
  };
  
  const getMessage = () => {
    if (!isOnline) return 'Offline mode';
    if (isFlaky) return 'Unstable connection';
    if (quality === 'poor' || quality === 'very-poor') return 'Poor connection';
    if (quality === 'fair') return 'Fair connection';
    if (quality === 'excellent') return 'Excellent connection';
    return 'Online';
  };
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
          transition={{ duration: 0.3 }}
          className={`fixed ${position === 'top' ? 'top-safe' : 'bottom-safe'} left-0 right-0 mx-auto z-40 flex justify-center pointer-events-none`}
        >
          <div className={`${getBackgroundColor()} text-white rounded-full shadow-lg flex items-center ${variant === 'slim' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1'} pointer-events-auto`}>
            {getIcon()}
            <span className="ml-1">{getMessage()}</span>
            {showQuality && quality !== 'unknown' && variant !== 'slim' && (
              <span className="ml-1 text-xs opacity-80">({quality})</span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
