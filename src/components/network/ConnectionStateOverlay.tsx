
import React, { useEffect, useState } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertTriangle, SignalLow } from 'lucide-react';

interface ConnectionStateOverlayProps {
  position?: 'top' | 'bottom' | 'float';
  theme?: 'light' | 'dark' | 'auto';
  autoDismiss?: boolean;
  dismissAfter?: number;
  showForNetworkChange?: boolean;
}

export function ConnectionStateOverlay({
  position = 'top',
  theme = 'auto',
  autoDismiss = true,
  dismissAfter = 5000,
  showForNetworkChange = true
}: ConnectionStateOverlayProps) {
  const { isOnline, wasOffline, connectionType } = useConnectionStatus();
  const { quality, hasTransitioned, isFlaky, metrics } = useNetworkQuality();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState<React.ReactNode | null>(null);
  const [color, setColor] = useState('bg-green-500');

  // Position styles
  const positionStyles = {
    top: 'top-safe left-0 right-0 mx-auto',
    bottom: 'bottom-safe left-0 right-0 mx-auto',
    float: 'bottom-safe right-safe'
  };

  // Effect to handle state changes and display appropriate messages
  useEffect(() => {
    // Connection restored after being offline
    if (isOnline && wasOffline) {
      setVisible(true);
      setMessage('Connection restored');
      setIcon(<Wifi className="h-4 w-4" />);
      setColor('bg-green-500');
    } 
    // Just went offline
    else if (!isOnline && !wasOffline) {
      setVisible(true);
      setMessage('Connection lost');
      setIcon(<WifiOff className="h-4 w-4" />);
      setColor('bg-red-500');
    }
    // Network quality changed significantly
    else if (showForNetworkChange && hasTransitioned) {
      setVisible(true);
      if (quality === 'poor' || quality === 'very-poor') {
        setMessage('Poor connection detected');
        setIcon(<SignalLow className="h-4 w-4" />);
        setColor('bg-amber-500');
      } else if (quality === 'excellent' || quality === 'good') {
        setMessage('Connection improved');
        setIcon(<Wifi className="h-4 w-4" />);
        setColor('bg-green-500');
      }
    }
    // Flaky connection detection
    else if (isFlaky && isOnline) {
      setVisible(true);
      setMessage('Unstable connection');
      setIcon(<AlertTriangle className="h-4 w-4" />);
      setColor('bg-amber-500');
    }
    
    // Auto dismiss after specified time
    if (visible && autoDismiss) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, dismissAfter);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, quality, hasTransitioned, isFlaky, autoDismiss, dismissAfter, showForNetworkChange]);

  // Handle manual dismiss
  const handleDismiss = () => {
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
          transition={{ duration: 0.3 }}
          className={`fixed ${positionStyles[position]} z-40 pointer-events-none`}
          onClick={handleDismiss}
        >
          <div className={`${color} text-white rounded-full shadow-md px-3 py-1 flex items-center m-2 pointer-events-auto`}>
            {icon}
            <span className="ml-2 text-sm font-medium">{message}</span>
            {metrics && metrics.latency && quality !== 'unknown' && (
              <span className="ml-2 text-xs opacity-80">{metrics.latency}ms</span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ConnectionStateOverlay;
