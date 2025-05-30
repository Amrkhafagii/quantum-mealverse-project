import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/responsive/core/hooks';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionStateIndicatorProps {
  showQuality?: boolean;
  position?: 'top' | 'bottom';
  alwaysShow?: boolean;
  variant?: 'slim' | 'normal';
}

export const ConnectionStateIndicator: React.FC<ConnectionStateIndicatorProps> = ({
  showQuality = true,
  position = 'top',
  alwaysShow = false,
  variant = 'normal'
}) => {
  const { isOnline, connectionType, wasOffline, resetWasOffline } = useConnectionStatus();
  const { quality, isLowQuality } = useNetworkQuality();
  const [visible, setVisible] = useState(false);
  const [wasOnline, setWasOnline] = useState(isOnline);
  
  // Show the indicator when connection state changes
  useEffect(() => {
    // If the connection state has changed
    if (isOnline !== wasOnline) {
      setVisible(true);
      
      // Hide after 5 seconds if we transitioned to online
      if (isOnline) {
        const timer = setTimeout(() => {
          setVisible(alwaysShow);
          resetWasOffline();
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
    
    setWasOnline(isOnline);
  }, [isOnline, wasOnline, alwaysShow, resetWasOffline]);
  
  // Keep visible when always show is true
  useEffect(() => {
    if (alwaysShow) {
      setVisible(true);
    }
  }, [alwaysShow]);
  
  const getBackgroundColor = () => {
    if (!isOnline) return 'bg-red-500/90';
    if (isLowQuality) return 'bg-amber-500/90';
    return 'bg-green-500/90';
  };
  
  const getIcon = () => {
    if (!isOnline) return <WifiOff className={variant === 'slim' ? 'h-3 w-3' : 'h-4 w-4'} />;
    if (isLowQuality) return <AlertTriangle className={variant === 'slim' ? 'h-3 w-3' : 'h-4 w-4'} />;
    if (wasOffline) return <Clock className={variant === 'slim' ? 'h-3 w-3' : 'h-4 w-4'} />;
    return <CheckCircle2 className={variant === 'slim' ? 'h-3 w-3' : 'h-4 w-4'} />;
  };
  
  const getMessage = () => {
    if (!isOnline) return 'Offline';
    if (isLowQuality) return 'Poor connection';
    if (wasOffline) return 'Back online';
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
          className={`fixed ${position === 'top' ? 'top-4' : 'bottom-4'} left-0 right-0 mx-auto z-40 flex justify-center pointer-events-none`}
        >
          <div className={`${getBackgroundColor()} text-white rounded-full shadow-lg flex items-center ${variant === 'slim' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1'} pointer-events-auto`}>
            {getIcon()}
            <span className="ml-1">{getMessage()}</span>
            {showQuality && quality && quality !== 'unknown' && variant !== 'slim' && (
              <span className="ml-1 text-xs opacity-80">({quality})</span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStateIndicator;
